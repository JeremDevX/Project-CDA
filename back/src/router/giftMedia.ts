import crypto from "node:crypto";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { config } from "../config";
import { prisma } from "../database";
import { getMediaLimit, isMediaType } from "../helpers/offerMediaLimits";
import { requireAuth } from "../middlewares/requireAuth";
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

giftMediaRouter.get("/:giftId/media", requireAuth, async (req, res) => {
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
    });

    const mediasWithUrls = await Promise.all(
      medias.map(async (media) => {
        return {
          id: media.id,
          type: media.type,
          url: await createSignedStorageUrl(media.storagePath),
          originalName: media.originalName,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
          createdAt: media.createdAt,
        };
      }),
    );

    return res.json({ medias: mediasWithUrls });
  } catch (error) {
    console.error("Erreur lors de la recuperation des medias:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftMediaRouter.post(
  "/:giftId/media",
  requireAuth,
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
        where: { giftId, type: mediaType },
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
          giftId,
          type: mediaType,
          storagePath,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        },
      });

      return res.status(201).json({
        media: {
          id: media.id,
          type: media.type,
          url: await createSignedStorageUrl(media.storagePath),
          originalName: media.originalName,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
          createdAt: media.createdAt,
        },
      });
    } catch (error) {
      if (uploadedStoragePath) {
        await removeStorageObjects([uploadedStoragePath]);
      }

      console.error("Erreur lors de l'upload du media:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftMediaRouter.delete(
  "/:giftId/media/:mediaId",
  requireAuth,
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
      });

      if (!media) {
        return res.status(404).json({ message: "Media introuvable" });
      }

      await removeStorageObjects([media.storagePath]);

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
