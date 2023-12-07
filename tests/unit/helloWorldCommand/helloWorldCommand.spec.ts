import { Argv } from 'yargs';
import { HelloWorldCommand } from '../../../src/helloWorldCommand/helloWorld';

describe('sayCommand', () => {
  const positionalMock = jest.fn();
  const yargsMock = {
    positional: positionalMock,
  } as unknown as Argv;
  let consoleLogMock: jest.SpyInstance;
  let command: HelloWorldCommand;
  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log');
    command = new HelloWorldCommand();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('handler', () => {
    it('logs word parameter', async () => {
      consoleLogMock.mockReturnValue(undefined);

      await command.handler();

      expect(consoleLogMock).toHaveBeenCalledWith('hello world');
    });
  });

  describe('builder', () => {
    it('defines positional parameter word was not called', () => {
      command.builder(yargsMock);

      expect(positionalMock).toHaveBeenCalledTimes(0);
    });
  });
});
