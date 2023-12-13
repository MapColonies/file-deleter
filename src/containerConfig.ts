import { TaskHandler } from '@map-colonies/mc-priority-queue';
import { Metrics } from '@map-colonies/telemetry';
import { trace, metrics as OtelMetrics } from '@opentelemetry/api';
import config from 'config';
import { DependencyContainer } from 'tsyringe/dist/typings/types';
import { SERVICES, SERVICE_NAME } from './common/constants';
import { InjectionObject, registerDependencies } from './common/dependencyRegistration';
import { Provider, ProviderConfig } from './common/interfaces';
import logger from './common/logger';
import { tracing } from './common/tracing';
import { getProvider, getProviderConfig } from './common/providers/getProvider';

export interface RegisterOptions {
  override?: InjectionObject<unknown>[];
  useChild?: boolean;
}

export const registerExternalValues = (options?: RegisterOptions): DependencyContainer => {
  const provider = config.get<string>('deleting.provider');
  const jobManagerBaseUrl = config.get<string>('jobManager.url');
  const heartneatUrl = config.get<string>('heartbeat.url');
  const dequeueIntervalMs = config.get<number>('fileDeleter.waitTime');
  const heartbeatIntervalMs = config.get<number>('heartbeat.waitTime');

  const metrics = new Metrics();
  metrics.start();

  tracing.start();
  const tracer = trace.getTracer(SERVICE_NAME);

  const dependencies: InjectionObject<unknown>[] = [
    { token: SERVICES.CONFIG, provider: { useValue: config } },
    { token: SERVICES.LOGGER, provider: { useValue: logger } },
    { token: SERVICES.TRACER, provider: { useValue: tracer } },
    { token: SERVICES.METER, provider: { useValue: OtelMetrics.getMeterProvider().getMeter(SERVICE_NAME) } },
    { token: SERVICES.METRICS, provider: { useValue: metrics } },
    {
      token: SERVICES.TASK_HANDLER,
      provider: {
        useFactory: (): TaskHandler => {
          return new TaskHandler(logger, jobManagerBaseUrl, heartneatUrl, dequeueIntervalMs, heartbeatIntervalMs);
        },
      },
    },
    {
      token: SERVICES.PROVIDER_CONFIG,
      provider: {
        useFactory: (): ProviderConfig => {
          return getProviderConfig(provider);
        },
      },
    },
    {
      token: SERVICES.PROVIDER,
      provider: {
        useFactory: (): Provider => {
          return getProvider(provider);
        },
      },
    },
  ];

  return registerDependencies(dependencies, options?.override, options?.useChild);
};
