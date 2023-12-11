import { ProviderConfig, ProviderManager, ProvidersConfig } from '../interfaces';
import logger from '../logger';
import { NFSProvider } from './nfsProvider';
import { S3Provider } from './s3Provider';

function getProvider(config: ProviderConfig): S3Provider | NFSProvider {
  if (config.type === 'S3') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new S3Provider(logger, config);
  } else {
    return new NFSProvider(logger, config);
  }
}

function getProviderManager(providerConfiguration: ProvidersConfig): ProviderManager {
  return {
    source: getProvider(providerConfiguration.source),
    dest: getProvider(providerConfiguration.dest),
  };
}

export { getProvider, getProviderManager };
