/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import { DeleteObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Logger } from '@map-colonies/js-logger';
import httpStatus from 'http-status-codes';
import { inject, injectable } from 'tsyringe';
import { Provider, S3Config } from '../common/interfaces';
import { AppError } from '../common/appError';
import { SERVICES } from '../common/constants';

@injectable()
export class S3Provider implements Provider {
  private readonly s3: S3Client;

  public constructor(
    @inject(SERVICES.PROVIDER_CONFIG) protected readonly s3Config: S3Config,
    @inject(SERVICES.LOGGER) protected readonly logger: Logger, 
    ){
      const s3ClientConfig: S3ClientConfig = {
        endpoint: this.s3Config.endpointUrl,
        forcePathStyle: this.s3Config.forcePathStyle,
        credentials: {
          accessKeyId: this.s3Config.accessKeyId,
          secretAccessKey: this.s3Config.secretAccessKey,
        },
        region: this.s3Config.region,
      };
      this.s3 = new S3Client(s3ClientConfig);
    }
  
  public async deleteFile(filePath: string): Promise<void> {
    const bucketName = this.s3Config.bucket;
    if (!fs.existsSync(filePath)) {
      throw new AppError(httpStatus.BAD_REQUEST, `File ${filePath} doesn't exists in the agreed folder`, true);
    }
    try {
      await this.s3.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        }));
      this.logger.debug(`File deleted successfully from S3: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3 - ${filePath}`);
      throw error;
    }
  }
}
