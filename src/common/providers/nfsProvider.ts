import fs from 'fs';
import { Logger } from '@map-colonies/js-logger';
import httpStatus from 'http-status-codes';
import { AppError } from '../appError';
import { NFSConfig, Provider } from '../interfaces';

export class NFSProvider implements Provider {
  public constructor(private readonly logger: Logger, private readonly config: NFSConfig) {}

  public async deleteFile(filePath: string): Promise<void> {
    const pvPath = this.config.pvPath;
    const fullPath = `${pvPath}/${filePath}`;
    if (!fs.existsSync(fullPath)) {
      throw new AppError(httpStatus.BAD_REQUEST, `File ${filePath} doesn't exists in the agreed folder`, true);
    }
    this.logger.debug({ msg: 'Starting deleteFile', fullPath });
    await fs.promises.unlink(fullPath);
    this.logger.debug({ msg: 'Done deleteFile', fullPath });
  }
}
