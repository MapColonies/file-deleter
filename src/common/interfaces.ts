import { StorageClass } from '@aws-sdk/client-s3';

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface TaskParameters {
  paths: string[];
  modelId: string;
  lastIndexError: number;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  endPointUrl: string;
  bucket: string;
  region: string;
  sslEnabled: boolean;
  forcePathStyle: boolean;
  maxAttempts: number;
  sigVersion: string;
  storageClass?: StorageClass;
}

export interface NFSConfig {
  pvPath: string;
}

export type ProviderConfig = S3Config | NFSConfig;

export interface Provider {
  deleteFile: (filePath: string) => Promise<void>;
}

export interface TaskResult {
  completed: boolean;
  index: number;
  error?: Error;
}
