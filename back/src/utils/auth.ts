import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import { config } from "../config";

export interface AuthTokenPayload {
  id: number;
  username: string;
  email: string;
}

export interface VerifiedAuthTokenPayload extends AuthTokenPayload {
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, config.saltRounds);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: AuthTokenPayload) {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

export function verifyAccessToken(token: string): VerifiedAuthTokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  const payload = decoded as JwtPayload & Partial<AuthTokenPayload>;
  if (
    typeof payload.id !== "number" ||
    typeof payload.username !== "string" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid token shape");
  }

  return {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    iat: payload.iat,
    exp: payload.exp,
  };
}
