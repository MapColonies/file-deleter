import fs from 'fs';
import jsLogger from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { ProviderManager } from '../../../src/common/interfaces';
import { getProviderManager } from '../../../src/common/providers/getProvider';
import { mockNFStNFS } from '../../helpers/mockCreators';
import { NFSHelper } from '../../helpers/nfsHelper';
import { S3Provider } from '../../../src/common/providers/s3Provider';
import { NFSProvider } from '../../../src/common/providers/nfsProvider';
import { randFileExt, randWord } from '@ngneat/falso';
import { config } from 'aws-sdk';

describe('NFSProvider', () => {
  let providerManager: ProviderManager;
  let nfsHelper: NFSHelper;

  beforeAll(() => {
    getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.CONFIG, provider: {useValue: config}},
        {
          token: SERVICES.PROVIDER_MANAGER,
          provider: {
            useFactory: (): ProviderManager => {
              return getProviderManager(mockNFStNFS);
            },
          },
        },
      ],
    });

    providerManager = container.resolve(SERVICES.PROVIDER_MANAGER);
    nfsHelper = new NFSHelper(mockNFStNFS.dest);
  });

  beforeEach(() => {
    nfsHelper.initNFS();
  });

  afterEach(async () => {
    await nfsHelper.cleanNFS();
  });

  describe('deleteFile', () => {
    it('Should delete an existing file from S3', async () => {
      const model = randWord();
      const file = `${randWord()}.${randFileExt()}`;
      const fileContent = await nfsHelper.createFileOfModel(model, file);
      const filePath = `${model}/${file}`;
      const fullPath = `${}`

      const result = await providerManager.dest.deleteFile(filePath)
      
      expect(result).toBe('')

    });
  });
});
