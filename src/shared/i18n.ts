import { DOVE_LANGS } from '../constants';

export namespace I18N {
  export type Data = {
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

        return 'No replies';
      },
    },
  };

  export const ru: Data = {
    threadsView: {
      title: 'Треды',
      createHeader: 'Создать новый тред',
      latestHeader: 'Последние треды',
      indexHeader: 'Все треды',
    },
    repliesView: {
      title: 'Ответы',
      createHeader: 'Создать новый ответ',
      softLimitReached:
        'Слишком много ответов. Новые ответы больше не поднимают этот тред.',
      hardLimitReached:
        'Слишком много ответов. В этот тред больше нельзя отвечать.',
    },
    shared: {
      createButton: 'Отправить',
      content: 'Содержимое',
      password: 'Пароль',
      restriction: {
        warning: 'Этот пользователь был предупрежден',
        ban: 'Этот пользователь был забанен',
      },
      repliesCount: (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
          return `1 ответ`;
        }

        if (
          count % 10 >= 2 &&
          count % 10 <= 4 &&
          (count % 100 < 10 || count % 100 >= 20)
        ) {
          return `${count} ответа`;
        }

        if (count > 0) {
          return `${count} ответов`;
        }

        return 'Нет ответов';
      },
    },
  };

  export const locales: Record<Lang, Data> = {
    en,
    ru,
  };
}
