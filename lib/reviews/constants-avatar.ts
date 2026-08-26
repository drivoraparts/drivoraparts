/**
 * The fallback avatar, in its own module so client components can use it
 * without importing the review store — importing that into the browser ships
 * a second, empty copy of server-side state.
 */
export const DEFAULT_AVATAR = "/reviews/avatars/01.jpg";
