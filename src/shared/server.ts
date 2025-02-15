import fastifyFormbody from '@fastify/formbody';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import Files from 'files';
import { Env } from './env';

export namespace Server {
  export const create = async (): Promise<FastifyInstance> => {
    const fastify = Fastify({
      logger: false,
      trustProxy: Env.config.DOVE_TRUST_PROXY,
    });

    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    fastify.register(fastifyFormbody);

    if (!Env.config.DOVE_DISABLE_STATIC) {
      const root = await Files.abs(Env.config.DOVE_VIEW_ROOT);

      await Files.mkdir(root);

      fastify.register(fastifyStatic, { root });
    }

    fastify.register(fastifyRateLimit, { global: false });

    return fastify;
  };
}
