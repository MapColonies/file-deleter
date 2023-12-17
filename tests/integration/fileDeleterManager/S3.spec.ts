/* eslint-disable jest/no-conditional-expect */
import jsLogger from '@map-colonies/js-logger';
import { randFileExt, randWord } from '@ngneat/falso';
import { container } from 'tsyringe';
import config from 'config';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
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
      await s3Helper.createFileOfModel(model, file1);

      const fileContent = await s3Helper.createFileOfModel(model, file2);

      if (typeof fileContent === 'string') {
        const bufferedContent = Buffer.from(fileContent);
        const paths = [`${model}/${file1}`, `${model}/${file2}`];
        taskHandlerMock.dequeue.mockResolvedValue(createTask(model, paths));

        await fileDeleterManager.start();
        const result = await s3Helper.readFile(s3Config.bucket,`${model}/${file2}` )

        expect(taskHandlerMock.ack).toHaveBeenCalled();
        expect(result).toStrictEqual(bufferedContent);
      }
    });

    it(`When can't read file, should increase task's retry and update job manager`, async () => {
      const model = randWord();
      const file1 = `${randWord()}.${randFileExt()}`;
      const file2 = `${randWord()}.${randFileExt()}`;
      await s3Helper.createFileOfModel(model, file1);
      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      const task = createTask(model, paths);
      taskHandlerMock.dequeue.mockResolvedValue(task);
      taskHandlerMock.reject.mockResolvedValue(null);

      await fileDeleterManager.start();

      expect(taskHandlerMock.ack).not.toHaveBeenCalled();
      expect(taskHandlerMock.reject).toHaveBeenCalled();
    });

    it(`When can't update job manager, should finish the function`, async () => {
      const model = randWord();
      const file1 = `${randWord()}.${randFileExt()}`;
      const file2 = `${randWord()}.${randFileExt()}`;
      await s3Helper.createFileOfModel(model, file1);
      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      const task = createTask(model, paths);
      taskHandlerMock.dequeue.mockResolvedValue(task);
      taskHandlerMock.reject.mockRejectedValue(new Error('error with job manager'));

      await fileDeleterManager.start();

      expect(taskHandlerMock.ack).not.toHaveBeenCalled();
      expect(taskHandlerMock.reject).toHaveBeenCalled();
    });
  });
});
