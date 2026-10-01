/* ================================================================
   LIVE PROFILES - the single source of truth for every coding stat on
   the page: hero, platform cards, dashboard and achievements.

     sources (profile-sources.mjs) → profileStats (state) → render

   index.html holds no stat values. An element declares what it shows
   with data-stat="<platform>.<field>" (or "aggregate.<field>") and an
   optional data-format; renderBindings() fills every one of them from
   profileStats, so a value can never disagree between two places.

   Failure is explicit: a platform that can't be reached shows "Live data
   unavailable" - never a remembered or hard-coded number.
   ================================================================ */
import {
  PROFILES,
  PLATFORMS,
  BROWSER_FALLBACKS,
  SourceError,
  fetchJson,
  sanitizeProfile,
} from './profile-sources.mjs';

const CACHE_KEY = 'portfolio_profiles_v6';
const LEGACY_CACHE_KEYS = ['portfolio_telemetry_cache_v5', 'portfolio_telemetry_cache_v4'];
const FRESH_MS = 5 * 60 * 1000;       // cached data younger than this skips the network
const MAX_CACHE_AGE_MS = 30 * 60 * 1000; // cached data older than this is never shown
const LIVE_LABEL_MS = 10 * 60 * 1000; // after this a card says "Synced N min ago", not "Live"
const API_TIMEOUT = 7000;
const PRODUCTION_ORIGIN = 'https://sumit.today';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nf = new Intl.NumberFormat('en-US');

/* ---------------------------------------------------------------
   STATE
   status: 'loading' (nothing yet) | 'live' | 'stale' (shown with its
   real sync time after a failed refresh) | 'error' (nothing to show)
   --------------------------------------------------------------- */
export const profileStats = Object.fromEntries(
  PLATFORMS.map((p) => [p, { status: 'loading', data: null, fetchedAt: null, source: null }]),
);

const inflight = new Map();

function updateProfileStats(platform, patch) {
  profileStats[platform] = { ...profileStats[platform], ...patch };
  scheduleRender();
}

/* ---------------------------------------------------------------
   CACHE (short-lived; only ever holds data that was fetched live,
   together with the time it was fetched)
   --------------------------------------------------------------- */
function readCache() {
  try {
    LEGACY_CACHE_KEYS.forEach((k) => localStorage.removeItem(k));
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return parsed && parsed.profiles && typeof parsed.profiles === 'object' ? parsed.profiles : {};
  } catch {
    return {};
  }
}

function writeCache() {
  try {
    const profiles = {};
    for (const p of PLATFORMS) {
      const e = profileStats[p];
      if (e.data && e.fetchedAt) profiles[p] = { data: e.data, fetchedAt: e.fetchedAt, source: e.source };
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify({ profiles }));
  } catch { /* storage full / disabled - caching is optional */ }
}

function hydrateFromCache() {
  const cached = readCache();
  for (const p of PLATFORMS) {
    const c = cached[p];
    const age = c && typeof c.fetchedAt === 'number' ? Date.now() - c.fetchedAt : Infinity;
    if (!(age >= 0 && age < MAX_CACHE_AGE_MS)) continue;
    try {
      profileStats[p] = {
        status: age < FRESH_MS ? 'live' : 'stale',
        data: sanitizeProfile(p, c.data),
        fetchedAt: c.fetchedAt,
        source: c.source || 'cache',
      };
    } catch { /* malformed cache entry - ignore it */ }
  }
}

/* ---------------------------------------------------------------
   FETCHING - per platform, independent, de-duplicated
   1. the serverless proxy (/api/profiles/:platform)
   2. the production proxy, when this page is served from elsewhere
   3. the platform's public endpoint directly from the browser
   --------------------------------------------------------------- */
function apiEndpoints(platform) {
  const path = `/api/profiles/${platform}`;
  const urls = [];
  const servedOverHttp = location.protocol === 'http:' || location.protocol === 'https:';
  // GitHub Pages can't run functions; asking would only produce a 404.
  if (servedOverHttp && !location.hostname.endsWith('github.io')) urls.push(path);
  if (location.origin !== PRODUCTION_ORIGIN) urls.push(PRODUCTION_ORIGIN + path);
  return urls;
}

async function fetchFromApi(url, platform) {
  for (let attempt = 0; ; attempt++) {
    try {
      const body = await fetchJson(url, { timeout: API_TIMEOUT });
      if (!body || body.ok !== true || body.platform !== platform) throw new SourceError('unexpected API payload');
      const reported = Date.parse(body.fetchedAt);
      return {
        data: sanitizeProfile(platform, body.data),
        fetchedAt: Number.isFinite(reported) ? Math.min(reported, Date.now()) : Date.now(),
        source: 'api',
      };
    } catch (err) {
      // Retry once on a dropped connection. A timeout already cost the full
      // budget, and an HTTP answer (404, 502) is final - both move on to the
      // next source instead.
      if (attempt === 0 && err instanceof SourceError && err.status === null && err.retryable && !err.timedOut) continue;
      throw err;
    }
  }
}

