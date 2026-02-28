import { uploadBuffer, getPublicUrl } from "../config/s3Client.js";

const BUCKET = process.env.S3_BUCKET;

/* ================= UPLOAD FILE TO S3 ================= */
export const uploadFile = async (
  fileName,
  buffer,
  contentType
) => {
  if (!BUCKET) {
    throw new Error("S3_BUCKET not configured");
  }

  await uploadBuffer(
    BUCKET,
    fileName,
    buffer,
    contentType
  );

  return getPublicUrl(BUCKET, fileName);
};