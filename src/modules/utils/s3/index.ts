import { S3_CLOUDFRONT_URL } from 'src/common';

export function getS3FileUrl(
  fileKey: string | null | undefined,
): string | null {
  if (!fileKey) {
    return null;
  }
  return `${S3_CLOUDFRONT_URL.replace(/\/$/, '').trim()}/${fileKey}`;
}
