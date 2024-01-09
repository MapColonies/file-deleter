import jsLogger from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { randFileExt, randWord } from '@ngneat/falso';
import httpStatus from 'http-status-codes';
import config from 'config';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { NFSConfig } from '../../../src/common/interfaces';
import { NFSHelper } from '../../helpers/nfsHelper';
import { AppError } from '../../../src/common/appError';
import { NFSProvider } from '../../../src/providers/nfsProvider';

describe('NFSProvider', () => {
  let provider: NFSProvider;
  const nfsConfig = config.get<NFSConfig>('NFS');
  let nfsHelper: NFSHelper;

  beforeAll(() => {
    getApp({
      override: [
        { token: SERVICES.PROVIDER_CONFIG, provider: { useValue: nfsConfig } },
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
      ],
    });
    provider = container.resolve(NFSProvider);
    nfsHelper = new NFSHelper(nfsConfig);
  });

  beforeEach(() => {
    nfsHelper.initNFS();
  });

  afterEach(async () => {
    await nfsHelper.cleanNFS();
    jest.clearAllMocks();
  });

  describe('deleteFile', () => {
    it('Should delete an existing file from NFS', async () => {
      const model = randWord();
      const file = `${randWord()}.${randFileExt()}`;
      await nfsHelper.createFileOfModel(model, file);
      const filePath = `${model}/${file}`;

      const result = await provider.deleteFile(filePath);
      const fileExists = await nfsHelper.fileExists(filePath);

      expect(result).toBeUndefined();
      expect(fileExists).toBe(false);
    });

    it('Should handle deleting non-existing file in NFS', async () => {
      const nonExistingFilePath = 'non-existing-file.txt';

      await expect(provider.deleteFile(nonExistingFilePath)).rejects.toThrow(
        new AppError(httpStatus.BAD_REQUEST, `File ${nonExistingFilePath} doesn't exists in the agreed folder`, true)
      );

      const fileExists = await nfsHelper.fileExists(nonExistingFilePath);
      expect(fileExists).toBe(false);
    });
  });
});
