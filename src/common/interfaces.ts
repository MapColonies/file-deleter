import { S3 } from 'aws-sdk';

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
  endpointUrl: string;
  bucket: string;
  region: string;
  sslEnables: boolean;
  forcePathStyle: boolean;
  maxAttempts: number;
  sigVersion: string;
  storageClass?: S3.StorageClass;
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
