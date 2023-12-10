import { S3 } from 'aws-sdk';
import { NFSProvider } from '../providers/nfsProvider';
import { S3Provider } from '../providers/s3Provider';

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
  type: 'S3';
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
  type: 'NFS';
  pvPath: string;
}

export interface ProviderManager {
  source: S3Provider | NFSProvider;
  dest: S3Provider | NFSProvider;
}

export interface ProvidersConfig {
  source: ProvidersConfig;
  dest: ProvidersConfig;
}

export type ProviderConfig = S3Config | NFSConfig;

export interface ProviderMap {
  [key: string]: Provider;
}

export interface Provider {
  deleteFile: (fileName: string) => Promise<void>;
}

export interface TaskResult {
  completed: boolean;
  index: number;
  error?: Error;
}
