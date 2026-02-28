const { uploadBuffer, getPublicUrl } = require('../config/s3Client');

const BUCKET = process.env.S3_BUCKET;
if (!BUCKET) {
  // allow runtime error elsewhere if not provided
}

async function uploadFile(fileName, buffer, contentType) {
  if (!BUCKET) throw new Error('S3_BUCKET not configured');
  await uploadBuffer(BUCKET, fileName, buffer, contentType);
  return getPublicUrl(BUCKET, fileName);
}

module.exports = { uploadFile };
