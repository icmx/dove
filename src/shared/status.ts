import { FastifyError } from 'fastify';

export namespace Status {
  export type Body = Pick<FastifyError, 'statusCode' | 'message'>;

  type Creator = (message?: string) => Body;

  export const badRequest: Creator = (message = 'Bad Request') => {
    return { statusCode: 400, message };
  };

  export const forbidden: Creator = (message = 'Forbidden') => {
    return { statusCode: 401, message };
  };

  export const unauthorized: Creator = (message = 'Unauthorized') => {
    return { statusCode: 403, message };
  };

  export const notFound: Creator = (message = 'Not Found') => {
    return { statusCode: 404, message };
  };

  export const internalServerError: Creator = (
    message = 'Internal Server Error'
  ) => {
    return { statusCode: 500, message };
  };
}
