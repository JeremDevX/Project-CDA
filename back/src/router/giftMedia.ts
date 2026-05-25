import crypto from "node:crypto";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { prisma } from "../database";
import { getMediaLimit, isMediaType } from "../helpers/offerMediaLimits";
import {
  createSignedStorageUrl,
  removeStorageObjects,
  uploadStorageObject,
} from "../services/supabaseStorage";
import type { NextFunction, Request, Response } from "express";

export const giftMediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.mediaMaxFileSizeBytes,
  },
});

const allowedMimeTypes = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
} as const;

async function buildMediaResponse(media: {
  id: number;
  createdAt: Date;
  mediaAsset: {
    type: string;
    storagePath: string;
    originalName: string | null;
    mimeType: string;
    sizeBytes: number;
  };
}) {
  return {
    id: media.id,
    type: media.mediaAsset.type,
    url: await createSignedStorageUrl(media.mediaAsset.storagePath),
    originalName: media.mediaAsset.originalName,
    mimeType: media.mediaAsset.mimeType,
    sizeBytes: media.mediaAsset.sizeBytes,
    createdAt: media.createdAt,
  };
}

async function buildLibraryImageResponse(asset: {
  id: number;
  type: string;
  storagePath: string;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  giftMedias: { giftId: number }[];
}) {
  return {
    id: asset.id,
    type: asset.type,
    url: await createSignedStorageUrl(asset.storagePath),
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    createdAt: asset.createdAt,
    isAlreadyLinked: asset.giftMedias.length > 0,
  };
}

