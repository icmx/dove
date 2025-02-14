import { Env } from '../shared/env';
import { Hashing } from '../shared/hashing';

export namespace Security {
  export const hashIp = async (ip: string): Promise<string> => {
    return Hashing.hash(ip, Env.config.DOVE_SALT);
  };

  export const hashPassword = async (
    password: string
  ): Promise<string | undefined> => {
    if (!password) {
      return undefined;
    }

    return Hashing.hash(password, Env.config.DOVE_SALT);
  };
}
