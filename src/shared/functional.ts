export namespace Functional {
  export type Action<TArg = void, TRet = void> = (arg: TArg) => TRet;

  /**
   * Pipe utility to compose multiple functions in a more handy way
   *
   * @see {@link https://stackoverflow.com/q/65154695|StackOverflow pipe implementation examples}
   * @see {@link https://github.com/ReactiveX/rxjs/blob/c15b37f81ba5f5abea8c872b0189a70b150df4cb/packages/rxjs/src/internal/util/pipe.ts#L77|RxJS pipe implementation (Observable pipe)}
   * @see {@link https://github.com/gcanti/fp-ts/blob/669cd3ed7cb5726024331a7a1cf35125669feb30/src/function.ts#L416|fp-ts pipe implementation (similar to RxJS one)}
   */
  export class Pipe<TArg, TRet> {
    private _action: Action<TArg, TRet>;

    constructor(action: Action<TArg, TRet>) {
      this._action = action;
    }

    then<ThenTRet>(
      action: Action<TRet, ThenTRet>
    ): Pipe<TArg, ThenTRet> {
      return new Pipe((props) => {
        return action(this._action(props));
      });
    }

    compile(): Action<TArg, TRet> {
      return this._action;
    }
  }
}
