import Fastify, { FastifyInstance } from 'fastify';
import { Env } from './env';
import fastifyFormbody from '@fastify/formbody';
import fastifyRateLimit from '@fastify/rate-limit';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

export namespace Server {
  export const create = async (): Promise<FastifyInstance> => {
    const fastify = Fastify({
      logger: false,
      trustProxy: Env.config.DOVE_TRUST_PROXY,
    }).withTypeProvider<ZodTypeProvider>();

    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    fastify.register(fastifyFormbody);
    fastify.register(fastifyRateLimit, { global: false });

    return fastify;
  };
}
