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

    it('Should throw AppError on deletion failure', async () => {
      const filePath = randWord();

      await expect(provider.deleteFile(filePath)).rejects.toThrow(
        new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Deleting failed: ${filePath}`, true)
      );
    });
  });
});