async function fetchProfileData(platform) {
  for (const url of apiEndpoints(platform)) {
    try {
      return await fetchFromApi(url, platform);
    } catch { /* next source */ }
  }
  const data = await BROWSER_FALLBACKS[platform]();
  return { data, fetchedAt: Date.now(), source: 'direct' };
}

// Named per platform for readability at call sites / in the console.
export const fetchCodeforcesData = () => fetchProfileData('codeforces');
export const fetchLeetCodeData = () => fetchProfileData('leetcode');
export const fetchCodeChefData = () => fetchProfileData('codechef');
export const fetchGeeksForGeeksData = () => fetchProfileData('geeksforgeeks');
const FETCHERS = {
  codeforces: fetchCodeforcesData,
  leetcode: fetchLeetCodeData,
  codechef: fetchCodeChefData,
  geeksforgeeks: fetchGeeksForGeeksData,
};

function loadPlatform(platform, { force = false } = {}) {
  if (inflight.has(platform)) return inflight.get(platform);

  const current = profileStats[platform];
  if (!force && current.status === 'live' && Date.now() - current.fetchedAt < FRESH_MS) return Promise.resolve();
  if (!current.data) updateProfileStats(platform, { status: 'loading' });

  const job = FETCHERS[platform]()
    .then(({ data, fetchedAt, source }) => {
      updateProfileStats(platform, { status: 'live', data, fetchedAt, source });
      writeCache();
    })
    .catch((err) => {
      console.warn(`[profiles] ${PROFILES[platform].label}: live data unavailable (${err && err.message})`);
      updateProfileStats(platform, { status: profileStats[platform].data ? 'stale' : 'error' });
    })
    .finally(() => {
      inflight.delete(platform);
      scheduleRender();
    });

  inflight.set(platform, job);
  scheduleRender();
  return job;
}

export function syncProfiles(options) {
  return Promise.allSettled(PLATFORMS.map((p) => loadPlatform(p, options)));
}

/* ---------------------------------------------------------------
   DERIVED VALUES
   --------------------------------------------------------------- */

/** Sum of per-platform solved counts. Platforms are NOT de-duplicated
    against each other (the same problem can't be matched across sites),
    and the UI says so next to the number. */
export function calculateTotalSolved() {
  const parts = [];
  let pending = false;
  for (const p of PLATFORMS) {
    const e = profileStats[p];
    if (!e.data && e.status === 'loading') pending = true;
    else if (e.data && typeof e.data.solved === 'number') parts.push({ platform: p, solved: e.data.solved });
  }
  const counted = parts.length;
  return {
    pending,
    parts,
    total: pending || !counted ? null : parts.reduce((sum, x) => sum + x.solved, 0),
    coverageLabel: counted === PLATFORMS.length ? `${PLATFORMS.length}\u00a0platforms` : `${counted} of ${PLATFORMS.length}\u00a0platforms`,
  };
}

const DERIVED = {
  'leetcode.title': (d) => d.badge || (d.rating !== null ? 'Contest rating' : null),
};

function resolveStat(path) {
  const [scope, field] = path.split('.');
  if (scope === 'aggregate') {
    const agg = calculateTotalSolved();
    if (agg.pending) return { state: 'loading' };
    if (agg.total === null) return { state: 'unavailable' };
    return { state: 'ready', value: field === 'totalSolved' ? agg.total : agg[field] };
  }
  const entry = profileStats[scope];
  if (!entry) return { state: 'unavailable' };
  if (!entry.data) return { state: entry.status === 'loading' ? 'loading' : 'unavailable' };
  const value = DERIVED[path] ? DERIVED[path](entry.data) : entry.data[field];
  return value === null || value === undefined ? { state: 'missing' } : { state: 'ready', value };
}

const FORMATS = {
  plain: (v) => String(v),
  int: (v) => nf.format(v),
  rank: (v) => `#${nf.format(v)}`,
  title: (v) => String(v).replace(/\b[a-z]/g, (c) => c.toUpperCase()),
  stars: (v) => `${v}★`,
  top: (v) => `Top ${v}%`,
  days: (v) => `${nf.format(v)} day${v === 1 ? '' : 's'}`,
};

