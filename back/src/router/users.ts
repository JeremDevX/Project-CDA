import { Router } from "express";
import type { User as PrismaUser } from "../generated/prisma/client";

import { prisma } from "../database";
import { comparePassword, hashPassword } from "../utils/auth";

export const usersRouter = Router();

const MIN_PASSWORD_LENGTH = 6;

function sanitizeUser(user: PrismaUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

usersRouter.get("/me", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

usersRouter.post("/change-password", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const currentPassword =
      typeof req.body?.currentPassword === "string"
        ? req.body.currentPassword
        : "";
    const newPassword =
      typeof req.body?.newPassword === "string"
        ? req.body.newPassword
        : typeof req.body?.password === "string"
          ? req.body.password
          : "";
    const confirmPassword =
      typeof req.body?.confirmPassword === "string"
        ? req.body.confirmPassword
        : typeof req.body?.passwordConfirmation === "string"
          ? req.body.passwordConfirmation
          : "";

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Le mot de passe actuel, le nouveau mot de passe et la confirmation du nouveau mot de passe sont requis",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les nouveaux mots de passe ne correspondent pas" });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isValidPassword = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ message: "Le mot de passe actuel est incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Mot de passe modifié" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
