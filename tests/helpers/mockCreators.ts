import { ITaskResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import { randUuid, randWord } from '@ngneat/falso';
import { NFSConfig, S3Config, TaskParameters } from '../../src/common/interfaces';

const fakeNFSConfig = (name: string): NFSConfig => {
  return { pvPath: `./tests/helpers/${name}` };
};

const fakeS3Config = (bucket: string): S3Config => {
  return {
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

export const providerMock = {
  deleteFile: jest.fn(),
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
