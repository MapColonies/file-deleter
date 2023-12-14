/* eslint-disable @typescript-eslint/naming-convention */
import {
  CreateBucketCommandInput,
  CreateBucketCommand,
  S3Client,
  S3ClientConfig,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteBucketCommandInput,
  DeleteBucketCommand,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
  ListObjectsRequest,
  ListObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { randSentence } from '@ngneat/falso';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../src/common/constants';
import { S3Config } from '../../src/common/interfaces';

@injectable()
export class S3Helper {
  private readonly s3: S3Client;

  public constructor(@inject(SERVICES.PROVIDER_CONFIG) protected readonly s3Config: S3Config) {
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

  public async createBucket(bucket = this.s3Config.bucket): Promise<void> {
    const params: CreateBucketCommandInput = {
      Bucket: bucket,
    };
    const command = new CreateBucketCommand(params);
    await this.s3.send(command);
  }

  public async deleteBucket(bucket = this.s3Config.bucket): Promise<void> {
    const params: DeleteBucketCommandInput = {
      Bucket: bucket,
    };
    const command = new DeleteBucketCommand(params);
    await this.s3.send(command);
  }

  public async createFileOfModel(model: string, file: string): Promise<void> {
    const params: PutObjectCommandInput = {
      Bucket: this.s3Config.bucket,
      Key: `${model}/${file}`,
      Body: Buffer.from(randSentence()),
    };
    const command = new PutObjectCommand(params);
    await this.s3.send(command);
  }

  public async clearBucket(bucket = this.s3Config.bucket): Promise<void> {
    const params: ListObjectsRequest = {
      Bucket: bucket,
    };
    const listObject = new ListObjectsCommand(params);
    const data = await this.s3.send(listObject);
    if (data.Contents) {
      for (const dataContent of data.Contents) {
        if (dataContent.Key != undefined) {
          await this.deleteObject(dataContent.Key);
        }
      }
    }
  }

  public async deleteObject(key: string): Promise<void> {
    const params: DeleteObjectCommandInput = {
      Bucket: this.s3Config.bucket,
      Key: key,
    };
    const command = new DeleteObjectCommand(params);
    await this.s3.send(command);
  }

  public killS3(): void {
    this.s3.destroy();
  }

  public async FileExist(bucketName: string, filePath: string): Promise<boolean> {
    const params = {
      Bucket: bucketName,
      Key: filePath,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.s3.send(new HeadObjectCommand(params));
      return true; // File exists
    } catch (err) {
      if (err === 'NotFound') {
        return false; // File does not exist
      }
      console.error('Error checking file existence:', err);
      return false; // Assume file does not exist in case of an error
    }
  }
}
