/* eslint-disable @typescript-eslint/naming-convention */
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { Provider, S3Config } from '../common/interfaces';
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
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.s3Config.bucket,
          Key: filePath,
        })
      );
      this.logger.debug(`File deleted successfully from S3: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3 - ${filePath}`);
      throw error;
    }
  }

  private createS3Instance(config: S3Config): S3Client {
    return new S3Client({
      endpoint: config.endpointUrl,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      region: config.region,
      maxAttempts: config.maxAttempts,
      tls: config.sslEnabled,
      forcePathStyle: config.forcePathStyle,
    });
  }
}
