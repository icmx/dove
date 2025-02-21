import { DB } from '../src/core/db';
import { Env } from '../src/shared/env';
import { Seconds } from '../src/shared/seconds';

const log = (message: string): void => {
  const timestamp = new Date().toJSON();

  console.log(`clean-bans: ${timestamp}: ${message}`);
};

const now = (): number => {
  return performance.now();
};

export const main = async (): Promise<void> => {
  log('Started');

  const dbFile = Env.config.DOVE_DB_FILENAME;

  log(`Reading DB ${dbFile}`);
  DB.db.read();

  for (const [ipHash, value] of Object.entries(DB.db.data.bans)) {
    if (!value) {
      continue;
    }

    if (Seconds.isExpired(value.expires)) {
      log(`Cleaning ban: ${ipHash}`);

      DB.db.data.bans[ipHash] = undefined;
    }
  }

  log('Done');
};

main();
