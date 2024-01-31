import { ITaskResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import { randPastDate, randSoonDate, randUuid, randWord } from '@ngneat/falso';
import { TaskParameters } from '../../src/common/interfaces';
import { TASK_TYPE } from '../../src/common/constants';

export const createTask = (modelId?: string, paths?: string[]): ITaskResponse<TaskParameters> => {
  return {
    id: randUuid(),
    jobId: randUuid(),
    description: randWord(),
    parameters: createTaskParameters(modelId, paths),
    created: randPastDate().toString(),
    updated: randSoonDate().toString(),
    type: TASK_TYPE,
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

export const configProviderMock = {
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
