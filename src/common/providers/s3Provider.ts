import { Logger } from "@map-colonies/js-logger";
import { S3 } from 'aws-sdk';
import { Provider, S3Config } from "../interfaces";

export class S3Provider implements Provider {
    private readonly s3Instance: S3;

    private constructor(private readonly logger:Logger, private readonly config: S3Config) {
        this.s3Instance = new S3 ({
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey,
            region: this.config.region,
        });
    }

    public async deleteFile(filePath: string): Promise<void>{
        const bucketName = this.config.bucket;

        try {
            const fileExists = await this.s3Instance.headObject({ Bucket: bucketName, Key: filePath}).promise();
            if (!fileExists){
                this.logger.error(`File not found in S3: ${filePath}`);
                throw new Error(`File not found in S3: ${filePath}`);  
            }
            await this.s3Instance.deleteObject({
                Bucket: bucketName,
                Key: filePath,
            }).promise();
            this.logger.debug(`File deleted successfully from S3: ${filePath}`);
        } catch (error) {
            this.logger.error(`Error deleting file from S3 - ${filePath}: ${error.message}`)
            throw error;
        }
    }
}