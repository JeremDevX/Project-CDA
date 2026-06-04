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

const port = readNumberEnv("PORT", 1337);

export const config = {
  port,
  saltRounds: readNumberEnv("SALT_ROUNDS", 10),
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  e2eCleanupEnabled: process.env.E2E_CLEANUP_ENABLED === "true",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
  apiBaseUrl: process.env.API_BASE_URL ?? `http://localhost:${port}/api`,
  emailFrom: process.env.EMAIL_FROM ?? "LegacyGift <no-reply@legacygift.local>",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: readNumberEnv("SMTP_PORT", 587),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "gift-media",
  supabaseStorageEndpoint:
    process.env.SUPABASE_STORAGE_ENDPOINT ?? process.env.SUPABASE_URL ?? "",
  supabaseS3Region: process.env.SUPABASE_S3_REGION ?? "eu-west-1",
  supabaseS3AccessKeyId:
    process.env.SUPABASE_S3_ACCESS_KEY_ID ?? process.env.ACCESS_KEY_ID ?? "",
  supabaseS3SecretAccessKey:
    process.env.SUPABASE_S3_SECRET_ACCESS_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "",
  mediaMaxFileSizeBytes: readNumberEnv(
    "MEDIA_MAX_FILE_SIZE_BYTES",
    5 * 1024 * 1024,
  ),
} as const;
