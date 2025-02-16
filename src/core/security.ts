import { Env } from '../shared/env';
import { Hashing } from '../shared/hashing';
import { Status } from '../shared/status';
import { DOVE_THREAD_HARD_LIMIT } from '../constants';
import { DB } from './db';

export namespace Security {
  export const hashIp = async (ip: string): Promise<string> => {
    return Hashing.hash(ip, Env.config.DOVE_SALT);
  };

  export const hashPassword = async (
    password: string | undefined
  ): Promise<string | undefined> => {
    if (!password) {
      return undefined;
    }

    return Hashing.hash(password, Env.config.DOVE_SALT);
  };

  export const assertRepliesAreAllowed = (threadId: number): void => {
    const thread = DB.selectThreadById(threadId);

    if (thread.replies.entries.length >= DOVE_THREAD_HARD_LIMIT) {
      throw Status.badRequest(
        `Thread hard limit is reached (${DOVE_THREAD_HARD_LIMIT}). No more replies are allowed`
      );
    }

    if (thread.locked) {
      throw Status.forbidden(
        'Thread is locked. No more replies are allowed'
      );
    }
  };
}
