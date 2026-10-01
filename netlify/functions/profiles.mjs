/* ================================================================
   GET /api/profiles/:platform
   Server-side proxy for the live coding-profile stats.

   Why this exists: LeetCode's GraphQL, CodeChef and GeeksforGeeks don't
   allow cross-origin requests from a browser, so the page can't read them
   directly. This function fetches the PUBLIC profile data, normalises it
   with the same parsers the browser uses (js/profile-sources.mjs) and
   returns a small JSON document. No API keys or secrets are involved.

   Responses are cached on Netlify's CDN for a few minutes, so the
   upstream platforms see one request per cache window rather than one
   per visitor. `fetchedAt` is the time the upstream was actually read,
   which is what the page's "synced N min ago" label shows.
   ================================================================ */
import { PLATFORMS, SERVER_SOURCES } from '../../js/profile-sources.mjs';

const WARM_TTL_MS = 60 * 1000;
const warmCache = new Map();   // platform -> { at, body }   (per warm instance)
const inflight = new Map();    // platform -> Promise        (collapses concurrent calls)

const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'x-content-type-options': 'nosniff',
};

const CACHE_HEADERS = {
  'cache-control': 'public, max-age=60',
  'netlify-cdn-cache-control': 'public, s-maxage=180, stale-while-revalidate=600, durable',
};

const NO_STORE = { 'cache-control': 'no-store' };

function json(body, status, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });
}

async function loadFresh(platform) {
  const hit = warmCache.get(platform);
  if (hit && Date.now() - hit.at < WARM_TTL_MS) return hit.body;
  if (inflight.has(platform)) return inflight.get(platform);

  const job = SERVER_SOURCES[platform]()
    .then((data) => {
      const body = { ok: true, platform, fetchedAt: new Date().toISOString(), data };
      warmCache.set(platform, { at: Date.now(), body });
      return body;
    })
    .finally(() => inflight.delete(platform));
  inflight.set(platform, job);
  return job;
}

export default async (request, context) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...BASE_HEADERS, 'access-control-allow-methods': 'GET' } });
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ ok: false, error: 'method_not_allowed' }, 405, NO_STORE);

  const platform = String((context && context.params && context.params.platform) || '').toLowerCase();
  if (!PLATFORMS.includes(platform)) return json({ ok: false, error: 'unknown_platform' }, 404, NO_STORE);

  try {
    return json(await loadFresh(platform), 200, CACHE_HEADERS);
  } catch (err) {
    console.error(`[profiles] ${platform}: ${err && err.message}`);
    return json({ ok: false, platform, error: 'upstream_unavailable' }, 502, NO_STORE);
  }
};

export const config = { path: '/api/profiles/:platform' };
