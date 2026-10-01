/* ================================================================
   PROFILE SOURCES — fetching + parsing for the coding-profile stats.

   Isomorphic on purpose: imported by the browser (js/live-profiles.mjs)
   AND bundled into the Netlify Function (netlify/functions/profiles.mjs),
   so there is exactly one parser per platform. No DOM APIs in here.

   Every value that leaves this module has been through sanitizeProfile():
   a number is a finite number or null, never a guess. Nothing in this
   file holds a rating, a count or any other stat — only handles and URLs.
   ================================================================ */

export const PROFILES = Object.freeze({
  codeforces: {
    label: 'Codeforces',
    handle: 'SumitXorY',
    url: 'https://codeforces.com/profile/SumitXorY',
  },
  leetcode: {
    label: 'LeetCode',
    handle: 'sumit_chauhan_',
    url: 'https://leetcode.com/u/sumit_chauhan_/',
  },
  codechef: {
    label: 'CodeChef',
    handle: 'sumitx',
    url: 'https://www.codechef.com/users/sumitx',
  },
  geeksforgeeks: {
    label: 'GeeksforGeeks',
    handle: 'sumit_chauhan143',
    url: 'https://www.geeksforgeeks.org/user/sumit_chauhan143/',
  },
});

export const PLATFORMS = Object.freeze(Object.keys(PROFILES));

/* ---------------------------------------------------------------
   HTTP helpers
   --------------------------------------------------------------- */
export class SourceError extends Error {
  constructor(message, { status = null, retryable = false, timedOut = false } = {}) {
    super(message);
    this.name = 'SourceError';
    this.status = status;
    this.retryable = retryable;
    this.timedOut = timedOut;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithTimeout(url, { timeout = 8000, ...init } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    const timedOut = err && err.name === 'AbortError';
    throw new SourceError(timedOut ? `timed out after ${timeout}ms` : `network error (${err && err.message})`, { retryable: true, timedOut });
  } finally {
    clearTimeout(timer);
  }
}

function httpError(res) {
  // 404 means "nothing here" (e.g. no function deployed on this host) — retrying won't help.
  return new SourceError(`HTTP ${res.status}`, { status: res.status, retryable: res.status === 429 || res.status >= 500 });
}

export async function fetchJson(url, options) {
  const res = await fetchWithTimeout(url, options);
  if (!res.ok) throw httpError(res);
  try {
    return await res.json();
  } catch {
    throw new SourceError('malformed JSON response');
  }
}

export async function fetchText(url, options) {
  const res = await fetchWithTimeout(url, options);
  if (!res.ok) throw httpError(res);
  return res.text();
}

export async function withRetry(task, { retries = 1, baseDelay = 700 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task(attempt);
    } catch (err) {
      if (attempt >= retries || !(err && err.retryable)) throw err;
      await sleep(baseDelay * 2 ** attempt);
    }
  }
}

// Public CORS relay used only as a last-resort browser fallback (GitHub Pages
// mirror / local preview, where the serverless function doesn't exist).
const viaCorsRelay = (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

/* ---------------------------------------------------------------
   Value coercion
   --------------------------------------------------------------- */
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/,/g, '').trim();
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** Non-negative integer or null ("1,234" -> 1234, "Inactive" -> null). */
export function toCount(value) {
  const n = toNumber(value);
  return n === null || n < 0 ? null : Math.round(n);
}

function toSignedInt(value) {
  const n = toNumber(value);
  return n === null ? null : Math.round(n);
}

function toDecimal(value) {
  const n = toNumber(value);
  return n === null || n < 0 ? null : Math.round(n * 100) / 100;
}

function toText(value, max = 80) {
  if (typeof value !== 'string') return null;
  const t = value.replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, max) : null;
}

/* ---------------------------------------------------------------
   Normalised shape — the contract between sources and the UI
   --------------------------------------------------------------- */
const SCHEMA = {
  codeforces: {
    handle: 'text', rating: 'count', maxRating: 'count', rank: 'text', maxRank: 'text',
    solved: 'count', contestCount: 'count', recentContests: 'contests',
  },
  leetcode: {
    handle: 'text', rating: 'count', badge: 'text', contestGlobalRank: 'count', topPercentage: 'decimal',
    contestsAttended: 'count', solved: 'count', easy: 'count', medium: 'count', hard: 'count',
  },
  codechef: {
    handle: 'text', rating: 'count', maxRating: 'count', stars: 'count', globalRank: 'count',
    countryRank: 'count', solved: 'count',
  },
  geeksforgeeks: {
    handle: 'text', score: 'count', solved: 'count', instituteRank: 'count', institute: 'text',
    longestStreak: 'count',
  },
};

