import { RateLimitOptions } from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Server } from '../shared/server';
import { Status } from '../shared/status';
import { DOVE_CONTENT_MAX, DOVE_CONTENT_MIN } from '../constants';
import { View } from './view';

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
        .regex(/^[^\s]+$/)
        .transform((content) =>
          content
            .replace(/\r?\n/g, '\n')
            .replace(/\n\n+/g, '\n\n')
            .replace(/\s+\n/g, '\n')
        ),
      password: z.optional(z.string().min(0).max(0)),
    });

    api.route({
      method: 'POST',
      url: '/threads',
      config: {
        rateLimit,
      },
      schema: {
        body,
      },
      handler: async function () {
        throw Status.internalServerError('Not implemented');
      },
    });

    api.route({
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
      handler: async function () {
        throw Status.internalServerError('Not implemented');
      },
    });

    return api;
  };
}
