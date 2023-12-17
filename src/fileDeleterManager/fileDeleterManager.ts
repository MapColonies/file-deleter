import { Logger } from '@map-colonies/js-logger';
import { ITaskResponse, IUpdateTaskBody, TaskHandler } from '@map-colonies/mc-priority-queue';
import { IConfig } from 'config';
import { inject, injectable } from 'tsyringe';
import { JOB_TYPE, SERVICES } from '../common/constants';
import { Provider, TaskParameters, TaskResult } from '../common/interfaces';

@injectable()
export class FileDeleterManager {
  private readonly taskType: string;
  private readonly maxAttempts: number;
  private readonly taskPoolSize: number;
  private taskCounter: number;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(SERVICES.TASK_HANDLER) private readonly taskHandler: TaskHandler,
    @inject(SERVICES.PROVIDER) private readonly provider: Provider
  ) {
    this.taskType = this.config.get<string>('fileDeleter.task.type');
    this.maxAttempts = this.config.get<number>('fileDeleter.task.maxAttempts');
    this.taskPoolSize = this.config.get<number>('fileDeleter.taskPoolSize');
    this.taskCounter = 0;
  }

  public async start(): Promise<void> {
    if (this.taskCounter >= this.taskPoolSize) {
      return;
    }

    this.logger.debug({ msg: 'Try to dequeue new task' });
    const task = await this.taskHandler.dequeue<TaskParameters>(JOB_TYPE, this.taskType);
    if (!task) {
      return;
    }

    this.logger.info({ msg: 'Found a task to work on!', task: task.id, modelId: task.parameters.modelId });
    this.taskCounter++;
    const taskResult = await this.handleTask(task);
    if (taskResult.completed) {
      const isCompleted: boolean = true;
      await this.taskHandler.ack<IUpdateTaskBody<TaskParameters>>(task.jobId, task.id);
      this.logger.info({ msg: 'Finishing ack task', task: task.id, modelId: task.parameters.modelId });
      await this.deleteTaskParameters(task);
      this.logger.info({ msg: `Deleted task's parameters successfully`, task: task.id, modelId: task.parameters.modelId });
      this.taskCounter--;
      this.logger.info({ msg: 'Done working on a task in this interval', taskId: task.id, isCompleted, modelId: task.parameters.modelId });
    }
  }

  private async deleteTaskParameters(task: ITaskResponse<TaskParameters>): Promise<void> {
    const parameters = task.parameters;
    await this.taskHandler.jobManagerClient.updateTask(task.jobId, task.id, {
      parameters: { modelId: parameters.modelId, lastIndexError: parameters.lastIndexError },
    });
  }
  private async handleFailedTask(task: ITaskResponse<TaskParameters>, taskResult: TaskResult): Promise<void> {
    try {
      await this.updateIndexError(task, taskResult.index);
      await this.rejectJobManager(taskResult.error!, task);
      this.logger.info({ msg: 'Updated failing the task in job manager', task: task.id });
    } catch (error) {
      this.logger.error({ error, taskId: task.id, modelId: task.parameters.modelId });
    }
  }

  private async handleTask(task: ITaskResponse<TaskParameters>): Promise<TaskResult> {
    this.logger.debug({ msg: 'Starting handleTask', taskId: task.id });
    const taskParameters = task.parameters;
    const taskResult: TaskResult = this.initTaskResult(taskParameters);

    while (taskResult.index < taskParameters.paths.length) {
      const filePath = taskParameters.paths[taskResult.index];
      try {
        await this.deleteFile(filePath);
      } catch (error) {
        await this.handleFailedTask(task, taskResult);
        this.logger.error({ error, taskId: task.id, modelId: task.parameters.modelId });
        taskResult.error = error instanceof Error ? error : new Error(String(error));
        return taskResult;
      }

      taskResult.index++;
    }

    taskResult.completed = true;
    return taskResult;
  }

  private initTaskResult(taskParameters: TaskParameters): TaskResult {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const startPosition = taskParameters.lastIndexError === -1 ? 0 : taskParameters.lastIndexError;
    const taskResult: TaskResult = { index: startPosition, completed: false };
    return taskResult;
  }

  private async deleteFile(filePath: string): Promise<void> {
    await this.provider.deleteFile(filePath);
  }

  private async rejectJobManager(error: Error, task: ITaskResponse<TaskParameters>): Promise<void> {
    const isRecoverable: boolean = task.attempts < this.maxAttempts;
    await this.taskHandler.reject<IUpdateTaskBody<TaskParameters>>(task.jobId, task.id, isRecoverable, error.message);
  }

  private async updateIndexError(task: ITaskResponse<TaskParameters>, lastIndexError: number): Promise<void> {
    const payload: IUpdateTaskBody<TaskParameters> = {
      parameters: { ...task.parameters, lastIndexError },
    };
    await this.taskHandler.jobManagerClient.updateTask<TaskParameters>(task.jobId, task.id, payload);
  }
}