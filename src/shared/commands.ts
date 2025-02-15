import { Status } from './status';

export namespace Commands {
  export type Name = `/${string}` | '';

  export type Handler = <TArgs>(args: TArgs) => Promise<void> | void;

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
