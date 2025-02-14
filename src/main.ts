import { Env } from './shared/env';
import { Server } from './shared/server';

export const main = async (): Promise<void> => {
  const server = await Server.create();

  server.get('/', async function () {
    return { hello: 'world' };
  });

  const { DOVE_HOST, DOVE_PORT } = Env.config;

  try {
    await server.listen({ host: DOVE_HOST, port: DOVE_PORT });

    console.log(`ready http://${DOVE_HOST}:${DOVE_PORT}`);
  } catch (error) {
    server.log.error(error);
  }
};

main();
