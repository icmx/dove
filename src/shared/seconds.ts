export namespace Seconds {
  export const SECOND = 1000;

  export const YEAR = 60 * 60 * 24 * 365;

  export const now = (): number => {
    return Math.round(Date.now() / SECOND);
  };

  export const isExpired = (seconds: number): boolean => {
    return now() - seconds > 0;
  };

  export const toDate = (seconds: number): Date => {
    return new Date(seconds * SECOND);
  };
}
