import { Argv } from 'yargs';
import { SayCommand } from '../../../src/sayCommand/sayCommand';

describe('sayCommand', () => {
  const positionalMock = jest.fn();
  const yargsMock = {
    positional: positionalMock,
  } as unknown as Argv;
  let consoleLogMock: jest.SpyInstance;
  let command: SayCommand;
  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log');
    command = new SayCommand();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('handler', () => {
    it('logs word parameter', () => {
      consoleLogMock.mockReturnValue(undefined);

      // eslint-disable-next-line @typescript-eslint/naming-convention
      command.handler({ word: 'test', _: [], $0: 'testScript' });

      expect(consoleLogMock).toHaveBeenCalledWith('test');
    });
  });

  describe('builder', () => {
    it('defines positional parameter word', () => {
      command.builder(yargsMock);

      expect(positionalMock).toHaveBeenCalledWith('word', expect.any(Object));
    });
  });
});
