import "dotenv/config";

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid numeric env var: ${name}`);
  }

  return value;
}

export const config = {
  port: readNumberEnv("PORT", 1337),
  saltRounds: readNumberEnv("SALT_ROUNDS", 10),
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
} as const;
