import { injectable } from 'tsyringe';
import { Argv, CommandModule } from 'yargs';

@injectable()
export class SayCommand implements CommandModule {
  public deprecated = false;
  public command = 'say <word>';
  public describe = 'example command';
  public aliases = [];
  public builder(yargs: Argv): Argv {
    return yargs.positional('word', { describe: 'a word to echo', type: 'string' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public handler(args: { [argName: string]: unknown; _: (string | number)[]; $0: string }): void {
    console.log(args['word']);
  }
}
