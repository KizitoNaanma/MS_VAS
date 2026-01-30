import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import {
  S3_BUCKET_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_BUCKET_REGION,
  S3_BUCKET_SECRET_KEY,
} from 'src/common';
import { getS3FileUrl } from 'src/modules/utils';

@Injectable()
export class S3StorageService {
  private readonly s3Client = new S3Client({
    region: S3_BUCKET_REGION,
    credentials: {
      accessKeyId: S3_BUCKET_ACCESS_KEY,
      secretAccessKey: S3_BUCKET_SECRET_KEY,
    },
  });

  async uploadFile(file: Express.Multer.File, filename?: string) {
    // Generate a unique filename
    const uniqueFileName = filename
      ? filename
      : `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype, // This helps browsers handle the file correctly
    });

    const response = await this.s3Client.send(command);
    return {
      ...response,
      Key: uniqueFileName,
    };
  }

  async getFile(fileName: string) {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    const response = await this.s3Client.send(command);
    return response;
  }

  getFileUrl(fileKey: string) {
    // doing this to reuse the logic in the utils function
    return getS3FileUrl(fileKey);
  }

  async generatePresignedUrl(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
    });

    const response = getSignedUrl(this.s3Client as any, command, {
      expiresIn: 60 * 15, // seconds multiplied by 15 minutes
    });
    return response;
  }

  /**
   * Extract the S3 key from a full URL
   * @param url - The full URL of the file
   * @returns The S3 key of the file
   */
  public extractFileKey(url: string) {
    // Extract the S3 key from a full URL
    // Example URL: https://religious-notification-data.s3.eu-west-1.amazonaws.com/mindfulness-resources/christian/discipleship/living_a_christ_centered_life.mp3
    try {
      const urlObj = new URL(url);
      // Remove the leading slash and return everything after the domain
      return urlObj.pathname.substring(1);
    } catch (error) {
      // If the URL is already in key format, return as is
      return url;
    }
  }
}
