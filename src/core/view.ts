import Files from 'files';
import { Env } from '../shared/env';
import { I18N } from '../shared/i18n';
import { Status } from '../shared/status';
import {
  DOVE_PREVIEW_LIMIT,
  DOVE_PREVIEW_REPLIES_LIMIT,
  DOVE_THREAD_HARD_LIMIT,
  DOVE_THREAD_SOFT_LIMIT,
} from '../constants';
import { DB } from './db';

const i18n = I18N.locales[Env.config.DOVE_LANG];

export namespace View {
  export namespace Fragments {
    export type F<P = void, R = void> = (props: P) => R;

    export type Fragment<P = void> = F<P, string>;

    export const ErrorLayout: Fragment<{
      body: Status.Body;
    }> = ({ body }) => {
      return `
        <!DOCTYPE html>
        <html lang="${Env.config.DOVE_LANG}">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1.0" />
            <title>HTTP ${body.statusCode} — ${i18n.appName}</title>
            <style>
              html { color-scheme: dark light }
              body { text-align: center }
            </style>
          </head>
          <body>
            <h1>HTTP ${body.statusCode}</h1>
            <p>${body.message}<p>
          </body>
        </html>
      `;
    };

    export const Layout: Fragment<{
      title: string;
      mainChildren: string;
      asideChildren?: string;
      style?: string;
      script?: string;
    }> = ({
      title,
      mainChildren,
      asideChildren = '',
      style = '',
      script = '',
    }) => {
      return `
        <!DOCTYPE html>
        <html lang="${Env.config.DOVE_LANG}">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1.0" />
            <title>${title}</title>
            <style>
              ${style}
            </style>
          </head>
          <body class="dove-view">
            <header class="dove-view-header">
              <a href="/">
                <h1>🕊️ ${i18n.appName}<sup style="font: italic 200 0.8rem serif;">~alpha</sup></h1>
              </a>
            </header>
            <main class="dove-view-main">
              ${mainChildren}
            </main>
            <aside class="dove-view-aside">
              ${asideChildren}
            </aside>
            <footer class="dove-view-footer">
              <p>${i18n.appName} — ${i18n.appCaption}</p>
              <p><a href="/">home</a></p>
            </footer>
            <script>
              ${script}
            </script>
          </body>
        </html>
      `;
    };
  }

  export namespace Utils {
    const createAssetLoader = (filename: string) => {
      let cached = '';

      return async () => {
        if (cached) {
          return cached;
        }

        const result = await Files.read(`./src/assets/${filename}`);

        cached = result;

        return result;
      };
    };

    export const loadStyleAsset = createAssetLoader('style.css');

    export const loadScriptAsset = createAssetLoader('script.js');
  }

  export const buildThreads = async (): Promise<void> => {
    const threads = DB.selectThreads();

    const risingThreads = threads
      .sort((prev, next) => {
        const prevReplies = prev.replies.entries.slice(
          0,
          DOVE_THREAD_SOFT_LIMIT
        );

        const prevCreated =
          prevReplies?.at(-1)?.created || prev.created;

        const nextReplies = next.replies.entries.slice(
          0,
          DOVE_THREAD_SOFT_LIMIT
        );

        const nextCreated =
          nextReplies?.at(-1)?.created || next.created;

        return nextCreated - prevCreated;
      })
      .slice(0, DOVE_PREVIEW_LIMIT);

    const latestThreads = threads.sort((next, prev) => {
      return prev.created - next.created;
    });

    const mainThreadsHtml = risingThreads
      .map((thread) => {
        const replies = thread.replies.entries;
        const start = Math.max(
          replies.length - DOVE_PREVIEW_REPLIES_LIMIT
        );

        const repliesHtml = replies
          .slice(start)
          .map((reply) => JSON.stringify(reply))
          .join('');

        const threadHtml = JSON.stringify(thread);

        return `
        <article class="dove-preview">
          ${threadHtml}
          ${repliesHtml}
        </article>
      `;
      })
      .join('');

    const mainHtml = `
    <form
      method="POST"
      action="/threads"
      enctype="application/x-www-form-urlencoded"
      data-autosave="thread"
    >
      <h2>${i18n.threads.createHeader}</h2>
    </form>
    <section>
      <h2>${i18n.threads.latestHeader}</h2>
      ${mainThreadsHtml}
    </section>
  `;

    const asideThreadsHtml = latestThreads
      .map((thread) => thread.id)
      .join('');

    const asideHtml = `
    <details>
      <summary class="dove-details-summary">
        ${i18n.threads.indexHeader}
      </summary>
      <section class="dove-index">
        ${asideThreadsHtml}
      </section>
    </details>
  `;

    const style = await Utils.loadStyleAsset();
    const script = await Utils.loadScriptAsset();

    const html = Fragments.Layout({
      title: i18n.threads.title,
      mainChildren: mainHtml,
      asideChildren: asideHtml,
      style,
      script,
    });

    await Files.write(`${Env.config.DOVE_VIEW_ROOT}/index.html`, html);
  };

  export const buildReplies = async (
    threadId: number
  ): Promise<void> => {
    const thread = DB.selectThreadById(threadId);

    const threadHtml = JSON.stringify(thread);

    const repliesHtml = thread.replies.entries
      .map((reply) => JSON.stringify(reply))
      .join('');

    const style = await Utils.loadStyleAsset();
    const script = await Utils.loadScriptAsset();

    let postingHtml = `
      <form
        data-autosave="reply"
        data-autoid-form
        method="POST"
        action="/threads/${threadId}/replies"
        enctype="application/x-www-form-urlencoded"
      >
        <h2>${i18n.replies.createHeader}</h2>
      </form>
      `;

    let calloutHtml = '';

    if (thread.replies.entries.length >= DOVE_THREAD_SOFT_LIMIT) {
      calloutHtml = i18n.replies.softLimitReached;
    }

    if (thread.replies.entries.length >= DOVE_THREAD_HARD_LIMIT) {
      postingHtml = '';

      calloutHtml = i18n.replies.hardLimitReached;
    }

    const html = Fragments.Layout({
      title: i18n.replies.title,
      mainChildren: `
        ${threadHtml}
        ${repliesHtml}
        ${calloutHtml}
        ${postingHtml}
      `,
      style,
      script,
    });

    await Files.write(
      `${Env.config.DOVE_VIEW_ROOT}/threads/${threadId}/index.html`,
      html
    );
  };

  export const cleanReplies = async (
    threadId: number
  ): Promise<void> => {
    await Files.remove(
      `${Env.config.DOVE_VIEW_ROOT}/threads/${threadId}`
    );
  };

  export const make = async (
    options: { buildThread?: number; cleanThreads?: number[] } = {}
  ): Promise<void> => {
    await buildThreads();

    if (options.buildThread) {
      const threadId = options.buildThread;

      await buildReplies(threadId);
    }

    if (options.cleanThreads) {
      for (const threadId of options.cleanThreads) {
        await cleanReplies(threadId);
      }
    }
  };
}
