import { Schemas } from './schemas';
import { Seconds } from './seconds';

export namespace Commands {
  const WARN_NAME = '/warn';
  const BAN_NAME = '/ban';
  const DELETE_NAME = '/delete';
  const CREATE_NAME = '/create';

  const NAMES = [
    WARN_NAME,
    BAN_NAME,
    DELETE_NAME,
    CREATE_NAME,
  ] as const;

  type Handlers = Record<(typeof NAMES)[number], () => Promise<void>>;

  export const from = async (source: string, handlers: Handlers) => {
    if (!source.startsWith('/')) {
      await handlers[CREATE_NAME]();
    }

    for (const name of NAMES) {
      if (source.startsWith(name)) {
        await handlers[name]();
        return;
      }
    }

    await handlers[CREATE_NAME]();
  };

  export const parseWarnArgs = (source: string): number => {
    const matches = source.match(/\d{1,10}/) || [];

    const id = Schemas.warnCommandArgsSchema.parse(Array.from(matches));

    return id;
  };

  export const parseBanArgs = (
    source: string
  ): { id: number; expires: number } => {
    const data =
      /(?<id>\d+)\s+(?<count>\d+)\s*?(?<unit>(h|d|w|m|y))/.exec(source)
        ?.groups || {};

    const { id, count, unit } =
      Schemas.banCommandArgsSchema.parse(data);

    const expires = Seconds.future({ count, unit });

    return { id, expires };
  };

  export const parseDeleteArgs = (source: string): number[] => {
    const matches = source.match(/\d{1,10}/g) || [];

    const ids = Schemas.deleteCommandArgsSchema.parse(
      Array.from(matches)
    );

    return ids;
  };
}
