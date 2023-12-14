import fs from 'fs';
import { Logger } from '@map-colonies/js-logger';
import httpStatus from 'http-status-codes';
import { inject, injectable } from 'tsyringe';
import { AppError } from '../common/appError';
import { NFSConfig, Provider } from '../common/interfaces';
import { SERVICES } from '../common/constants';

@injectable()
export class NFSProvider implements Provider {
  public constructor(
    @inject(SERVICES.LOGGER) protected readonly logger: Logger,
    @inject(SERVICES.PROVIDER_CONFIG) protected readonly config: NFSConfig,
    ) {}

  public async deleteFile(filePath: string): Promise<void> {
    const pvPath = this.config.pvPath;
    const fullPath = `${pvPath}/${filePath}`;
    if (!fs.existsSync(fullPath)) {
      throw new AppError(httpStatus.BAD_REQUEST, `File ${filePath} doesn't exists in the agreed folder`, true);
    }
    this.logger.debug({ msg: 'Starting deleteFile', fullPath });
    try {
      await fs.promises.unlink(fullPath);
      this.logger.debug({ msg: 'Done deleteFile', fullPath });
    } catch (error) {
      this.logger.error(`Deleting failed: ${filePath}`, error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Deleting failed: ${filePath}`, true);
    }
  }
}