// The fields without which a payload is useless — if none are present the
// source is treated as failed rather than rendered as a row of dashes.
const HEADLINE = {
  codeforces: ['rating', 'solved'],
  leetcode: ['rating', 'solved'],
  codechef: ['rating'],
  geeksforgeeks: ['score', 'solved'],
};

function coerceContests(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 5).map((c) => ({
    name: toText(c && c.name, 120),
    rank: toCount(c && c.rank),
    newRating: toCount(c && c.newRating),
    delta: toSignedInt(c && c.delta),
  })).filter((c) => c.name);
}

export function sanitizeProfile(platform, raw) {
  const schema = SCHEMA[platform];
  if (!schema) throw new SourceError(`unknown platform "${platform}"`);
  if (!raw || typeof raw !== 'object') throw new SourceError(`${platform}: empty payload`);

  const out = {};
  for (const [key, type] of Object.entries(schema)) {
    const v = raw[key];
    if (type === 'count') out[key] = toCount(v);
    else if (type === 'decimal') out[key] = toDecimal(v);
    else if (type === 'contests') out[key] = coerceContests(v);
    else out[key] = toText(v);
  }
  if (!HEADLINE[platform].some((k) => out[k] !== null)) {
    throw new SourceError(`${platform}: response had none of the expected stats`);
  }
  return out;
}

/* ---------------------------------------------------------------
   CODEFORCES — official API (CORS-enabled, so it also works directly
   from the browser). Rate limit is per IP, so calls run sequentially
   and "Call limit exceeded" is retried after the documented 2 s window.
   --------------------------------------------------------------- */
const CF_API = 'https://codeforces.com/api';

async function codeforcesCall(method, params, { timeout = 8000 } = {}) {
  const url = `${CF_API}/${method}?${new URLSearchParams(params)}`;
  return withRetry(async () => {
    const res = await fetchWithTimeout(url, { timeout });
    let body = null;
    try { body = await res.json(); } catch { /* handled below */ }
    if (body && body.status === 'OK') return body.result;
    const comment = (body && body.comment) || `HTTP ${res.status}`;
    throw new SourceError(`Codeforces ${method}: ${comment}`, {
      status: res.status,
      retryable: /limit/i.test(comment) || res.status >= 500,
    });
  }, { retries: 2, baseDelay: 2100 });
}

/** Unique accepted problems. Keyed by contest + index, so a problem
    re-submitted after AC is still counted once. */
export function countCodeforcesSolved(submissions) {
  const solved = new Set();
  for (const s of submissions) {
    if (!s || s.verdict !== 'OK' || !s.problem) continue;
    const p = s.problem;
    solved.add(p.contestId != null ? `${p.contestId}/${p.index}` : `${p.problemsetName || 'set'}/${p.index}/${p.name}`);
  }
  return solved.size;
}

export function normalizeCodeforces(info, ratingHistory, submissions) {
  const user = Array.isArray(info) ? info[0] : null;
  if (!user || typeof user.handle !== 'string') throw new SourceError('Codeforces: malformed user.info result');
  const history = Array.isArray(ratingHistory) ? ratingHistory : null;
  return {
    handle: user.handle,
    rating: user.rating,
    maxRating: user.maxRating,
    rank: user.rank,
    maxRank: user.maxRank,
    contestCount: history ? history.length : null,
    recentContests: history
      ? history.slice(-5).reverse().map((c) => ({
          name: c.contestName,
          rank: c.rank,
          newRating: c.newRating,
          delta: typeof c.newRating === 'number' && typeof c.oldRating === 'number' ? c.newRating - c.oldRating : null,
        }))
      : [],
    solved: Array.isArray(submissions) ? countCodeforcesSolved(submissions) : null,
  };
}

export async function fetchCodeforcesData({ handle = PROFILES.codeforces.handle, timeout = 8000 } = {}) {
  // user.info carries the headline numbers, so it goes first and is the only
  // call allowed to fail the whole source. History and submissions degrade
  // to "not available" on their own.
  const info = await codeforcesCall('user.info', { handles: handle }, { timeout });
  const history = await codeforcesCall('user.rating', { handle }, { timeout }).catch(() => null);
  const submissions = await codeforcesCall('user.status', { handle }, { timeout: timeout * 2 }).catch(() => null);
  return sanitizeProfile('codeforces', normalizeCodeforces(info, history, submissions));
}

/* ---------------------------------------------------------------
   LEETCODE — public GraphQL (server-side only: no CORS for browsers),
   with the open-source alfa-leetcode-api wrapper as a second source.
   --------------------------------------------------------------- */
