export const DOVE_APP_NAME = 'dove';

export const DOVE_APP_CAPTION = 'experimental textboard';

/** Available view locales */
export const DOVE_LANGS = ['en', 'kg', 'ru'] as const;

/** Minimum content length */
export const DOVE_CONTENT_MIN = 3;

/** Maximum content length */
export const DOVE_CONTENT_MAX = 20_000;

/** Minimum password length */
export const DOVE_PASSWORD_MIN = 0;

/** Maximum password length */
export const DOVE_PASSWORD_MAX = 100;

/**
 * Maximum number of threads available in preview mode (whole thread
 * along with last replies) on threads page
 *
 * @see DOVE_PREVIEW_REPLIES_LIMIT
 */
export const DOVE_PREVIEW_LIMIT = 20;

/**
 * Maximum number of replies per thread available in preview mode
 *
 * @see DOVE_PREVIEW_LIMIT
 */
export const DOVE_PREVIEW_REPLIES_LIMIT = 3;

/**
 * Maximum length of content in previews (both threads and replies in
 * latest threads section)
 */
export const DOVE_PREVIEW_CONTENT_LIMIT = 300;

/**
 * Maximum length of content in threads lines (full index section)
 */
export const DOVE_LINE_CONTENT_LIMIT = 80;

/**
 * Maximum length of content in title (browser tab text)
 */
export const DOVE_TITLE_CONTENT_LIMIT = 80;

/**
 * When this number is reached, new replies should not raise the thread
 * to the top of threads page
 */
export const DOVE_THREAD_SOFT_LIMIT = 1_000;

/**
 * When this number is reached, new replies should not be allowed to
 * the thread
 */
export const DOVE_THREAD_HARD_LIMIT = 1_200;
