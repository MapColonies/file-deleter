import jsLogger from '@map-colonies/js-logger';
import { randFileExt, randWord } from '@ngneat/falso';
import { container } from 'tsyringe';
import config from 'config';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { NFSConfig } from '../../../src/common/interfaces';
import { FileDeleterManager } from '../../../src/fileDeleterManager/fileDeleterManager';
import { createTask, taskHandlerMock } from '../../helpers/mockCreators';
import { NFSHelper } from '../../helpers/nfsHelper';

describe('fileDeleterManager NFS', () => {
  let fileDeleterManager: FileDeleterManager;
  const nfsConfig = config.get<NFSConfig>('NFS');
  let nfsHelper: NFSHelper;

  beforeEach(() => {
    getApp({
      override: [
        { token: SERVICES.PROVIDER_CONFIG, provider: { useValue: nfsConfig } },
        { token: SERVICES.TASK_HANDLER, provider: { useValue: taskHandlerMock } },
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
      ],
    });
    fileDeleterManager = container.resolve(FileDeleterManager);
    nfsHelper = new NFSHelper(nfsConfig);
    nfsHelper.initNFS();
  });

  afterEach(async () => {
    await nfsHelper.cleanNFS();
    jest.clearAllMocks();
  });

  describe('start function', () => {
    it('When task counter is not smaller than pool size, it will not dequeue', async () => {
      fileDeleterManager['taskCounter'] = 10;

      getApp({
        override: [{ token: SERVICES.FILE_DELETER_MANAGER, provider: { useValue: fileDeleterManager } }],
      });

      const response = await fileDeleterManager.start();

      expect(response).toBeUndefined();
      expect(taskHandlerMock.dequeue).not.toHaveBeenCalled();
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
      const fileContent = await nfsHelper.createFileOfModel(model, file1);
      const bufferedContent = Buffer.from(fileContent, 'utf-8');
      await nfsHelper.createFileOfModel(model, file2);
      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      taskHandlerMock.dequeue.mockResolvedValue(createTask(model, paths));

      await fileDeleterManager.start();
      const result = await nfsHelper.readFile(`${model}/${file1}`);

      expect(taskHandlerMock.dequeue).toHaveBeenCalled();
      expect(result).toStrictEqual(bufferedContent);
    });

    it(`When can't read file, should increase task's retry and update job manager`, async () => {
      const model = randWord();
      const file1 = `${randWord()}.${randFileExt()}`;
      const file2 = `${randWord()}.${randFileExt()}`;
      await nfsHelper.createFileOfModel(model, file1);
      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      const task = createTask(model, paths);
      taskHandlerMock.dequeue.mockResolvedValue(task);
      taskHandlerMock.reject.mockResolvedValue(null);

      await fileDeleterManager.start();

      expect(taskHandlerMock.ack).not.toHaveBeenCalled();
    });

    it(`When can't update job manager, should finish the function`, async () => {
      const model = randWord();
      const file1 = `${randWord()}.${randFileExt()}`;
      const file2 = `${randWord()}.${randFileExt()}`;
      await nfsHelper.createFileOfModel(model, file1);
      const paths = [`${model}/${file1}`, `${model}/${file2}`];
      const task = createTask(model, paths);
      taskHandlerMock.dequeue.mockResolvedValue(task);
      taskHandlerMock.reject.mockRejectedValue(new Error('error with job manager'));

      await fileDeleterManager.start();

      expect(taskHandlerMock.ack).not.toHaveBeenCalled();
    });
  });
});
