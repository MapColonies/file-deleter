import jsLogger from '@map-colonies/js-logger';
import config from 'config';
import { randFileExt, randWord } from '@ngneat/falso';
import httpStatus from 'http-status-codes';
import { container } from 'tsyringe';
import { S3Helper } from '../../helpers/s3Helper';
import { SERVICES } from '../../../src/common/constants';
import { getApp } from '../../../src/app';
import { S3Provider } from '../../../src/providers/s3Provider';
import { S3Config } from '../../../src/common/interfaces';
import { AppError } from '../../../src/common/appError';

jest.useFakeTimers();

describe('S3Provider tests', () => {
  let provider: S3Provider;
  const s3Config = config.get<S3Config>('S3');
  let s3Helper: S3Helper;

  beforeAll(() => {
    getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.PROVIDER, provider: { useValue: s3Config } },
      ],
    });
    provider = container.resolve(S3Provider);
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

  describe('deleteFile', () => {
    it('Should delete an exist file from S3', async () => {
      const model = randWord();
      const file = `${randWord()}.${randFileExt()}`;
      const filePath = `${model}/${file}`;

      await s3Helper.createFileOfModel(model, file);

      const result = await provider.deleteFile(filePath);
      const fileExists = await s3Helper.fileExists(s3Config.bucket, filePath);

      expect(result).toBeUndefined();
      expect(fileExists).toBe(false);
    });

    it('When the file is not exists in the bucket, throws error', async () => {
      const nonExistingFilePath = 'non-existing-file.txt';

      await expect(provider.deleteFile(nonExistingFilePath)).rejects.toThrow(
        new AppError(httpStatus.BAD_REQUEST, `File ${nonExistingFilePath} doesn't exists in the agreed folder`, true)
      );

      const fileExists = await s3Helper.fileExists(s3Config.bucket, nonExistingFilePath);
      expect(fileExists).toBe(false);
    });
  });
});
