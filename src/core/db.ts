import { JSONFileSyncPreset } from 'lowdb/node';
import { Env } from '../shared/env';
import { Seconds } from '../shared/seconds';
import { Status } from '../shared/status';

export namespace DB {
  export type Collection<TEntry> = {
    counter: number;
    entries: TEntry[];
  };

  export type Ban = {
    created: number;
    expires: number;
  };

  export type Restriction = 'warning' | 'ban';

  export type Reply = {
    id: number;
    created: number;
    content: string;
    restriction?: Restriction;
    ipHash: string;
    passwordHash?: string;
  };

  export interface Thread {
    id: number;
    created: number;
    locked?: boolean;
    content: string;
    restriction?: Restriction;
    ipHash: string;
    passwordHash?: string;
    replies: Collection<Reply>;
  }

  export const db = JSONFileSyncPreset<{
    bans: Record<string, Ban | undefined>;
    threads: Collection<Thread>;
  }>(Env.config.DOVE_DB_FILENAME, {
    bans: {},
    threads: {
      counter: 0,
      entries: [],
    },
  });

  export const mutate = <TResult>(mutation: () => TResult): TResult => {
    db.read();

    const result = mutation();

    db.write();

    return result;
  };

  export const insertBan = (
    ipHash: string,
    data: Pick<Ban, 'expires'>
  ): void => {
    const created = Seconds.now();

    db.data.bans[ipHash] = { created, ...data };
  };

  export const selectBan = (ipHash: string): Ban | null => {
    const ban = db.data.bans[ipHash] || null;

    return ban;
  };

  export const deleteBans = (ipHashes: string[]): void => {
    ipHashes.forEach((ipHash) => {
      db.data.bans[ipHash] = undefined;
    });
  };

  export const insertThread = (
    data: Pick<Thread, 'content' | 'ipHash' | 'passwordHash'>
  ): number => {
    const id = db.data.threads.counter + 1;
    const created = Seconds.now();
    const replies: Collection<Reply> = {
      counter: 0,
      entries: [],
    };

    const thread: Thread = {
      id,
      created,
      ...data,
      replies,
    };

    db.data.threads.entries.push(thread);
    db.data.threads.counter = id;

    return id;
  };

  export const selectThreads = (): Thread[] => {
    return db.data.threads.entries;
  };

  export const selectThreadsByIds = (ids: number[]): Thread[] => {
    return selectThreads().filter((thread) => ids.includes(thread.id));
  };

  export const selectThreadById = (id: number): Thread => {
    const thread = db.data.threads.entries.find(
      (entry) => entry.id === id
    );

    if (!thread) {
      throw Status.notFound(`Thread @${id} not found`);
    }

    return thread;
  };

  export const updateThreads = (
    ids: number[],
    data: Pick<Thread, 'restriction' | 'locked'>
  ): void => {
    db.data.threads.entries = db.data.threads.entries.map((entry) => {
      if (!ids.includes(entry.id)) {
        return entry;
      }

      return { ...entry, ...data };
    });
  };

  export const deleteThreads = (ids: number[]): void => {
    db.data.threads.entries = db.data.threads.entries.filter(
      (entry) => {
        return !ids.includes(entry.id);
      }
    );
  };

  export const insertReply = (
    threadId: number,
    data: Pick<Reply, 'content' | 'ipHash' | 'passwordHash'>
  ): number => {
    const thread = selectThreadById(threadId);

    const id = thread.replies.counter + 1;
    const created = Seconds.now();

    const reply: Reply = {
      id,
      created,
      ...data,
    };

    thread.replies.entries.push(reply);
    thread.replies.counter = id;

    return id;
  };

  export const selectReplies = (threadId: number): Reply[] => {
    const thread = selectThreadById(threadId);

    return thread.replies.entries;
  };

  export const selectReplyById = (
    threadId: number,
    id: number
  ): Reply => {
    const thread = selectThreadById(threadId);
    const reply = thread.replies.entries.find(
      (entry) => entry.id === id
    );

    if (!reply) {
      throw Status.notFound(
        `Reply #${id} in thread @${threadId} not found`
      );
    }

    return reply;
  };

  export const updateReplies = (
    threadId: number,
    ids: number[],
    data: Pick<Reply, 'restriction'>
  ): void => {
    const thread = selectThreadById(threadId);

    thread.replies.entries = thread.replies.entries.map((entry) => {
      if (!ids.includes(entry.id)) {
        return entry;
      }

      return { ...entry, ...data };
    });
  };

  export const deleteReplies = (
    threadId: number,
    ids: number[]
  ): void => {
    const thread = selectThreadById(threadId);

    thread.replies.entries = thread.replies.entries.filter((entry) => {
      return !ids.includes(entry.id);
    });
  };
}
