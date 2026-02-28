import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ================= UPLOAD BUFFER ================= */
export const uploadBuffer = async (
  bucket,
  key,
  buffer,
  contentType
) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(params));
};

/* ================= GET PUBLIC URL ================= */
export const getPublicUrl = (bucket, key) => {
  return `https://${bucket}.s3.${REGION}.amazonaws.com/${encodeURIComponent(
    key
  )}`;
};