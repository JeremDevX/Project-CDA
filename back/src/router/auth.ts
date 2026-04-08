import { Router } from "express";
import type { User as PrismaUser } from "../generated/prisma/client";

import { prisma } from "../database";
import { requireAuth } from "../middlewares/requireAuth";
import { comparePassword, hashPassword, signAccessToken } from "../utils/auth";

export const authRouter = Router();

const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeUser(user: PrismaUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

authRouter.post("/register", async (req, res) => {
  try {
    const username = normalizeString(req.body?.username);
    const email = normalizeEmail(req.body?.email);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({
          message: "Nom d'utilisateur, email et mot de passe sont requis",
        });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "L'email existe déjà" });
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    const safeUser = sanitizeUser(createdUser);
    const token = signAccessToken({
      id: Number(safeUser.id),
      username: String(safeUser.username),
      email: String(safeUser.email),
    });

    return res.status(201).json({ token, user: safeUser });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email ?? req.body?.identifier);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "L'email et le mot de passe sont requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "L'email ou le mot de passe est incorrect" });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "L'email ou le mot de passe est incorrect" });
    }

    const safeUser = sanitizeUser(user);
    const token = signAccessToken({
      id: Number(safeUser.id),
      username: String(safeUser.username),
      email: String(safeUser.email),
    });

    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
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

authRouter.post("/change-password", requireAuth, async (req, res) => {
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

authRouter.post("/logout", requireAuth, async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    await prisma.tokenBlacklist.upsert({
      where: { token },
      update: {},
      create: { token },
    });

    return res.json({ message: "Déconnecté" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
