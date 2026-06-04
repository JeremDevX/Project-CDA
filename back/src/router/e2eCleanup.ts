import { Router } from "express";

import { prisma } from "../database";
import { normalizeEmail } from "../helpers/validation";
import { removeStorageObjects } from "../services/supabaseStorage";

export const e2eCleanupRouter = Router();

function isE2eUserEmail(email: string) {
  return email.startsWith("legacygift.e2e.") && email.endsWith("@example.test");
}

e2eCleanupRouter.delete("/users", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email || !isE2eUserEmail(email)) {
      return res.status(400).json({ message: "Email e2e invalide" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        mediaAssets: {
          select: { storagePath: true },
        },
      },
    });

    if (!user) {
      return res.json({ deletedUsers: 0, deletedStorageObjects: 0 });
    }

    const storagePaths = user.mediaAssets.map((asset) => asset.storagePath);
    await removeStorageObjects(storagePaths);

    const result = await prisma.user.deleteMany({
      where: { id: user.id },
    });

    return res.json({
      deletedUsers: result.count,
      deletedStorageObjects: storagePaths.length,
    });
  } catch (error) {
    console.error("Erreur lors du nettoyage e2e:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
