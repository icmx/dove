import { Env } from '../shared/env';
import { Status } from '../shared/status';

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
            <title>HTTP ${body.statusCode} — dove</title>
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
  }
}
