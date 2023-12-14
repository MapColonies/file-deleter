import jsLogger from '@map-colonies/js-logger';
import config from 'config';
import { randFileExt, randWord } from '@ngneat/falso';
import { container } from 'tsyringe';
import { S3Helper } from '../../helpers/s3Helper';
import { SERVICES } from '../../../src/common/constants';
import { getApp } from '../../../src/app';
import { S3Provider } from '../../../src/providers/s3Provider';
import { S3Config } from '../../../src/common/interfaces';

jest.useFakeTimers();

describe('S3Provider tests', () => {
  let provider: S3Provider;
  const s3Config = config.get<S3Config>('S3');
  let s3Helper: S3Helper;

  beforeAll(async () => {
    getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.PROVIDER_CONFIG, provider: { useValue: s3Config } },
      ],
    });
    provider = container.resolve(S3Provider);
    s3Helper = new S3Helper(s3Config);

    await s3Helper.createBucket();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await s3Helper.clearBucket();
    await s3Helper.deleteBucket();
    s3Helper.killS3();
  });

  describe('deleteFile', () => {
    it('Should delete a file from S3', async () => {
      const model = randWord();
      const file = `${randWord()}.${randFileExt()}`;
      await s3Helper.createFileOfModel(model, file);
      const filePath = `${model}/${file}`;

      const result = await provider.deleteFile(filePath);
      const fileExists = await s3Helper.FileExist(s3Config.bucket, filePath);

      expect(result).toBeUndefined();
      expect(fileExists).toBe(false)
    });
    it('When the file is not exists in the bucket, throws error', async () => {
      const nonExistingFilePath = 'non-existing-file.txt';

      const result = await provider.deleteFile(nonExistingFilePath);
      const fileExists = await s3Helper.FileExist(s3Config.bucket, nonExistingFilePath);

      expect(result).toBeUndefined();
      expect(fileExists).toBe(false)
    });
  });
});
