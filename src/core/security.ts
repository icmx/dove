import { Env } from '../shared/env';
import { Hashing } from '../shared/hashing';
import { Status } from '../shared/status';
import { DOVE_THREAD_HARD_LIMIT } from '../constants';
import { DB } from './db';
import { Seconds } from '../shared/seconds';

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

  export const assertRepliesAreAllowed = async (
    threadId: number
  ): Promise<void> => {
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

  export const assertCanPerform = async (
    password: string | undefined
  ): Promise<void> => {
    if (!password) {
      throw Status.unauthorized('No password provided');
    }

    if (password === Env.config.DOVE_PASSWORD) {
      return;
    }

    throw Status.forbidden('Invalid password');
  };

  export const assertHasAccess = async (
    password: string | undefined,
    passwordHashes: (string | undefined)[]
  ): Promise<void> => {
    if (!password) {
      throw Status.unauthorized('No password provided');
    }

    if (password === Env.config.DOVE_PASSWORD) {
      return;
    }

    const error = Status.forbidden('Invalid password');

    if (passwordHashes.length > 3) {
      throw Status.badRequest('Too many passwords');
    }

    for (const passwordHash of passwordHashes) {
      if (!passwordHash) {
        throw error;
      }

      const verified = await Hashing.verify(
        passwordHash,
        password,
        Env.config.DOVE_SALT
      );

      if (!verified) {
        throw error;
      }
    }
  };

  export const assertNotBanned = async (
    ipHash: string
  ): Promise<void> => {
    const ban = DB.selectBan(ipHash);

    if (!ban) {
      return;
    }

    if (Seconds.isExpired(ban.expires)) {
      return;
    }

    throw Status.forbidden('You are banned');
  };
}
