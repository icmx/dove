export namespace Seconds {
  /**
   *   - `h` — Hour
   *   - `d` — Day (24 hours)
   *   - `w` — Week (7 days)
   *   - `m` — Month (4 weeks)
   *   - `y` — Year (12 months)
   */
  export type Unit = 'h' | 'd' | 'w' | 'm' | 'y';

  export type Term = { count: number; unit: Unit };

  export const SECOND = 1000;

  export const BY_UNIT: Record<Unit, number> = {
    h: 3_600,
    d: 86_400,
    w: 604_800,
    m: 2_419_200,
    y: 29_030_400,
  };

  export const now = (): number => {
    return Math.round(Date.now() / SECOND);
  };

  export const future = (term: Term): number => {
    const perUnit = BY_UNIT[term.unit];
    const perTerm = term.count * perUnit;

    return now() + perTerm;
  };

  export const isExpired = (seconds: number): boolean => {
    return now() - seconds > 0;
  };

  export const toStamp = (seconds: number): string => {
    return new Date(seconds * SECOND)
      .toJSON()
      .replace('T', ' ')
      .slice(0, 16);
  };
}
