import Files from 'files';
import { Env } from '../shared/env';
import { I18N } from '../shared/i18n';
import { Status } from '../shared/status';
import {
  DOVE_APP_CAPTION,
  DOVE_APP_NAME,
  DOVE_CONTENT_MAX,
  DOVE_CONTENT_MIN,
  DOVE_LINE_CONTENT_LIMIT,
  DOVE_PASSWORD_MAX,
  DOVE_PASSWORD_MIN,
  DOVE_PREVIEW_CONTENT_LIMIT,
  DOVE_PREVIEW_LIMIT,
  DOVE_PREVIEW_REPLIES_LIMIT,
  DOVE_THREAD_HARD_LIMIT,
  DOVE_THREAD_SOFT_LIMIT,
  DOVE_TITLE_CONTENT_LIMIT,
} from '../constants';
import { DB } from './db';
import { Seconds } from '../shared/seconds';
import { Functional } from '../shared/functional';

const i18n = I18N.locales[Env.config.DOVE_LANG];

export namespace View {
  export namespace Markup {
    export type Mapper = Functional.Action<string, string>;

    export type Operator<TArg = void> = Functional.Action<TArg, Mapper>;

    export const sanitize: Operator = () => {
      return (source = '') => {
        return source
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');
      };
    };

    export const preview: Operator<{
      max: number;
      cut?: string;
    }> = ({ max, cut = '' }) => {
      if (!max) {
        return (source = '') => source;
      }

      return (source = '') => {
        if (!source) {
          return '';
        }

        const maxLines = Math.round(max / 80);
        const starter = source
          .substring(0, max)
          .split('\n')
          .slice(0, maxLines)
          .join('\n');

        if (source.length === starter.length) {
          return starter;
        }

        return starter.concat(cut);
      };
    };

    export const linkAnchors: Operator = () => {
      return (source = '') => {
        return source.replace(
          /https?:\/\/\S{1,1000}|@\d{1,10}(#\d{1,10})?|#\d{1,10}/g,
          (pattern) => {
            if (pattern.startsWith('#')) {
              const replyId = pattern.slice(1);

              return `<a class="markup-link" href="#reply-${replyId}">${pattern}</a>`;
            }

            if (pattern.startsWith('h')) {
              const href = pattern.replace(/(,|\.|\(|\))+$/, '');
              const rest = pattern.substring(href.length);

              return `<a class="markup-anchor" href="${href}" rel="noreferrer" target="_blank">${href}</a>${rest}`;
            }

            if (pattern.startsWith('@')) {
              const [threadId, replyId] = pattern.slice(1).split('#');

              if (replyId) {
                return `<a class="markup-link" href="/threads/${threadId}#reply-${replyId}">${pattern}</a>`;
              }

              return `<a class="markup-link" href="/threads/${threadId}">${pattern}</a>`;
            }

            return '';
          }
        );
      };
    };

    export const breakSections: Operator = () => {
      return (source = '') => {
        const quoteMark = '&gt;';

        return source
          .split(/\n{2}/)
          .map((section) => {
            return section
              .split(/ *\n/)
              .map((line) => {
                if (line.startsWith(quoteMark)) {
                  return `<q class="markup-quote">${line}</q>`;
                }

                return line;
              })
              .join('<br />');
          })
          .map((section) => {
            return `<p class="markup-paragraph">${section}</p>`;
          })
          .join('');
      };
    };

    const fromSanitize = new Functional.Pipe(sanitize());

    export const contentMapper = fromSanitize
      .then(preview({ max: 0 }))
      .then(linkAnchors())
      .then(breakSections())
      .compile();

    export const contentPreviewMapper = fromSanitize
      .then(
        preview({
          max: DOVE_PREVIEW_CONTENT_LIMIT,
          cut: ' <em class="markup-cut">[...]</em>',
        })
      )
      .then(linkAnchors())
      .then(breakSections())
      .compile();

    export const contentLineMapper = fromSanitize
      .then(preview({ max: DOVE_LINE_CONTENT_LIMIT }))
      .compile();

    export const contentTitleMapper = fromSanitize
      .then(preview({ max: DOVE_TITLE_CONTENT_LIMIT, cut: '...' }))
      .compile();
  }

