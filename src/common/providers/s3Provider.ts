/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import { Logger } from '@map-colonies/js-logger';
import { S3 } from 'aws-sdk';
import httpStatus from 'http-status-codes';
import { Provider, S3Config } from '../interfaces';
import { AppError } from '../appError';

export class S3Provider implements Provider {
  private readonly s3Instance: S3;

  public constructor(private readonly logger: Logger, private readonly config: S3Config) {
    this.s3Instance = new S3({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region: this.config.region,
    });
  }

  public async deleteFile(filePath: string): Promise<void> {
    const bucketName = this.config.bucket;
    if (!fs.existsSync(filePath)) {
      throw new AppError(httpStatus.BAD_REQUEST, `File ${filePath} doesn't exists in the agreed folder`, true);
    }
    try {
      await this.s3Instance
        .deleteObject({
          Bucket: bucketName,
          Key: filePath,
        })
        .promise();
      this.logger.debug(`File deleted successfully from S3: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3 - ${filePath}`);
      throw error;
    }
  }
}
