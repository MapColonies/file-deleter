/* eslint-disable @typescript-eslint/naming-convention */
import { DeleteObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
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
    @inject(SERVICES.LOGGER) protected readonly logger: Logger
  ) {
    this.s3 = this.createS3Instance(s3Config);
  }

  public async deleteFile(filePath: string): Promise<void> {
    const bucketName = this.s3Config.bucket;
    const result = await this.isFileExist(filePath);
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, `File ${filePath} doesn't exist in the agreed folder`, true);
    }
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: filePath,
        })
      );
      await this.isFileExist(filePath);
      this.logger.debug(`File deleted successfully from S3: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3 - ${filePath}`);
      throw error;
    }
  }

  private async isFileExist(filePath: string): Promise<boolean> {
    const params = {
      Bucket: this.s3Config.bucket,
      Key: filePath,
    };

    try {
      await this.s3.send(new HeadObjectCommand(params));
      this.logger.error(`File ${filePath} exists in the bucket.`);
      return true;
    } catch (error) {
      this.logger.error(`File ${filePath} does not exist in the bucket`);
      return false;
    }
  }

  private createS3Instance(config: S3Config): S3Client {
    return new S3Client({
      endpoint: config.endPointUrl,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      region: config.region,
      maxAttempts: config.maxAttempts,
      tls: config.tls,
      forcePathStyle: config.forcePathStyle,
    });
  }
}
