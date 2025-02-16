import Files from 'files';
import { DB } from '../src/core/db';
import { Env } from '../src/shared/env';
import { View } from '../src/core/view';

const log = (message: string): void => {
  const timestamp = new Date().toJSON();

  console.log(`build-view: ${timestamp}: ${message}`);
};

const now = (): number => {
  return performance.now();
};

export const main = async (): Promise<void> => {
  log('Started');

  const dbFile = Env.config.DOVE_DB_FILENAME;
  const viewDir = Env.config.DOVE_VIEW_ROOT;
  const p0 = now();

  log(`Reading DB ${dbFile}`);
  DB.db.read();

  log(`Cleaning view root directory ${viewDir}`);
  await Files.remove(viewDir);

  for (const entry of DB.db.data.threads.entries) {
    const threadId = entry.id;
    const lp0 = now();

    await View.buildReplies(entry.id);

    const lp1 = Math.round(now() - lp0);

    log(
      `Built ${viewDir}/threads/${threadId}/index.html (took ${lp1}ms)`
    );
  }

  log('Building view/index.html');
  await View.buildThreads();

  const p1 = Math.round(now() - p0);

  log(`Done (took ${p1}ms)`);
};

main();
