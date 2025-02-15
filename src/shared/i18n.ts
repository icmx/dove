import { DOVE_LANGS } from '../constants';

export namespace I18N {
  export type Data = {
    appName: string;
    appCaption: string;
    threadsView: {
      title: string;
      createHeader: string;
      latestHeader: string;
      indexHeader: string;
    };
    repliesView: {
      title: string;
      createHeader: string;
      softLimitReached: string;
      hardLimitReached: string;
    };
    shared: {
      createButton: string;
      content: string;
      password: string;
      restriction: {
        warning: string;
        ban: string;
      };
      repliesCount: (count: number) => string;
    };
  };

  export type Lang = (typeof DOVE_LANGS)[number];

  export const en: Data = {
    appName: 'dove',
    appCaption: 'experimental textboard',
    threadsView: {
      title: 'Threads',
      createHeader: 'Create a new thread',
      latestHeader: 'Latest threads',
      indexHeader: 'Full index',
    },
    repliesView: {
      title: 'Replies',
      createHeader: 'Create a new reply',
      softLimitReached:
        'This thread has reached the raises limit. New replies would not rise it.',
      hardLimitReached:
        'This thread has reached the replies limit. No more replies can be created in here.',
    },
    shared: {
      createButton: 'Send',
      content: 'Content',
      password: 'Password',
      restriction: {
        warning: 'This user was warned',
        ban: 'This user was banned',
      },
      repliesCount: (count) => {
        if (count > 1) {
          return `${count} replies`;
        }

        if (count === 1) {
          return `1 reply`;
        }

        return 'No replies yet';
      },
    },
  };

  export const locales: Record<Lang, Data> = {
    en,
  };
}
