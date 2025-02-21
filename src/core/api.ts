import { RateLimitOptions } from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { Commands } from '../shared/commands';
import { Schemas } from '../shared/schemas';
import { Seconds } from '../shared/seconds';
import { Server } from '../shared/server';
import { Status } from '../shared/status';
import { DB } from './db';
import { Security } from './security';
import { View } from './view';

declare module 'fastify' {
  interface FastifyReply {
    redirectUrl: string;
    handleRedurectUrl: () => FastifyReply;
    handleAutosave: (autosave: string | undefined) => FastifyReply;
  }
}

export namespace Api {
  export const create = async (): Promise<FastifyInstance> => {
    const api = await Server.create();

    api.setErrorHandler(async function (error, req, rep) {
      const statusCode = error?.statusCode || 500;
      const message = error?.message || 'Internal Server Error';

      const html = View.Fragments.ErrorLayout({
        body: { statusCode, message },
      });

      rep
        .code(statusCode)
        .header('content-type', 'text/html')
        .send(html);
    });

    api.setNotFoundHandler(async function (req, rep) {
      const html = View.Fragments.ErrorLayout({
        body: Status.notFound(),
      });

      rep.code(404).header('content-type', 'text/html').send(html);
    });

    api.decorateReply('redirectUrl', '/');

    api.decorateReply('handleRedurectUrl', function () {
      return this.redirect(this.redirectUrl);
    });

    api.decorateReply(
      'handleAutosave',
      function (autosave: string | undefined) {
        if (autosave) {
          this.header(
            'set-cookie',
            `dove-autosave=${autosave}; Path=/`
          );
        }

        return this;
      }
    );

    const rateLimit: RateLimitOptions = {
      timeWindow: 15_000,
      max: 3,
    };

    api.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/threads',
      config: {
        rateLimit,
      },
      schema: {
        body: Schemas.bodySchema,
      },
      handler: async function (req, rep) {
        const { _autosave, content, password } = req.body;

        const ipHash = await Security.hashIp(req.ip);
        const passwordHash = await Security.hashPassword(password);

        await Commands.parse(content, {
          '': async () => {
            await Security.assertNotBanned(ipHash);

            const id = DB.mutate(() => {
              return DB.insertThread({ content, ipHash, passwordHash });
            });

            rep.redirectUrl = `/threads/${id}`;

            await View.make({ buildThread: id });
          },
          '/warn': Commands.idHandler(async (id) => {
            await Security.assertCanPerform(password);

            DB.mutate(() => {
              DB.updateThreads([id], { restriction: 'warning' });
            });

            await View.make({ buildThread: id });
          }),
          '/ban': Commands.idHandler(async (id) => {
            await Security.assertCanPerform(password);
            const { ipHash } = DB.selectThreadById(id);

            const expires = Seconds.now() + Seconds.YEAR;

            DB.mutate(() => {
              DB.insertBan(ipHash, { expires });
              DB.updateThreads([id], { restriction: 'ban' });
            });

            await View.make({ buildThread: id });
          }),
          '/delete': Commands.idsHandler(async (ids) => {
            const passwordHashes = DB.selectThreadsByIds(ids).map(
              (thread) => thread.passwordHash
            );

            await Security.assertHasAccess(password, passwordHashes);

            DB.mutate(() => {
              DB.deleteThreads(ids);
            });

            await View.make({ cleanThreads: ids });
          }),
        });

        rep.handleAutosave(_autosave).handleRedurectUrl();
      },
    });

    api.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/threads/:threadId/replies',
      config: {
        rateLimit,
      },
      schema: {
        params: z.object({
          threadId: z.number({ coerce: true }).int().gt(0),
        }),
        body: Schemas.bodySchema,
      },
      handler: async function (req, rep) {
        const { threadId } = req.params;
        const { _autosave, content, password } = req.body;

        const ipHash = await Security.hashIp(req.ip);
        const passwordHash = await Security.hashPassword(password);

        await Commands.parse(content, {
          '': async () => {
            await Security.assertNotBanned(ipHash);
            await Security.assertRepliesAreAllowed(threadId);

            const id = DB.mutate(() => {
              return DB.insertReply(threadId, {
                content,
                ipHash,
                passwordHash,
              });
            });

            rep.redirectUrl = `/threads/${threadId}#reply-${id}`;

            await View.make({ buildThread: threadId });
          },
          '/warn': Commands.idHandler(async (id) => {
            await Security.assertCanPerform(password);

            DB.mutate(() => {
              DB.updateReplies(threadId, [id], {
                restriction: 'warning',
              });
            });

            rep.redirectUrl = `/threads/${threadId}`;

            await View.make({ buildThread: threadId });
          }),
          '/ban': Commands.idHandler(async (id) => {
            await Security.assertCanPerform(password);

            const { ipHash } = DB.selectReplyById(threadId, id);
            const expires = Seconds.now() + Seconds.YEAR;

            DB.mutate(() => {
              DB.insertBan(ipHash, { expires });
              DB.updateReplies(threadId, [id], { restriction: 'ban' });
            });

            await View.make({ buildThread: threadId });
          }),
          '/delete': Commands.idsHandler(async (ids) => {
            const passwordHashes = DB.selectThreadsByIds(ids).map(
              (thread) => thread.passwordHash
            );

            await Security.assertHasAccess(password, passwordHashes);

            DB.mutate(() => {
              DB.deleteReplies(threadId, ids);
            });

            rep.redirectUrl = `/threads/${threadId}`;

            await View.make({ buildThread: threadId });
          }),
        });

        rep.handleAutosave(_autosave).handleRedurectUrl();
      },
    });

    return api;
  };
}
