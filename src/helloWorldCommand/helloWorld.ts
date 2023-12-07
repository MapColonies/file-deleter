import { injectable } from 'tsyringe';
import { Argv, CommandModule } from 'yargs';

@injectable()
export class HelloWorldCommand implements CommandModule {
  public deprecated = false;
  public command = '$0';
  public describe = 'example command';
  public aliases = ['helloWorld'];
  public builder(yargs: Argv): Argv {
    return yargs;
  }

  public async handler(): Promise<void> {
    console.log('hello world');
    return Promise.resolve();
  }
}
