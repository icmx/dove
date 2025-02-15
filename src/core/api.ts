import { RateLimitOptions } from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { Commands } from '../shared/commands';
import { Server } from '../shared/server';
import { Status } from '../shared/status';
import {
  DOVE_CONTENT_MAX,
  DOVE_CONTENT_MIN,
  DOVE_PASSWORD_MAX,
  DOVE_PASSWORD_MIN,
} from '../constants';
import { DB } from './db';
import { View } from './view';
import { Security } from './security';

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

    const body = z.object({
      _autosave: z.optional(z.enum(['reply', 'thread'])),
      content: z
        .string()
        .min(DOVE_CONTENT_MIN)
        .max(DOVE_CONTENT_MAX)
        .regex(/[^\s]/g)
        .transform((content) =>
          content
            .replace(/\r?\n/g, '\n')
            .replace(/\n\n+/g, '\n\n')
            .replace(/\s+\n/g, '\n')
        ),
      password: z.optional(
        z.string().min(DOVE_PASSWORD_MIN).max(DOVE_PASSWORD_MAX)
      ),
    });

    api.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/threads',
      config: {
        rateLimit,
      },
      schema: {
        body,
      },
      handler: async function (req, rep) {
        const { _autosave, content, password } = req.body;

        const ipHash = await Security.hashIp(req.ip);
        const passwordHash = await Security.hashPassword(password);

        Commands.parse(content, {
          '': () => {
            const id = DB.mutate(() => {
              return DB.insertThread({ content, ipHash, passwordHash });
            });

            rep.redirectUrl = `/threads/${id}`;
          },
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
        body,
      },
      handler: async function (req, rep) {
        const { threadId } = req.params;
        const { _autosave, content, password } = req.body;

        const ipHash = await Security.hashIp(req.ip);
        const passwordHash = await Security.hashPassword(password);

        await Commands.parse(content, {
          '': () => {
            const id = DB.mutate(() => {
              return DB.insertReply(threadId, {
                content,
                ipHash,
                passwordHash,
              });
            });

            rep.redirectUrl = `/threads/${threadId}#reply-${id}`;
          },
        });

        rep.handleAutosave(_autosave).handleRedurectUrl();
      },
    });

    return api;
  };
}
