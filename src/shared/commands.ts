import { Status } from './status';

const breakCommand = (source: string): [string, string] => {
  const sepIndex = source.search(/\s+/);

  const name = source.slice(0, sepIndex);
  const body = source.slice(sepIndex);

  return [name, body];
};

const parseIdBody = (body: string): number => {
  const matches = body.match(/\d{1,10}/);
  const error = Status.badRequest('No id provided');

  if (!matches || matches.length === 0) {
    throw error;
  }

  const id = +matches.at(0)!;

  if (!Number.isSafeInteger(id)) {
    throw error;
  }

  return id;
};

const parseIdsBody = (body: string): number[] => {
  const matches = body.match(/\d{1,10}/g);
  const error = Status.badRequest('No ids provided');

  if (!matches) {
    throw error;
  }

  const ids = new Set<number>();

  matches
    .map((match) => +match)
    .filter((id) => Number.isSafeInteger(id))
    .forEach((id) => {
      ids.add(id);
    });

  if (ids.size === 0) {
    throw error;
  }

  return Array.from(ids);
};

export namespace Commands {
  export type Name = `/${string}` | '';

  export type Handler<TBody> = (body: TBody) => Promise<void> | void;

  export const idHandler = (
    handler: Handler<number>
  ): Handler<string> => {
    return (body) => {
      const id = parseIdBody(body);

      return handler(id);
    };
  };

  export const idsHandler = (
    handler: Handler<number[]>
  ): Handler<string> => {
    return (body) => {
      const ids = parseIdsBody(body);

      return handler(ids);
    };
  };

  export const parse = <TBody>(
    source = '',
    handlers: { '': Handler<string> } & Record<Name, Handler<TBody>>
  ) => {
    if (source.at(0) !== '/') {
      return handlers[''](source);
    }

    const [name, body] = breakCommand(source);
    const handler = handlers[name];

    if (!handler) {
      throw Status.badRequest(`No handler for command ${name}`);
    }

    return handler(body);
  };
}
