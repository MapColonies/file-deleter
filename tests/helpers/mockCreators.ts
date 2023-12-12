import { ITaskResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import { randUuid, randWord } from '@ngneat/falso';
import { NFSConfig, ProviderConfig, ProvidersConfig, S3Config, TaskParameters } from '../../src/common/interfaces';

const fakeNFSConfig = (name: string): NFSConfig => {
  return { type: 'NFS', pvPath: `./tests/helpers/${name}` };
};

const fakeS3Config = (bucket: string): S3Config => {
  return {
    type: 'S3',
    accessKeyId: 'minioadmin',
    secretAccessKey: 'mininoadmin',
    endpointUrl: 'http://127.0.0.1:9000',
    bucket,
    region: 'us-east-1',
    forcePathStyle: true,
    sslEnables: false,
    maxAttempts: 3,
    sigVersion: 'v4',
  };
};

const fakeProvidersConfig = (source: string, dest: string): ProvidersConfig => {
  return {
    dest: FakeProvider(dest, 'dest-models'),
  };
};

const FakeProvider = (provider: string, name: string): ProviderConfig => {
  switch (provider) {
    case 's3':
      return fakeS3Config(name);
    case 'nfs':
      return fakeNFSConfig(name);
    default:
      throw Error('wrong values');
  }
};

export const createTask = (modelId?: string, paths?: string[]): ITaskResponse<TaskParameters> => {
  return {
    id: randUuid(),
    jobId: randUuid(),
    description: randWord(),
    parameters: createTaskParameters(modelId, paths),
    created: '2020',
    updated: '2022',
    type: 'tilesDeleting',
    status: OperationStatus.IN_PROGRESS,
    reason: randWord(),
    attempts: 0,
    resettable: true,
  };
};

export const createTaskParameters = (modelId?: string, paths?: string[]): TaskParameters => {
  return {
    paths: paths ? paths : [randWord(), randWord()],
    modelId: modelId ?? randUuid(),
    lastIndexError: -1,
  };
};

export const taskHandlerMock = {
  jobManagerClient: {
    updateTask: jest.fn(),
  },
  waitForTask: jest.fn(),
  ack: jest.fn(),
  reject: jest.fn(),
  dequeue: jest.fn(),
};

export const providerManagerMock = {
  dest: {
    deleteFile: jest.fn(),
  },
};

export const fileDeleterManagerMock = {
  sendFilesToCloudProvider: jest.fn(),
  rejectJobManager: jest.fn(),
};

export const jobsManagerMock = {
  waitForTask: jest.fn(),
  ack: jest.fn(),
  reject: jest.fn(),
};

export const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

export const mockNFStNFS = fakeProvidersConfig('nsf', 'nfs') as { dest: NFSConfig };
export const mockS3tS3 = fakeProvidersConfig('s3', 's3') as { dest: S3Config };