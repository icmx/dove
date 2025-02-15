import { DOVE_LANGS } from '../constants';

export namespace I18N {
  export type Data = {
    appName: string;
    appCaption: string;
    threads: {
      title: string;
      createHeader: string;
      createButton: string;
      latestHeader: string;
      indexHeader: string;
    };
    replies: {
      title: string;
      createHeader: string;
      createButton: string;
      softLimitReached: string;
      hardLimitReached: string;
    };
  };

  export type Lang = (typeof DOVE_LANGS)[number];

  export const en: Data = {
    appName: 'dove',
    appCaption: 'experimental textboard',
    threads: {
      title: 'Threads',
      createHeader: 'Create a new thread',
      createButton: 'Send',
      latestHeader: 'Latest threads',
      indexHeader: 'Full index',
    },
    replies: {
      title: 'Replies',
      createHeader: 'Create a new reply',
      createButton: 'Send',
      softLimitReached:
        'This thread has reached the raises limit. New replies would not rise it.',
      hardLimitReached:
        'This thread has reached the replies limit. No more replies can be created in here.',
    },
  };

  export const locales: Record<Lang, Data> = {
    en,
  };
}
