import z from 'zod';

const schema = z.object({
  DOVE_HOST: z.string().default('[::1]'),
  DOVE_PORT: z.number({ coerce: true }).int().default(3000),
});

const values = Object.fromEntries(
  Object.entries(schema.shape).map(([key]) => {
    return [key, process.env[key]];
  })
);

const config = schema.parse(values);

export const Env = {
  config,
};
