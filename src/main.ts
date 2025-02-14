import { Api } from './core/api';
import { Env } from './shared/env';

export const main = async (): Promise<void> => {
  const api = await Api.create();

  const { DOVE_HOST, DOVE_PORT } = Env.config;

  try {
    await api.listen({ host: DOVE_HOST, port: DOVE_PORT });

    console.log(`ready http://${DOVE_HOST}:${DOVE_PORT}`);
  } catch (error) {
    console.error(error);
  }
};

main();
