import { Status } from './status';

const parseIdsArgs = (args: string[]): number[] => {
  const ids = new Set<number>();

  args.forEach((arg) => {
    const matches = arg.matchAll(/\d{1,10}/g);

    Array.from(matches).forEach((match) => {
      const id = +match[0];

      if (Number.isSafeInteger(id)) {
        ids.add(id);
      }
    });
  });

  if (ids.size === 0) {
    throw Status.badRequest('No ids provided');
  }

  return Array.from(ids);
};

export namespace Commands {
  export type Name = `/${string}` | '';

  export type Handler<TArgs = string[]> = (
    args: TArgs
  ) => Promise<void> | void;

  export const idsHandler = (
    handler: Handler<number[]>
  ): Handler<string[]> => {
    return (args) => {
      const ids = parseIdsArgs(args);

      return handler(ids);
    };
  };

  export const parse = (
    source = '',
    handlers: Record<Name, Handler>
  ) => {
    const [name, ...args] = source.split(/\s+/);
    const handler: Handler = handlers[name] || handlers[''];

    if (!handler) {
      throw Status.badRequest(`No handler for command ${name}`);
    }

    return handler(args);
  };
}
