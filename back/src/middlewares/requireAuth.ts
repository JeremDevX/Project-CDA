import { NextFunction, Request, Response } from "express";

import { prisma } from "../database";
import { verifyAccessToken } from "../utils/auth";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: "authorization header is required" });
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "invalid authorization format" });
  }

  const blacklistedToken = await prisma.tokenBlacklist.findUnique({ where: { token } });
  if (blacklistedToken) {
    return res.status(401).json({ message: "token has been revoked" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.token = token;
    req.authUser = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}
