import crypto from 'crypto';

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicMediaUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

export class StorageService {
  /**
   * Generates Direct-to-Bucket Presigned PUT URL for Cloudflare R2 / AWS S3.
   * Client uploads directly from browser; server never proxies media buffers.
   */
  async generatePresignedPutUrl(
    filename: string,
    contentType = 'image/webp',
    folder = 'uploads'
  ): Promise<PresignedUrlResponse> {
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(6).toString('hex');
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `${folder}/${timestamp}-${randomHex}-${cleanFilename}`;

    const bucketName = process.env.S3_BUCKET_NAME || 'al-souq-media';
    const s3Endpoint = process.env.S3_ENDPOINT || 'https://r2.cloudflarestorage.com';
    const cdnBaseUrl = process.env.MEDIA_CDN_URL || 'https://media.alsouq.community';

    // Mock/Simulated S3 Presigned URL with AWS signature query params
    const expires = 900; // 15 mins
    const signature = crypto.randomBytes(16).toString('hex');
    const uploadUrl = `${s3Endpoint}/${bucketName}/${objectKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expires}&X-Amz-Signature=${signature}`;
    const publicMediaUrl = `${cdnBaseUrl}/${objectKey}`;

    return {
      uploadUrl,
      publicMediaUrl,
      objectKey,
      expiresInSeconds: expires,
    };
  }
}

export const storageService = new StorageService();
