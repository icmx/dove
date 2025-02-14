import { argon2id, argon2Verify } from 'hash-wasm';

export namespace Hashing {
  export const hash = (text: string, salt: string): Promise<string> => {
    const argon2Password = text.normalize();
    const argon2Salt = new Uint8Array();
    const argon2Secret = salt.normalize();

    // This makes hash unique which is more secure but will break
    // ip addresses hashing
    // crypto.getRandomValues(argon2Salt)

    return argon2id({
      password: argon2Password,
      salt: argon2Salt,
      secret: argon2Secret,
      hashLength: 16,
      iterations: 1,
      memorySize: 256,
      parallelism: 1,
      outputType: 'encoded',
    });
  };

  export const verify = async (
    hash: string,
    text: string,
    salt: string
  ): Promise<boolean> => {
    const argon2Hash = hash;
    const argon2Password = text.normalize();
    const argon2Secret = salt;

    return argon2Verify({
      hash: argon2Hash,
      password: argon2Password,
      secret: argon2Secret,
    });
  };
}
