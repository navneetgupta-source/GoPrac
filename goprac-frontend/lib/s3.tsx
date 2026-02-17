// lib/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Use environment variables for config
const REGION = process.env.AWS_S3_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Validate environment variables
if (!REGION || !BUCKET || !ACCESS_KEY || !SECRET_KEY) {
  const missing: string[] = [];
  if (!REGION) missing.push('AWS_S3_REGION');
  if (!BUCKET) missing.push('AWS_S3_BUCKET');
  if (!ACCESS_KEY) missing.push('AWS_ACCESS_KEY_ID');
  if (!SECRET_KEY) missing.push('AWS_SECRET_ACCESS_KEY');
  
  throw new Error(
    `Missing required AWS environment variables: ${missing.join(', ')}. ` +
    `Please check your .env.local file.`
  );
}

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

interface PresignParams {
  key: string;           // e.g. "images/your-file-name.jpg"
  contentType: string;   // e.g. "image/jpeg"
}

export async function getPresignedUploadUrl(params: PresignParams) {
  const { key, contentType } = params;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      // Optionally you can set ACL (e.g. "public-read") or metadata
      // ACL: "public-read",
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5, // 5 minutes (adjust as needed)
    });

    return signedUrl;
  } catch (error: any) {
    console.error("❌ S3 Presigned URL Error:", error);
    throw new Error(`Failed to generate S3 presigned URL: ${error?.message || String(error)}`);
  }
}
