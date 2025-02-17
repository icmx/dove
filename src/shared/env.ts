import z from 'zod';
import { DOVE_LANGS } from '../constants';

export namespace Env {
  const schema = z.object({
    DOVE_HOST: z.string().default('[::1]'),
    DOVE_PORT: z.number({ coerce: true }).int().default(3000),
    DOVE_DB_FILENAME: z.string().default('./dev.db.json'),
    DOVE_SALT: z.string().default('0000000000000000'),
    DOVE_LANG: z.enum(DOVE_LANGS).default('en'),
    DOVE_TRUST_PROXY: z.boolean({ coerce: true }).default(false),
    DOVE_DISABLE_STATIC: z.boolean({ coerce: true }).default(false),
    DOVE_VIEW_ROOT: z.string().default('./view'),
    DOVE_PASSWORD: z.string().default('000000'),
  });

  const values = Object.fromEntries(
    Object.entries(schema.shape).map(([key]) => {
      return [key, process.env[key]];
    })
  );

  export const config = schema.parse(values);
}
