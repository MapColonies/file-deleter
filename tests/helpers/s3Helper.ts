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
  GetObjectCommandInput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { randSentence } from '@ngneat/falso';
import { S3Config } from '../../src/common/interfaces';

export class S3Helper {
  private readonly s3: S3Client;

  public constructor(private readonly config: S3Config) {
    const s3ClientConfig: S3ClientConfig = {
      endpoint: this.config.endpointUrl,
      forcePathStyle: this.config.forcePathStyle,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      region: this.config.region,
    };
    this.s3 = new S3Client(s3ClientConfig);
  }

  public async createBucket(bucket = this.config.bucket): Promise<void> {
    const params: CreateBucketCommandInput = {
      Bucket: bucket,
    };
    const command = new CreateBucketCommand(params);
    await this.s3.send(command);
  }

  public async deleteBucket(bucket = this.config.bucket): Promise<void> {
    const params: DeleteBucketCommandInput = {
      Bucket: bucket,
    };
    const command = new DeleteBucketCommand(params);
    await this.s3.send(command);
  }

  public async createFileOfModel(model: string, file: string): Promise<string> {
    const data = Buffer.from(randSentence());
    const params: PutObjectCommandInput = {
      Bucket: this.config.bucket,
      Key: `${model}/${file}`,
      Body: data,
    };
    await this.s3.send(new PutObjectCommand(params));
    const s3Content = data.toString('utf-8');
    return s3Content;
  }

  public async clearBucket(bucket = this.config.bucket): Promise<void> {
    const params: ListObjectsRequest = {
      Bucket: bucket,
    };
    const listObject = new ListObjectsCommand(params);
    const data = await this.s3.send(listObject);
    if (data.Contents) {
      for (const dataContent of data.Contents) {
        if (dataContent.Key != undefined) {
          await this.deleteObject(bucket, dataContent.Key);
        }
      }
    }
  }

  public async deleteObject(bucket: string, key: string): Promise<void> {
    const params: DeleteObjectCommandInput = {
      Bucket: bucket,
      Key: key,
    };
    const command = new DeleteObjectCommand(params);
    await this.s3.send(command);
  }

  public async readFile(bucket: string, key: string): Promise<Buffer | undefined> {
    const params: GetObjectCommandInput = {
      Bucket: bucket,
      Key: key,
    };
    const response = await this.s3.send(new GetObjectCommand(params));
    return response.Body?.transformToString() as unknown as Buffer;
  }

  public async fileExists(bucket: string, filePath: string): Promise<boolean> {
    const params = {
      Bucket: bucket,
      Key: filePath,
    };

    return this.s3
      .send(new HeadObjectCommand(params))
      .then(() => {
        return true; // File exists
      })
      .catch((error) => {
        return false; // File does not exist
      });
  }

  public killS3(): void {
    this.s3.destroy();
  }
}
