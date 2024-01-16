import { readPackageJsonSync } from '@map-colonies/read-pkg';
import config from 'config';

export const SERVICE_NAME = readPackageJsonSync().name ?? 'unknown_service';

export const IGNORED_OUTGOING_TRACE_ROUTES = [/^.*\/v1\/metrics.*$/];
export const IGNORED_INCOMING_TRACE_ROUTES = [/^.*\/docs.*$/];

export const JOB_TYPE = config.get<string>('fileDeleter.job.type');
export const TASK_TYPE = config.get<string>('fileDeleter.task.type')

/* eslint-disable @typescript-eslint/naming-convention */
export const SERVICES: Record<string, symbol> = {
  LOGGER: Symbol('Logger'),
  CONFIG: Symbol('Config'),
  TRACER: Symbol('Tracer'),
  METER: Symbol('Meter'),
  METRICS: Symbol('Metrics'),
  S3_CONFIG: Symbol('S3Config'),
  NFS_CONFIG: Symbol('NFSConfig'),
  TASK_HANDLER: Symbol('TaskHandler'),
  PROVIDER: Symbol('Provider'),
};
/* eslint-enable @typescript-eslint/naming-convention */
