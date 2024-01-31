import config from 'config';
import httpStatus from 'http-status-codes';
import { randWord } from '@ngneat/falso';
import { AppError } from '../../../src/common/appError';
import { NFSConfig, S3Config } from '../../../src/common/interfaces';
import { getProvider, getProviderConfig } from '../../../src/providers/getProvider';

describe('getProviderConfig tests', () => {
  it('should return the NFS config when the provider is NFS', () => {
    const provider = 'NFS';
    const expected = config.get<NFSConfig>('NFS');

    const response = getProviderConfig(provider);

    expect(response).toStrictEqual(expected);
  });

  it('should return the S3 config when the provider is S3', () => {
    const provider = 'S3';
    const expected = config.get<S3Config>('S3');

    const response = getProviderConfig(provider);

    expect(response).toStrictEqual(expected);
  });

  it(`should throw an error when the provider can't be found on config`, () => {
    const provider = randWord();

    const response = () => getProviderConfig(provider);

    expect(response).toThrow(
      new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Invalid config provider received: ${provider} - available values: "nfs" or "s3"`, false)
    );
  });
});

describe('getProvider tests', () => {
  it('should throw an error when the provider is nor S3 or NFS', () => {
    const provider = randWord();

    const response = () => getProvider(provider);

    expect(response).toThrow(
      new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Invalid config provider received: ${provider} - available values: "nfs" or "s3"`, false)
    );
  });
});