  export namespace Fragments {
    export type Fragment<TProps = void> = Functional.Action<
      TProps,
      string
    >;

    export type Page = 'threads' | 'replies';

    export const Time: Fragment<number> = (seconds: number) => {
      const value = Seconds.toStamp(seconds);

      return `<time class="dove-datetime" datetime="${value}">${value}</time>`;
    };

    export const Callout: Fragment<string> = (text) => {
      return `
        <aside class="dove-callout">
          <p>${text}</p>
        </aside>
      `;
    };

    export const Restriction: Fragment<{
      restriction: DB.Restriction;
    }> = ({ restriction }) => {
      return `
        <aside class="dove-restriction is-${restriction}">
          ${i18n.shared.restriction[restriction]}
        </aside>
      `;
    };

    export const ThreadCard: Fragment<{
      page: Page;
      thread: DB.Thread;
    }> = ({ page, thread }) => {
      const createdHtml = Time(thread.created);
      const lengthHtml = i18n.shared.repliesCount(
        thread.replies.entries.length
      );

      const restrictionHtml = thread.restriction
        ? Restriction({ restriction: thread.restriction })
        : '';

      if (page === 'threads') {
        const idHtml = `<a href="/threads/${thread.id}">@${thread.id}</a>`;
        const contentHtml = Markup.contentPreviewMapper(thread.content);

        return `
          <article class="dove-card is-thread" id="thread-${thread.id}">
            <header class="dove-card-header">
              ${idHtml}
              ${createdHtml}
            </header>
            <section class="dove-card-content">
              ${contentHtml}
            </section>
            ${restrictionHtml}
            <footer class="dove-card-footer">
              ${lengthHtml}
            </footer>
          </article>
        `;
      }

      if (page === 'replies') {
        const idHtml = `<span>@${thread.id}</span>`;
        const contentHtml = Markup.contentMapper(thread.content);

        return `
          <article class="dove-card is-thread" id="thread-${thread.id}">
            <header class="dove-card-header">
              ${idHtml}
              ${createdHtml}
            </header>
            <section class="dove-card-content">
              ${contentHtml}
            </section>
            ${restrictionHtml}
            <footer class="dove-card-footer">
              ${lengthHtml}
            </footer>
          </article>
        `;
      }

      throw new Error(`Unknown page: ${page}`);
    };

    export const ReplyCard: Fragment<{
      page: Page;
      threadId: number;
      reply: DB.Reply;
    }> = ({ page, threadId, reply }) => {
      const createdHtml = Fragments.Time(reply.created);

      const restricionHtml = reply.restriction
        ? Restriction({ restriction: reply.restriction })
        : '';

      if (page === 'threads') {
        const idHtml = `<a href="/threads/${threadId}#reply-${reply.id}">#${reply.id}</a>`;
        const contentHtml = Markup.contentPreviewMapper(reply.content);

        return `
          <article class="dove-card is-reply">
            <header class="dove-card-header">
              ${idHtml}
              ${createdHtml}
            </header>
            <section class="dove-card-content">
              ${contentHtml}
            </section>
            ${restricionHtml}
          </article>
        `;
      }

      if (page === 'replies') {
        const idHtml = `<a href="#reply-${reply.id}" data-autoid-reply="${reply.id}">#${reply.id}</a>`;
        const contentHtml = Markup.contentMapper(reply.content);

        return `
          <article class="dove-card is-reply" id="reply-${reply.id}">
            <header class="dove-card-header">
              ${idHtml}
              ${createdHtml}
            </header>
            <section class="dove-card-content">
              ${contentHtml}
            </section>
            ${restricionHtml}
          </article>
        `;
      }

      throw new Error(`Unknown page: ${page}`);
    };

