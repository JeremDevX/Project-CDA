import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";

let storageClient: S3Client | null = null;
const e2eStorageObjects = new Map<
  string,
  { body: Buffer; contentType: string }
>();

function getStorageClient() {
  if (
    !config.supabaseStorageEndpoint ||
    !config.supabaseS3AccessKeyId ||
    !config.supabaseS3SecretAccessKey
  ) {
    throw new Error("Configuration Supabase Storage S3 manquante");
  }

  if (!storageClient) {
    storageClient = new S3Client({
      endpoint: config.supabaseStorageEndpoint,
      region: config.supabaseS3Region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.supabaseS3AccessKeyId,
        secretAccessKey: config.supabaseS3SecretAccessKey,
      },
    });
  }

  return storageClient;
}

export async function uploadStorageObject(
  storagePath: string,
  body: Buffer,
  contentType: string,
) {
  if (config.e2eMockExternalServices) {
    e2eStorageObjects.set(storagePath, { body, contentType });
    return;
  }

  const client = getStorageClient();

  await client.send(
    new PutObjectCommand({
      Bucket: config.supabaseStorageBucket,
      Key: storagePath,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function createSignedStorageUrl(storagePath: string) {
  if (config.e2eMockExternalServices) {
    const object = e2eStorageObjects.get(storagePath);

    if (!object) {
      return null;
    }

    return `data:${object.contentType};base64,${object.body.toString("base64")}`;
  }

  const client = getStorageClient();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.supabaseStorageBucket,
      Key: storagePath,
    }),
    { expiresIn: 60 * 60 },
  );
}

export async function removeStorageObjects(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  if (config.e2eMockExternalServices) {
    storagePaths.forEach((storagePath) => e2eStorageObjects.delete(storagePath));
    return;
  }

  const client = getStorageClient();

  await client.send(
    new DeleteObjectsCommand({
      Bucket: config.supabaseStorageBucket,
      Delete: {
        Objects: storagePaths.map((storagePath) => ({ Key: storagePath })),
      },
    }),
  );
}
