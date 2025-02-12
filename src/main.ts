import Fastify from 'fastify';
import { Env } from './common/env';

export const main = async (): Promise<void> => {
  const fastify = Fastify();

  fastify.get('/', async function () {
    return { hello: 'world' };
  });

  const { DOVE_HOST, DOVE_PORT } = Env.config;

  try {
    await fastify.listen({ host: DOVE_HOST, port: DOVE_PORT });

    console.log(`ready http://${DOVE_HOST}:${DOVE_PORT}`);
  } catch (error) {
    fastify.log.error(error);
  }
};

main();
