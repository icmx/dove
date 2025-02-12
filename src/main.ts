import Fastify from 'fastify';

export const main = async (): Promise<void> => {
  const fastify = Fastify();

  fastify.get('/', async function () {
    return { hello: 'world' };
  });

  try {
    await fastify.listen({ port: 3000 });

    console.log('ready');
  } catch (error) {
    fastify.log.error(error);
  }
};

main();