    export const ThreadLine: Fragment<{
      thread: DB.Thread;
    }> = ({ thread }) => {
      const idHtml = `<a href="/threads/${thread.id}">@${thread.id}</a>`;
      const contentHtml = Markup.contentLineMapper(thread.content);
      const lengthHtml = `(${thread.replies.entries.length})`;

      return `
        ${idHtml}
        <div class="dove-index-content">${contentHtml}</div>
        <div>${lengthHtml}</div>
      `;
    };

    export const Fields: Fragment = () => {
      return `
        <div class="dove-controls">
          <textarea
            class="dove-control"
            name="content"
            placeholder="${i18n.shared.content}"
            required="required"
            minlength="${DOVE_CONTENT_MIN}"
            maxlength="${DOVE_CONTENT_MAX}"
            rows="3"
            data-autosize
          ></textarea>
          <hr class="dove-hr" />
          <div class="dove-controls-group">
            <input
              class="dove-control"
              type="password"
              name="password"
              placeholder="${i18n.shared.password}"
              minlength="${DOVE_PASSWORD_MIN}"
              maxlength="${DOVE_PASSWORD_MAX}"
            />
            <button
              class="dove-button"
              type="submit"
            >
              ${i18n.shared.createButton}
            </button>
          </div>
        </div>
      `;
    };

    export const ErrorLayout: Fragment<{
      body: Status.Body;
    }> = ({ body }) => {
      return `
        <!DOCTYPE html>
        <html lang="${Env.config.DOVE_LANG}">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1.0" />
            <title>HTTP ${body.statusCode} — ${DOVE_APP_NAME}</title>
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
                <h1>🕊️ ${DOVE_APP_NAME}<sup style="font: italic 200 0.8rem serif;">~alpha</sup></h1>
              </a>
            </header>
            <main class="dove-view-main">
              ${mainChildren}
            </main>
            <aside class="dove-view-aside">
              ${asideChildren}
            </aside>
            <footer class="dove-view-footer">
              <p>${DOVE_APP_NAME} — ${DOVE_APP_CAPTION}</p>
              <p><a href="/">${i18n.shared.homeLink}</a></p>
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
        const threadId = thread.id;
        const replies = thread.replies.entries;
        const start = Math.max(
          replies.length - DOVE_PREVIEW_REPLIES_LIMIT
        );

        const repliesHtml = replies
          .slice(start)
          .map((reply) =>
            Fragments.ReplyCard({ page: 'threads', threadId, reply })
          )
          .join('');

        const threadHtml = Fragments.ThreadCard({
          page: 'threads',
          thread,
        });

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
      <h2>${i18n.threadsView.createHeader}</h2>
      ${Fragments.Fields()}
    </form>
    <section>
      <h2>${i18n.threadsView.latestHeader}</h2>
      ${mainThreadsHtml}
    </section>
  `;

    const asideThreadsHtml = latestThreads
      .map((thread) => Fragments.ThreadLine({ thread }))
      .join('');

    const asideHtml = `
    <details>
      <summary class="dove-details-summary">
        ${i18n.threadsView.indexHeader}
      </summary>
      <section class="dove-index">
        ${asideThreadsHtml}
      </section>
    </details>
  `;

    const style = await Utils.loadStyleAsset();
    const script = await Utils.loadScriptAsset();

    const html = Fragments.Layout({
      title: i18n.threadsView.title,
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

    const titleHtml = Markup.contentTitleMapper(thread.content);

    const threadHtml = Fragments.ThreadCard({
      page: 'replies',
      thread,
    });

    const repliesHtml = thread.replies.entries
      .map((reply) =>
        Fragments.ReplyCard({ page: 'replies', threadId, reply })
      )
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
        <h2>${i18n.repliesView.createHeader}</h2>
        ${Fragments.Fields()}
      </form>
      `;

    let calloutHtml = '';

    if (thread.replies.entries.length >= DOVE_THREAD_SOFT_LIMIT) {
      calloutHtml = i18n.repliesView.softLimitReached;
    }

    if (thread.replies.entries.length >= DOVE_THREAD_HARD_LIMIT) {
      postingHtml = '';

      calloutHtml = i18n.repliesView.hardLimitReached;
    }

    const html = Fragments.Layout({
      title: `@${thread.id} ${titleHtml}`,
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
