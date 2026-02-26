
type ApiRequestInit = RequestInit & {
  /**
   * If true, automatically attaches `Authorization: Bearer <token>` using:
   * - `init.headers.authorization` if provided, otherwise
   * - `localStorage.getItem('token')` (client-side only)
   */
  auth?: boolean;
};


function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * Wrapper around `fetch` that prefixes a single base URL.
 *
 * Set `NEXT_PUBLIC_API_BASE_URL` to point to your Express backend, e.g.:
 * - http://localhost:4000
 *
 * If empty/undefined, it falls back to same-origin (Next.js), i.e. "/api/...".
 */

export function api(endpoint: string, init: ApiRequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = joinUrl(baseUrl, endpoint);

  const { auth, headers, ...rest } = init;
  const mergedHeaders = new Headers(headers || {});

  if (auth && !mergedHeaders.get('authorization')) {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token');
      if (token) mergedHeaders.set('authorization', `Bearer ${token}`);
    }
  }

  return fetch(url, {
    ...rest,
    headers: mergedHeaders
  });
}

