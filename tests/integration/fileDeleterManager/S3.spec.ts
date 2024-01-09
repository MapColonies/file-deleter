/* eslint-disable jest/no-conditional-expect */
import jsLogger from '@map-colonies/js-logger';
import { randFileExt, randWord } from '@ngneat/falso';
import { container } from 'tsyringe';
import config from 'config';
import { getApp } from '../../../src/app';
import { JOB_TYPE, SERVICES } from '../../../src/common/constants';
import { S3Config } from '../../../src/common/interfaces';
import { FileDeleterManager } from '../../../src/fileDeleterManager/fileDeleterManager';
import { createTask, taskHandlerMock } from '../../helpers/mockCreators';
import { S3Helper } from '../../helpers/s3Helper';

describe('fileDeleterManager S3', () => {
  let fileDeleterManager: FileDeleterManager;
  const s3Config = config.get<S3Config>('S3');
  let s3Helper: S3Helper;

  beforeAll(() => {
    getApp({
      override: [
        { token: SERVICES.TASK_HANDLER, provider: { useValue: taskHandlerMock } },
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.PROVIDER_CONFIG, provider: { useValue: s3Config } },
      ],
    });
    fileDeleterManager = container.resolve(FileDeleterManager);
    s3Helper = new S3Helper(s3Config);
  });

  beforeEach(async () => {
    await s3Helper.createBucket();
  });

  afterEach(async () => {
    await s3Helper.clearBucket();
    await s3Helper.deleteBucket();
    jest.clearAllMocks();
  });

  describe('start function', () => {
    it('should start the file deletion process for a task', async () => {
      const model = randWord();
      const file1 = `${randWord()}.${randFileExt()}`;
      const file2 = `${randWord()}.${randFileExt()}`;

      await s3Helper.createFileOfModel(model, file1);
      await s3Helper.createFileOfModel(model, file2);

      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      const task = createTask(model, paths);

      taskHandlerMock.dequeue.mockResolvedValue(task);
      taskHandlerMock.ack.mockResolvedValue(task);

      await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalledWith(JOB_TYPE, fileDeleterManager['taskType']);
      expect(taskHandlerMock.ack).toHaveBeenCalledWith(task.jobId, task.id);
    });

    it(`When didn't get task, should do nothing`, async () => {
      taskHandlerMock.dequeue.mockResolvedValue(null);

      await fileDeleterManager.start();

      expect(taskHandlerMock.ack).not.toHaveBeenCalled();
      expect(taskHandlerMock.reject).not.toHaveBeenCalled();
    });

    it('When get task, should start the sync process without errors', async () => {
      const model = randWord();
      const file1 = `${randWord()}.${randFileExt()}`;
      const file2 = `${randWord()}.${randFileExt()}`;
      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      const task = createTask(model, paths);

      taskHandlerMock.dequeue.mockResolvedValue(task);

      await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalledWith(JOB_TYPE, fileDeleterManager['taskType']);
    });
  });
});
