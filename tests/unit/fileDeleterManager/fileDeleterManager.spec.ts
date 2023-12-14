import jsLogger from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { randWord } from '@ngneat/falso';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { FileDeleterManager } from '../../../src/fileDeleterManager/fileDeleterManager';
import { createTask, configProviderMock, taskHandlerMock } from '../../helpers/mockCreators';

describe('fileDeleterManager', () => {
  let fileDeleterManager: FileDeleterManager;

  beforeEach(() => {
    getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TASK_HANDLER, provider: { useValue: taskHandlerMock } },
        { token: SERVICES.PROVIDER, provider: { useValue: configProviderMock } },
      ],
    });

    fileDeleterManager = container.resolve(FileDeleterManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('When task counter is not smaller than pool size, it will not dequeue', async () => {
      fileDeleterManager['taskCounter'] = 10;

      getApp({
        override: [{ token: SERVICES.FILE_DELETER_MANAGER, provider: { useValue: fileDeleterManager } }],
      });

      const response = await fileDeleterManager.start();

      expect(response).toBeUndefined();
      expect(taskHandlerMock.dequeue).not.toHaveBeenCalled();
    });

    it(`When didn't find task, does nothing`, async () => {
      taskHandlerMock.dequeue.mockResolvedValue(null);

      await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalled();
      expect(configProviderMock.deleteFile).not.toHaveBeenCalled();
    });

    it('When fund a task with index not -1, it starts from the index', async () => {
      const task = createTask();
      const filePath = randWord();
      task.parameters.lastIndexError = 1;
      taskHandlerMock.dequeue.mockResolvedValue(task);
      configProviderMock.deleteFile(filePath);

      await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalled();
      expect(configProviderMock.deleteFile).toHaveBeenCalled();
    });

    it(`When found a task but didn't delete file, throws an error`, async () => {
      taskHandlerMock.dequeue.mockResolvedValue(createTask());
      configProviderMock.deleteFile.mockRejectedValue(new Error('error'));

      await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalled();
      expect(configProviderMock.deleteFile).toHaveBeenCalled();
    });

    it(`When delete file throws unknown error, catches the error`, async () => {
      taskHandlerMock.dequeue.mockResolvedValue(createTask());
      configProviderMock.deleteFile.mockRejectedValue(new Error('error'));

      await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalled();
      expect(configProviderMock.deleteFile).toHaveBeenCalled();
    });

    it(`When found a task but there is a problem with the job-manager, throws an error`, async () => {
      taskHandlerMock.dequeue.mockResolvedValue(createTask());
      configProviderMock.deleteFile.mockRejectedValue(new Error('error'));
      taskHandlerMock.reject.mockRejectedValue(new Error('job-manager error'));

      const response = await fileDeleterManager.start();

      expect(taskHandlerMock.dequeue).toHaveBeenCalled();
      expect(response).toBeUndefined();
    });
  });
});
