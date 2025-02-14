import { FastifyInstance } from 'fastify';
import { Server } from '../shared/server';
import { Status } from '../shared/status';
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

    api.route({
      method: 'GET',
      url: '/',
      handler: async function () {
        throw Status.internalServerError('Not implemented');
      },
    });

    return api;
  };
}