const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
const LEETCODE_QUERY = `query portfolioProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
    badge { name }
  }
}`;

export function normalizeLeetCodeGraphQL(body, handle) {
  const user = body && body.data && body.data.matchedUser;
  if (!user) {
    const reason = body && Array.isArray(body.errors) && body.errors[0] && body.errors[0].message;
    throw new SourceError(`LeetCode: ${reason || 'user not found'}`);
  }
  const ac = (user.submitStatsGlobal && user.submitStatsGlobal.acSubmissionNum) || [];
  const solvedFor = (difficulty) => {
    const row = Array.isArray(ac) ? ac.find((r) => r && r.difficulty === difficulty) : null;
    return row ? row.count : null;
  };
  const contest = body.data.userContestRanking || {};
  return {
    handle: user.username || handle,
    solved: solvedFor('All'),
    easy: solvedFor('Easy'),
    medium: solvedFor('Medium'),
    hard: solvedFor('Hard'),
    rating: contest.rating,
    badge: contest.badge && contest.badge.name,
    contestGlobalRank: contest.globalRanking,
    topPercentage: contest.topPercentage,
    contestsAttended: contest.attendedContestsCount,
  };
}

export async function fetchLeetCodeGraphQL({ handle = PROFILES.leetcode.handle, timeout = 8000 } = {}) {
  const body = await withRetry(() => fetchJson(LEETCODE_GRAPHQL, {
    method: 'POST',
    timeout,
    headers: {
      'content-type': 'application/json',
      referer: `https://leetcode.com/u/${handle}/`,
      'user-agent': 'Mozilla/5.0 (compatible; portfolio-stats/1.0; +https://sumit.today)',
    },
    body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username: handle } }),
  }));
  return sanitizeProfile('leetcode', normalizeLeetCodeGraphQL(body, handle));
}

const ALFA_LEETCODE = 'https://alfa-leetcode-api.onrender.com';

export function normalizeLeetCodeAlfa(solved, contest, handle) {
  const s = solved || {};
  const c = contest || {};
  return {
    handle,
    solved: s.solvedProblem,
    easy: s.easySolved,
    medium: s.mediumSolved,
    hard: s.hardSolved,
    rating: c.contestRating,
    badge: c.contestBadges && c.contestBadges.name,
    contestGlobalRank: c.contestGlobalRanking,
    topPercentage: c.contestTopPercentage,
    contestsAttended: c.contestAttend,
  };
}

export async function fetchLeetCodeAlfa({ handle = PROFILES.leetcode.handle, timeout = 9000 } = {}) {
  const [solved, contest] = await Promise.allSettled([
    fetchJson(`${ALFA_LEETCODE}/${encodeURIComponent(handle)}/solved`, { timeout }),
    fetchJson(`${ALFA_LEETCODE}/${encodeURIComponent(handle)}/contest`, { timeout }),
  ]);
  if (solved.status === 'rejected' && contest.status === 'rejected') throw solved.reason;
  return sanitizeProfile('leetcode', normalizeLeetCodeAlfa(
    solved.status === 'fulfilled' ? solved.value : null,
    contest.status === 'fulfilled' ? contest.value : null,
    handle,
  ));
}

/* ---------------------------------------------------------------
   CODECHEF — no public API; the public profile page is parsed.
   --------------------------------------------------------------- */

/** CodeChef's published star bands. Used only when the page's own star
    markup can't be read — it is derived from the live rating, not stored. */
export function codechefStarsFromRating(rating) {
  if (typeof rating !== 'number') return null;
  const bands = [1400, 1600, 1800, 2000, 2200, 2500];
  return 1 + bands.filter((b) => rating >= b).length;
}

