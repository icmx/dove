import { z } from 'zod';
import {
  DOVE_CONTENT_MAX,
  DOVE_CONTENT_MIN,
  DOVE_PASSWORD_MAX,
  DOVE_PASSWORD_MIN,
} from '../constants';

export namespace Schemas {
  export const idSchema = z.number({ coerce: true }).int().gt(0);

  export const bodySchema = z.object({
    _autosave: z.optional(z.enum(['reply', 'thread'])),
    content: z
      .string()
      .min(DOVE_CONTENT_MIN)
      .max(DOVE_CONTENT_MAX)
      .regex(/[^\s]/g)
      .transform((content) =>
        content
          .replace(/\r?\n/g, '\n')
          .replace(/\n\n+/g, '\n\n')
          .replace(/\s+\n/g, '\n')
      ),
    password: z.optional(
      z.string().min(DOVE_PASSWORD_MIN).max(DOVE_PASSWORD_MAX)
    ),
  });
}