giftMediaRouter.get("/:giftId/media", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    const gift = await prisma.gift.findFirst({
      where: { id: giftId, userId },
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    const medias = await prisma.giftMedia.findMany({
      where: { giftId },
      orderBy: { createdAt: "asc" },
      include: {
        mediaAsset: true,
      },
    });

    const mediasWithUrls = await Promise.all(medias.map(buildMediaResponse));

    return res.json({ medias: mediasWithUrls });
  } catch (error) {
    console.error("Erreur lors de la recuperation des medias:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftMediaRouter.get("/:giftId/media/library", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    const gift = await prisma.gift.findFirst({
      where: { id: giftId, userId },
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    const userImages = await prisma.mediaAsset.findMany({
      where: {
        userId,
        type: "image",
      },
      orderBy: { createdAt: "desc" },
      include: {
        giftMedias: {
          where: { giftId },
          select: { giftId: true },
        },
      },
    });

    const libraryImages = await Promise.all(
      userImages.map(buildLibraryImageResponse),
    );

    return res.json({ images: libraryImages });
  } catch (error) {
    console.error("Erreur lors de la recuperation des images:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftMediaRouter.post(
  "/:giftId/media",
  upload.single("file"),
  async (req, res) => {
    let uploadedStoragePath: string | null = null;

    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);
      const mediaType = req.body?.type;

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId)) {
        return res.status(400).json({ message: "Gift invalide" });
      }

      if (!isMediaType(mediaType)) {
        return res.status(400).json({ message: "Type de media invalide" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Fichier manquant" });
      }

      if (!allowedMimeTypes[mediaType].includes(req.file.mimetype as never)) {
        return res
          .status(400)
          .json({ message: "Format de fichier non autorise" });
      }

      const gift = await prisma.gift.findFirst({
        where: { id: giftId, userId },
      });

      if (!gift) {
        return res.status(404).json({ message: "Gift introuvable" });
      }

      const limit = getMediaLimit(gift.offer, mediaType);

      if (limit === undefined) {
        return res
          .status(400)
          .json({ message: "Offre requise avant ajout de media" });
      }

      if (limit === 0) {
        return res
          .status(403)
          .json({ message: "Media non autorise par cette offre" });
      }

      const currentCount = await prisma.giftMedia.count({
        where: { giftId, mediaAsset: { type: mediaType } },
      });

      if (limit !== null && currentCount >= limit) {
        return res.status(400).json({ message: "Limite de medias atteinte" });
      }

      const extension = path.extname(req.file.originalname).toLowerCase();
      const storagePath = `${userId}/${giftId}/${mediaType}/${crypto.randomUUID()}${extension}`;

      await uploadStorageObject(
        storagePath,
        req.file.buffer,
        req.file.mimetype,
      );
      uploadedStoragePath = storagePath;

      const media = await prisma.giftMedia.create({
        data: {
          gift: {
            connect: { id: giftId },
          },
          mediaAsset: {
            create: {
              userId,
              type: mediaType,
              storagePath,
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              sizeBytes: req.file.size,
            },
          },
        },
        include: {
          mediaAsset: true,
        },
      });

      return res.status(201).json({ media: await buildMediaResponse(media) });
    } catch (error) {
      if (uploadedStoragePath) {
        await removeStorageObjects([uploadedStoragePath]);
      }

      console.error("Erreur lors de l'upload du media:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftMediaRouter.post("/:giftId/media/reuse", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);
    const sourceMediaId = Number(req.body?.sourceMediaId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }

    if (!Number.isInteger(giftId) || !Number.isInteger(sourceMediaId)) {
      return res.status(400).json({ message: "Media invalide" });
    }

    const gift = await prisma.gift.findFirst({
      where: { id: giftId, userId },
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    const sourceMedia = await prisma.mediaAsset.findFirst({
      where: {
        id: sourceMediaId,
        userId,
        type: "image",
      },
    });

    if (!sourceMedia) {
      return res.status(404).json({ message: "Image introuvable" });
    }

    const limit = getMediaLimit(gift.offer, "image");

    if (limit === undefined) {
      return res
        .status(400)
        .json({ message: "Offre requise avant ajout de media" });
    }

    if (limit === 0) {
      return res
        .status(403)
        .json({ message: "Image non autorisee par cette offre" });
    }

    const currentCount = await prisma.giftMedia.count({
      where: { giftId, mediaAsset: { type: "image" } },
    });

    if (limit !== null && currentCount >= limit) {
      return res.status(400).json({ message: "Limite de medias atteinte" });
    }

    const existingMedia = await prisma.giftMedia.findFirst({
      where: {
        giftId,
        mediaAssetId: sourceMedia.id,
      },
    });

    if (existingMedia) {
      return res.status(400).json({ message: "Image deja ajoutee" });
    }

    const media = await prisma.giftMedia.create({
      data: {
        giftId,
        mediaAssetId: sourceMedia.id,
      },
      include: {
        mediaAsset: true,
      },
    });

    return res.status(201).json({ media: await buildMediaResponse(media) });
  } catch (error) {
    console.error("Erreur lors de la reutilisation du media:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftMediaRouter.delete(
  "/:giftId/media/library/:mediaAssetId",
  async (req, res) => {
    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);
      const mediaAssetId = Number(req.params.mediaAssetId);

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId) || !Number.isInteger(mediaAssetId)) {
        return res.status(400).json({ message: "Image invalide" });
      }

      const gift = await prisma.gift.findFirst({
        where: { id: giftId, userId },
      });

      if (!gift) {
        return res.status(404).json({ message: "Gift introuvable" });
      }

      const mediaAsset = await prisma.mediaAsset.findFirst({
        where: {
          id: mediaAssetId,
          userId,
          type: "image",
        },
      });

      if (!mediaAsset) {
        return res.status(404).json({ message: "Image introuvable" });
      }

      await removeStorageObjects([mediaAsset.storagePath]);
      await prisma.mediaAsset.delete({
        where: { id: mediaAsset.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftMediaRouter.delete(
  "/:giftId/media/:mediaId",
  async (req, res) => {
    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);
      const mediaId = Number(req.params.mediaId);

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId) || !Number.isInteger(mediaId)) {
        return res.status(400).json({ message: "Media invalide" });
      }

      const media = await prisma.giftMedia.findFirst({
        where: {
          id: mediaId,
          giftId,
          gift: { userId },
        },
        include: {
          mediaAsset: true,
        },
      });

      if (!media) {
        return res.status(404).json({ message: "Media introuvable" });
      }

      await prisma.giftMedia.delete({
        where: { id: media.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du media:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftMediaRouter.use(
  (error: Error, _req: Request, res: Response, next: NextFunction) => {
    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        message: "Le fichier ne doit pas depasser 5 MB",
      });
    }

    return next(error);
  },
);
