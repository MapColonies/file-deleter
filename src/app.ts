import { Logger } from '@map-colonies/js-logger';
import { inject, singleton } from 'tsyringe';
import { IConfig } from 'config';
import { SERVICES } from './common/constants';
import { registerExternalValues, RegisterOptions } from './containerConfig';
import { FileDeleterManager } from './common/fileDeleterManager/fileDeleterManager';

@singleton()
export class App {
  private readonly intervalMs: number;
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    private readonly fileDeleterManager: FileDeleterManager
  ) {
    this.intervalMs = this.config.get<number>('fileDeleter.intervalMs');
  }
  public run(): void {
    this.logger.info({ msf: 'Starting fileDeleter' });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => this.fileDeleterManager.start(), this.intervalMs);
  }
}
export function getApp(registerOptions?: RegisterOptions): App {
  const container = registerExternalValues(registerOptions);
  const app = container.resolve(App);
  return app;
}