export function relativeTime(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

/* ---------------------------------------------------------------
   RENDERING
   --------------------------------------------------------------- */
const countUpState = new WeakMap();
const countUpObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const st = countUpState.get(entry.target);
        if (!st) continue;
        st.visible = entry.isIntersecting;
        if (st.visible && st.pending) runCountUp(entry.target, st);
      }
    }, { threshold: 0.4 })
  : null;

function runCountUp(el, st) {
  st.pending = false;
  if (reducedMotion) { el.textContent = st.text; return; }
  const start = performance.now();
  const target = st.value;
  const step = (now) => {
    if (st.value !== target) return; // a newer value took over
    const t = Math.min((now - start) / 1600, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = t < 1 ? nf.format(Math.floor(eased * target)) : st.text;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setCountUp(el, value, text) {
  let st = countUpState.get(el);
  if (!st) {
    st = { visible: false, pending: false, value: null, text: '' };
    countUpState.set(el, st);
    if (countUpObserver) countUpObserver.observe(el);
  }
  if (st.value === value) return;
  const first = st.value === null;
  st.value = value;
  st.text = text;
  el.textContent = text;
  // Animate the first arrival only, and only where someone can see it.
  if (first && countUpObserver) {
    st.pending = true;
    if (st.visible) runCountUp(el, st);
  }
}

function renderBindings() {
  for (const el of document.querySelectorAll('[data-stat]')) {
    const { state, value } = resolveStat(el.dataset.stat);
    el.classList.toggle('stat-loading', state === 'loading');
    el.classList.toggle('stat-na', state === 'unavailable' || state === 'missing');
    if (state === 'ready') {
      const text = (FORMATS[el.dataset.format] || FORMATS.plain)(value);
      if (el.hasAttribute('data-count-up')) setCountUp(el, value, text);
      else if (el.textContent !== text) el.textContent = text;
      el.removeAttribute('title');
    } else if (state === 'loading') {
      el.textContent = '';
    } else {
      el.textContent = '–';
      el.title = state === 'unavailable' ? 'Live data unavailable' : 'Not reported by the platform right now';
    }
  }
}

function cardStatusLabel(entry) {
  if (entry.status === 'loading') return 'Syncing…';
  if (entry.status === 'error') return 'Live data unavailable';
  const age = Date.now() - entry.fetchedAt;
  if (entry.status === 'live' && age < LIVE_LABEL_MS) return 'Live';
  return `Synced ${relativeTime(entry.fetchedAt)}`;
}

export function updatePlatformCards() {
  for (const el of document.querySelectorAll('[data-platform]')) {
    const entry = profileStats[el.dataset.platform];
    if (entry) el.dataset.state = entry.status;
  }
  for (const el of document.querySelectorAll('[data-status-for]')) {
    const entry = profileStats[el.dataset.statusFor];
    if (!entry) continue;
    el.dataset.state = entry.status;
    const label = el.querySelector('.status-text') || el;
    const text = cardStatusLabel(entry);
    if (label.textContent !== text) label.textContent = text;
    if (entry.fetchedAt) el.title = `Last synced ${new Date(entry.fetchedAt).toLocaleString()}`;
  }
  for (const el of document.querySelectorAll('[data-notice-for]')) {
    el.hidden = profileStats[el.dataset.noticeFor].status !== 'error';
  }
}

export function updateHeroStats() {
  const busy = PLATFORMS.some((p) => profileStats[p].status === 'loading');
  for (const el of document.querySelectorAll('[data-stats-group]')) {
    el.setAttribute('aria-busy', String(busy));
  }
  const agg = calculateTotalSolved();
  for (const el of document.querySelectorAll('[data-aggregate-breakdown]')) {
    if (agg.pending) { el.textContent = 'Counting live totals…'; continue; }
    const counted = new Set(agg.parts.map((x) => x.platform));
    // Non-breaking space keeps each label on the same line as its number.
    const pieces = agg.parts.map((x) => `${PROFILES[x.platform].label}\u00a0${nf.format(x.solved)}`);
    PLATFORMS.filter((p) => !counted.has(p)).forEach((p) => pieces.push(`${PROFILES[p].label}\u00a0unavailable`));
    el.textContent = pieces.join(' · ');
  }
}

function messageRow(text, cols) {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = cols;
  td.className = 'table-message';
  td.textContent = text;
  tr.append(td);
  return tr;
}

function cell(text, className) {
  const td = document.createElement('td');
  if (className) td.className = className;
  td.textContent = text;
  return td;
}

let renderedContests = null;
function renderCodeforcesContests() {
  const tbody = document.querySelector('[data-cf-contests]');
  if (!tbody) return;
  const e = profileStats.codeforces;
  const key = e.data ? e.data.recentContests : e.status;
  if (key === renderedContests) return;
  renderedContests = key;

  tbody.replaceChildren();
  if (!e.data) {
    tbody.append(messageRow(e.status === 'loading' ? 'Loading recent contests…' : 'Live data unavailable', 4));
    return;
  }
  if (!e.data.recentContests.length) {
    tbody.append(messageRow(e.data.contestCount === 0 ? 'No rated contests yet' : 'Contest history unavailable right now', 4));
    return;
  }
  for (const c of e.data.recentContests) {
    const tr = document.createElement('tr');
    const delta = typeof c.delta === 'number' ? `${c.delta >= 0 ? '+' : '−'}${Math.abs(c.delta)}` : '–';
    tr.append(
      cell(c.name, 'bold'),
      cell(c.rank !== null ? `#${nf.format(c.rank)}` : '–', 'mono'),
      cell(delta, `mono ${typeof c.delta === 'number' ? (c.delta >= 0 ? 'green' : 'red') : ''}`),
      cell(c.newRating !== null ? String(c.newRating) : '–', 'mono bold'),
    );
    tbody.append(tr);
  }
}

function renderLeetCodeBars() {
  const d = profileStats.leetcode.data;
  const total = d ? (d.easy || 0) + (d.medium || 0) + (d.hard || 0) : 0;
  for (const bar of document.querySelectorAll('[data-lc-bar]')) {
    const share = total ? ((d[bar.dataset.lcBar] || 0) / total) * 100 : 0;
    bar.style.width = `${share.toFixed(1)}%`;
  }
}

function syncSummary() {
  const entries = PLATFORMS.map((p) => profileStats[p]);
  const withData = entries.filter((e) => e.data && e.fetchedAt);
  const live = entries.filter((e) => e.status === 'live');
  if (!withData.length) {
    return inflight.size || entries.some((e) => e.status === 'loading')
      ? { state: 'loading', text: 'Syncing live data…' }
      : { state: 'error', text: 'Live data unavailable' };
  }
  const oldest = Math.min(...withData.map((e) => e.fetchedAt));
  if (live.length === PLATFORMS.length) return { state: 'live', text: `Live · synced ${relativeTime(oldest)}`, oldest };
  if (!live.length) return { state: 'stale', text: `Last synced ${relativeTime(oldest)}`, oldest };
  return { state: 'partial', text: `${live.length} of ${PLATFORMS.length} live · synced ${relativeTime(oldest)}`, oldest };
}

export function updateSyncStatus() {
  const summary = syncSummary();
  for (const el of document.querySelectorAll('[data-sync-status]')) {
    el.dataset.state = summary.state;
    const label = el.querySelector('.sync-text') || el;
    if (label.textContent !== summary.text) label.textContent = summary.text;
    const time = el.querySelector('time');
    if (time && summary.oldest) time.dateTime = new Date(summary.oldest).toISOString();
  }
  const btn = document.getElementById('telemetry-sync-btn');
  if (btn) {
    const syncing = inflight.size > 0;
    btn.disabled = syncing;
    btn.classList.toggle('syncing-active', syncing);
    btn.setAttribute('aria-busy', String(syncing));
  }
}

function renderAll() {
  renderBindings();
  updatePlatformCards();
  updateHeroStats();
  renderCodeforcesContests();
  renderLeetCodeBars();
  updateSyncStatus();
}

let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderAll();
  });
}

/* ---------------------------------------------------------------
   BOOT
   --------------------------------------------------------------- */
function announce(text) {
  const el = document.getElementById('sync-announcer');
  if (el) el.textContent = text;
}

function initSyncButton() {
  const btn = document.getElementById('telemetry-sync-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (inflight.size || btn.disabled) return; // a sync is already running
    btn.disabled = true; // immediately, not on the next frame: no double submits
    btn.classList.add('syncing-active');
    announce('Refreshing live coding stats…');
    await syncProfiles({ force: true });
    const s = syncSummary();
    announce(s.state === 'error' ? 'Live data unavailable.' : `Coding stats refreshed. ${s.text}.`);
  });
}

function boot() {
  hydrateFromCache();
  renderAll();
  initSyncButton();
  syncProfiles();

  // Keeps "synced N min ago" honest. Re-renders text only; no network.
  setInterval(() => { if (!document.hidden) scheduleRender(); }, 30 * 1000);

  // A tab left open for a while refreshes once when it's looked at again.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const stale = PLATFORMS.some((p) => profileStats[p].fetchedAt && Date.now() - profileStats[p].fetchedAt > LIVE_LABEL_MS);
    if (stale) syncProfiles();
    else scheduleRender();
  });
}

boot();
