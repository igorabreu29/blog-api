import { env } from "@/env/index.ts";
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
})