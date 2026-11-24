/**
 * HMTC CMS — where the editor may send people after login, logout or a token
 * refresh.
 *
 * Isomorphic: no React, no secrets, safe to import from client components.
 */

export const CMS_HOME = '/dashboard/cms';
export const CMS_LOGIN = '/dashboard/cms/login';

/**
 * Open-redirect guard for a `next` value: only same-site paths under
 * `/dashboard/cms`. Anything else falls back to the CMS home.
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || raw.startsWith('//') || raw.includes('\\')) return CMS_HOME;
  const underCms =
    raw === CMS_HOME ||
    raw.startsWith(`${CMS_HOME}/`) ||
    raw.startsWith(`${CMS_HOME}?`);
  return underCms ? raw : CMS_HOME;
}

/** Login page URL that returns to `next` afterwards. */
export function loginUrl(next?: string): string {
  const target = safeNext(next);
  return target === CMS_HOME
    ? CMS_LOGIN
    : `${CMS_LOGIN}?next=${encodeURIComponent(target)}`;
}