export function parseCodeChefProfile(html, handle = PROFILES.codechef.handle) {
  if (typeof html !== 'string' || html.length < 200) throw new SourceError('CodeChef: empty profile page');
  const pick = (re) => { const m = html.match(re); return m ? m[1] : null; };

  const rating = toCount(pick(/class="rating-number"[^>]*>\s*([\d,]+)/));
  if (rating === null || rating === 0) throw new SourceError('CodeChef: rating not found in profile page');

  const starMarkup = pick(/class="rating-star"[^>]*>([\s\S]*?)<\/div>/);
  let stars = starMarkup ? (starMarkup.match(/&#9733;|&#x2605;|★/gi) || []).length : 0;
  if (!stars) stars = toCount(pick(/class="rating"[^>]*>\s*(\d)\s*(?:&#9733;|★)/));
  if (!stars) stars = codechefStarsFromRating(rating);

  let globalRank = null;
  let countryRank = null;
  const ranks = pick(/class="rating-ranks"[^>]*>([\s\S]*?)<\/ul>/) || '';
  for (const [, item] of ranks.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
    const value = toCount((item.match(/<strong>\s*([^<]*?)\s*<\/strong>/) || [])[1]);
    if (/global/i.test(item)) globalRank = value;
    else if (/country/i.test(item)) countryRank = value;
  }

  return sanitizeProfile('codechef', {
    handle,
    rating,
    maxRating: pick(/Highest Rating\s*([\d,]+)/i),
    stars,
    globalRank,
    countryRank,
    solved: pick(/Total Problems Solved\s*:?\s*(?:<[^>]*>\s*)*([\d,]+)/i),
  });
}

export async function fetchCodeChefData({ handle = PROFILES.codechef.handle, timeout = 9000, viaRelay = false } = {}) {
  const page = `https://www.codechef.com/users/${encodeURIComponent(handle)}`;
  const html = await withRetry(() => fetchText(viaRelay ? viaCorsRelay(page) : page, {
    timeout,
    headers: viaRelay ? undefined : { 'user-agent': 'Mozilla/5.0 (compatible; portfolio-stats/1.0; +https://sumit.today)' },
  }));
  return parseCodeChefProfile(html, handle);
}

/* ---------------------------------------------------------------
   GEEKSFORGEEKS — the JSON endpoint behind the public profile page,
   with the rendered profile page as a second source.
   --------------------------------------------------------------- */
const gfgApiUrl = (handle) =>
  `https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle=${encodeURIComponent(handle)}&article_count=false&redirect=true`;

export function normalizeGfgInfo(info, handle) {
  if (!info || typeof info !== 'object') throw new SourceError('GeeksforGeeks: malformed profile payload');
  return sanitizeProfile('geeksforgeeks', {
    handle,
    score: info.score,
    solved: info.total_problems_solved,
    instituteRank: info.institute_rank,
    institute: info.institute_name,
    longestStreak: info.pod_solved_longest_streak,
  });
}

function findObjectWithKey(node, key, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 12) return null;
  if (Object.prototype.hasOwnProperty.call(node, key)) return node;
  for (const child of Object.values(node)) {
    const hit = findObjectWithKey(child, key, depth + 1);
    if (hit) return hit;
  }
  return null;
}

export function parseGfgProfilePage(html, handle = PROFILES.geeksforgeeks.handle) {
  if (typeof html !== 'string' || html.length < 200) throw new SourceError('GeeksforGeeks: empty profile page');

  const nextData = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextData) {
    try {
      const info = findObjectWithKey(JSON.parse(nextData[1]), 'total_problems_solved');
      if (info) return normalizeGfgInfo(info, handle);
    } catch { /* fall through to the visible text */ }
  }

  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const after = (label) => { const m = text.match(new RegExp(`${label}\\s*:?\\s*([\\d,]+)`, 'i')); return m ? m[1] : null; };
  return sanitizeProfile('geeksforgeeks', {
    handle,
    score: after('Coding Score'),
    solved: after('Problems? Solved'),
    instituteRank: after('Institute Rank'),
  });
}

export async function fetchGeeksForGeeksData({ handle = PROFILES.geeksforgeeks.handle, timeout = 9000, viaRelay = false } = {}) {
  const wrap = (url) => (viaRelay ? viaCorsRelay(url) : url);
  try {
    const body = await withRetry(() => fetchJson(wrap(gfgApiUrl(handle)), { timeout }));
    return normalizeGfgInfo(body && body.data, handle);
  } catch (apiError) {
    const html = await fetchText(wrap(`https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`), { timeout })
      .catch(() => { throw apiError; });
    return parseGfgProfilePage(html, handle);
  }
}

/* ---------------------------------------------------------------
   Source chains
   --------------------------------------------------------------- */

/** Used by the serverless function: talks to each platform directly. */
export const SERVER_SOURCES = {
  codeforces: () => fetchCodeforcesData(),
  leetcode: () => fetchLeetCodeGraphQL().catch(() => fetchLeetCodeAlfa()),
  codechef: () => fetchCodeChefData(),
  geeksforgeeks: () => fetchGeeksForGeeksData(),
};

/** Used by the browser only when the serverless function is unreachable
    (GitHub Pages mirror, plain static preview). */
export const BROWSER_FALLBACKS = {
  codeforces: () => fetchCodeforcesData(),
  leetcode: () => fetchLeetCodeAlfa(),
  codechef: () => fetchCodeChefData({ viaRelay: true }),
  geeksforgeeks: () => fetchGeeksForGeeksData({ viaRelay: true }),
};
