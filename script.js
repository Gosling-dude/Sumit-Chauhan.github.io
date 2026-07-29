/* ================================================================
   SUMIT CHAUHAN — A COSMIC BIOGRAPHY · SCRIPT.JS
   Scroll-driven cinematic scene engine + journey UI + live telemetry
   ================================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  if (window.feather) feather.replace({ 'stroke-width': 1.75 });
});

/* ---------------------------------------------------------------
   SCROLL PROGRESS
   --------------------------------------------------------------- */
const scrollProgressBar = document.getElementById('scroll-progress');

function scrollFraction() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
}
function updateScrollProgress() {
  const p = scrollFraction() * 100;
  if (scrollProgressBar) scrollProgressBar.style.width = p + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ---------------------------------------------------------------
   NAVIGATION — SCROLL STATE + ACTIVE LINK
   --------------------------------------------------------------- */
const mainNav   = document.getElementById('main-nav');
const navLinks  = document.querySelectorAll('.nav-link[data-target]');
const sceneSections = Array.from(document.querySelectorAll('.scene-section'));

let activeSectionId = '';

window.addEventListener('scroll', () => {
  if (mainNav) mainNav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

function updateActiveSection() {
  const centerY = window.innerHeight * 0.42;
  let currentId = sceneSections.length ? sceneSections[0].id : '';

  for (const sec of sceneSections) {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= centerY) currentId = sec.id;
  }

  if (currentId === activeSectionId) return;
  activeSectionId = currentId;

  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('data-target') === currentId));
}
window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('load', updateActiveSection);
updateActiveSection();

// Smooth scroll for nav + any in-page anchor
function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
navLinks.forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); smoothScrollTo(link.getAttribute('data-target')); });
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu    = document.getElementById('mobile-menu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenuBtn.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------------
   COSMIC BACKDROP
   Replaces the old procedural canvas engine. The video is decorative:
   every exit path here falls back to the poster + CSS gradient, which
   are already dark enough to carry the text contrast on their own.
   --------------------------------------------------------------- */
(function initCosmicBackdrop() {
  const video = document.getElementById('cosmos-video');
  if (!video) return;

  /* Source is a 30s misty-ridge drone shot, 848x478. Verified clean across
     its whole length — no titles, no credits — so unlike the previous NASA
     documentary there is no loop window to police: the element just loops
     natively. Measured seam (0.05s vs 29.8s) is 20.7/255 on a slow drift,
     which native looping absorbs; if a swapped video ever seams visibly,
     re-measure before reaching for a crossfade. */

  // Don't spend a multi-MB download on a decorative layer nobody asked for.
  const tooSmall = window.matchMedia('(max-width: 760px)').matches;
  if (tooSmall || prefersReducedMotion) return;   // gradient backdrop only

  video.src = video.dataset.src;

  video.addEventListener('loadedmetadata', () => {
    // Slightly under real time so the drift reads as ambient rather than as
    // footage competing with the content.
    video.playbackRate = 0.75;
  }, { once: true });

  // Autoplay can still be refused (data saver, battery, policy). That's fine —
  // just don't leave a half-loaded element sitting on the page.
  video.play().catch(() => { video.removeAttribute('src'); video.load(); });

  // Pause while the tab is hidden; a background video decoding off-screen is
  // pure battery cost.
  document.addEventListener('visibilitychange', () => {
    if (!video.src) return;
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });
})();

/* ---------------------------------------------------------------
   HERO TYPING EFFECT
   --------------------------------------------------------------- */
(function initTypingEffect() {
  const el = document.getElementById('role-text');
  if (!el) return;
  const roles = ['Software Engineer', 'Backend Architect', 'Competitive Programmer', 'Open Source Contributor', 'Problem Solver'];
  let roleIdx = 0, charIdx = 0, deleting = false;
  function type() {
    const current = roles[roleIdx];
    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1); charIdx++;
      if (charIdx === current.length) { deleting = true; setTimeout(type, 2200); return; }
    } else {
      el.textContent = current.slice(0, charIdx - 1); charIdx--;
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 46 : 88);
  }
  setTimeout(type, 1200);
})();

/* ---------------------------------------------------------------
   HERO GSAP ANIMATIONS
   --------------------------------------------------------------- */
(function initHeroAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll('[data-anim]').forEach(el => { el.style.opacity = 1; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    gsap.set('[data-anim]', { opacity: 1 });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.fromTo('.hero-badge', { opacity: 0, y: 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 })
    .fromTo('.hero-title-line', { opacity: 0, y: 60, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.12 }, '-=0.5')
    .fromTo('.hero-desc', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '-=0.6')
    .fromTo(['.hero-actions', '.hero-social'], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')
    .fromTo('.hero-visual', { opacity: 0, scale: 0.88, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'power3.out' }, '-=1.4')
    .fromTo('.float-card', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.15, ease: 'back.out(1.6)' }, '-=0.6')
    .fromTo('.hero-scroll-cue', { opacity: 0 }, { opacity: 0.5, duration: 1 }, '-=0.3');

  ScrollTrigger.create({
    trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.5,
    onUpdate: self => {
      const prog = self.progress;
      gsap.set('.hero-visual', { y: prog * 80 });
      gsap.set('.hero-content', { y: prog * 40 });
    }
  });
})();

/* ---------------------------------------------------------------
   SECTION REVEAL ANIMATIONS
   --------------------------------------------------------------- */
(function initRevealAnimations() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-elem').forEach(el => { el.classList.add('revealed'); });
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal-elem').forEach(el => observer.observe(el));
})();

/* ---------------------------------------------------------------
   STAT COUNTER
   --------------------------------------------------------------- */
(function initStatCounters() {
  const counters = document.querySelectorAll('.stat-counter[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const dur = prefersReducedMotion ? 0 : 1800;
      const start = performance.now();
      function tick(now) {
        const pct = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - pct, 3);
        el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
        if (pct < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + target.toLocaleString() + suffix;
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
})();

/* ================================================================
   LIVE TELEMETRY DASHBOARD
   ================================================================ */

/* Bumped v4 -> v5 on the GFG handle fix. The cached payload embeds the
   handle, so anyone with a warm cache would keep seeing the old wrong one
   until it expired. Bump this whenever a HANDLES value or the shape of the
   cached data changes. */
const CACHE_KEY = 'portfolio_telemetry_cache_v5';
const CACHE_TTL = 5 * 60 * 1000;

const FALLBACK_DATA = {
  cf: {
    rating: 1864, rank: 'expert', maxRating: 2000, maxRank: 'candidate master',
    solved: 326, handle: 'SumitXorY',
    contests: [
      { contestName: 'Codeforces Round 1008 (Div. 2)', rank: 512,  oldRating: 1841, newRating: 1864, ratingChange: 23 },
      { contestName: 'Codeforces Round 1005 (Div. 1)',  rank: 643,  oldRating: 1821, newRating: 1841, ratingChange: 20 },
      { contestName: 'Codeforces Round 1001 (Div. 2)', rank: 798,  oldRating: 1800, newRating: 1821, ratingChange: 21 },
    ]
  },
  lc: {
    rating: 1898, rank: 'Knight', ranking: 38514,
    solved: 732, acceptance: '67.68', handle: 'sumit__chauhan__',
    easy: 201, medium: 438, hard: 93,
  },
  cc: {
    rating: 2070, stars: '5★', maxRating: 2070,
    globalRank: 902, countryRank: 612, solved: 175,
  },
  gfg: {
    score: 1491, solved: 437, rank: 156, streak: 202,
    handle: 'sumit_chauhan143', profileScore: 1491, badge: 'Scholar',
  }
};

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    if (!data.lc?.rating || !data.lc?.solved) return null;
    if (!data.cc?.rating || data.cc?.rating < 100) return null;
    return data;
  } catch { return null; }
}

function saveCache(data) {
  try {
    if (!data.lc?.rating || !data.lc?.solved) return;
    if (!data.cc?.rating || data.cc?.rating < 100) return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch {}
}

async function fetchCF(handle) {
  const [infoRes, subRes, ratingRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
    fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`),
    fetch(`https://codeforces.com/api/user.rating?handle=${handle}`)
  ]);

  const info   = await infoRes.json();
  const sub    = await subRes.json();
  const rating = await ratingRes.json();

  const user   = info.result[0];
  const solved = new Set(
    (sub.result || [])
      .filter(s => s.verdict === 'OK')
      .map(s => `${s.problem.contestId}-${s.problem.index}`)
  ).size;

  // Most recent 3 only — the table reads as a highlight, not a full history.
  const contests = (rating.result || []).slice(-3).reverse().map(c => ({
    contestName:  c.contestName,
    rank:         c.rank,
    oldRating:    c.oldRating,
    newRating:    c.newRating,
    ratingChange: c.newRating - c.oldRating,
  }));

  return {
    rating: user.rating || 0, rank: user.rank || 'unranked',
    maxRating: user.maxRating || 0, maxRank: user.maxRank || 'unranked',
    solved, handle, contests,
  };
}

async function fetchLC(handle) {
  const [res, statsRes, contestRes] = await Promise.all([
    fetch(`https://alfa-leetcode-api.onrender.com/${handle}`),
    fetch(`https://alfa-leetcode-api.onrender.com/${handle}/solved`),
    fetch(`https://alfa-leetcode-api.onrender.com/${handle}/contest`),
  ]);

  const data    = await res.json();
  const stats   = await statsRes.json();
  const contest = await contestRes.json();

  const rating = Math.round(contest?.contestRating) || 0;
  const easy   = stats.easySolved   || 0;
  const medium = stats.mediumSolved || 0;
  const hard   = stats.hardSolved   || 0;
  const solved = easy + medium + hard;

  if (!rating && !solved) throw new Error('LC API returned empty data');

  return {
    rating:     rating  || FALLBACK_DATA.lc.rating,
    rank:       data.badge?.name || FALLBACK_DATA.lc.rank,
    ranking:    data.ranking     || FALLBACK_DATA.lc.ranking,
    solved:     solved  || FALLBACK_DATA.lc.solved,
    acceptance: String(data.acceptanceRate || FALLBACK_DATA.lc.acceptance),
    handle,
    easy:   easy   || FALLBACK_DATA.lc.easy,
    medium: medium || FALLBACK_DATA.lc.medium,
    hard:   hard   || FALLBACK_DATA.lc.hard,
  };
}

async function fetchCC(handle) {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.codechef.com/users/${handle}`)}`;
  const res   = await fetch(proxy);
  const html  = await res.text();
  const doc   = new DOMParser().parseFromString(html, 'text/html');

  const ratingEl      = doc.querySelector('.rating-number');
  const starsEl       = doc.querySelector('.rating-star');
  const solvedEl      = doc.querySelector('.problems-solved h5');
  const globalRankEl  = doc.querySelector('.rating-ranks li:first-child strong');
  const countryRankEl = doc.querySelector('.rating-ranks li:last-child strong');

  const rating = parseInt(ratingEl?.textContent?.trim() || '0', 10);
  if (!rating || rating < 100) throw new Error('CC scrape returned invalid rating');

  return {
    rating,
    stars:       starsEl?.textContent?.trim()?.replace(/[()]/g, '') || FALLBACK_DATA.cc.stars,
    maxRating:   rating,
    globalRank:  globalRankEl  ? parseInt(globalRankEl.textContent.replace(/,/g, ''), 10) : FALLBACK_DATA.cc.globalRank,
    countryRank: countryRankEl ? parseInt(countryRankEl.textContent.replace(/,/g, ''), 10) : FALLBACK_DATA.cc.countryRank,
    solved:      solvedEl ? parseInt(solvedEl.textContent.match(/\d+/)?.[0] || '0', 10) : FALLBACK_DATA.cc.solved,
  };
}

async function fetchGFG(handle) {
  // /profile/, not /user/ — GFG moved profiles and the old path no longer
  // resolves for this handle.
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.geeksforgeeks.org/profile/${handle}/`)}`;
  const res   = await fetch(proxy);
  const html  = await res.text();

  const scoreMatch  = html.match(/overall coding score[\s\S]*?(\d+)/i);
  const solvedMatch = html.match(/total problems solved[\s\S]*?(\d+)/i);
  const rankMatch   = html.match(/global rank[\s\S]*?(\d+)/i);
  const streakMatch = html.match(/current streak[\s\S]*?(\d+)/i);

  return {
    score:        scoreMatch  ? parseInt(scoreMatch[1], 10)  : FALLBACK_DATA.gfg.score,
    solved:       solvedMatch ? parseInt(solvedMatch[1], 10) : FALLBACK_DATA.gfg.solved,
    rank:         rankMatch   ? parseInt(rankMatch[1], 10)   : FALLBACK_DATA.gfg.rank,
    streak:       streakMatch ? parseInt(streakMatch[1], 10) : FALLBACK_DATA.gfg.streak,
    handle,
    profileScore: scoreMatch  ? parseInt(scoreMatch[1], 10)  : FALLBACK_DATA.gfg.profileScore,
    badge:        FALLBACK_DATA.gfg.badge,
  };
}

/* ---- Render ---- */
function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.textContent = val;
}

function renderCF(d) {
  setText('cf-rating',     d.rating);
  setText('cf-rank',       cap(d.rank));
  setText('cf-max-rating', d.maxRating);
  setText('cf-max-rank',   cap(d.maxRank));
  setText('cf-solved',     d.solved?.toLocaleString());
  setText('cf-handle',     d.handle);

  const tbody = document.getElementById('cf-contests-body');
  if (tbody && d.contests?.length) {
    tbody.innerHTML = d.contests.map(c => {
      const sign = c.ratingChange >= 0 ? '+' : '';
      const cls  = c.ratingChange >= 0 ? 'green' : 'red';
      return `
        <tr>
          <td class="bold">${c.contestName}</td>
          <td class="mono">#${c.rank?.toLocaleString()}</td>
          <td class="mono">${c.newRating}</td>
          <td class="mono ${cls}">${sign}${c.ratingChange}</td>
        </tr>`;
    }).join('');
  }
}

function renderLC(d) {
  setText('lc-rating',        d.rating?.toLocaleString());
  setText('lc-rank',          d.rank);
  setText('lc-ranking',       d.ranking?.toLocaleString());
  setText('lc-ranking-exact', d.ranking?.toLocaleString());
  setText('lc-solved',        d.solved?.toLocaleString());
  setText('lc-acceptance',    d.acceptance + '%');
  setText('lc-handle',        d.handle);
  setText('lc-easy-count',    d.easy);
  setText('lc-medium-count',  d.medium);
  setText('lc-hard-count',    d.hard);

  const total = (d.easy || 0) + (d.medium || 0) + (d.hard || 0) || 1;
  const setBar = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.style.width = ((count || 0) / total * 100) + '%';
  };
  setBar('lc-easy-bar',   d.easy);
  setBar('lc-medium-bar', d.medium);
  setBar('lc-hard-bar',   d.hard);
}

function renderCC(d) {
  setText('cc-rating',       d.rating);
  setText('cc-stars',        d.stars);
  setText('cc-max-rating',   d.maxRating);
  setText('cc-global-rank',  '#' + (d.globalRank?.toLocaleString()  || '—'));
  setText('cc-country-rank', '#' + (d.countryRank?.toLocaleString() || '—'));
  setText('cc-stars-display', d.stars);
  setText('cc-solved',       d.solved);
}

function renderGFG(d) {
  setText('gfg-score',         d.score);
  setText('gfg-solved',        d.solved);
  setText('gfg-rank',          '#' + (d.rank?.toLocaleString() || '—'));
  setText('gfg-streak',        d.streak + ' days');
  setText('gfg-handle',        d.handle);
  setText('gfg-profile-score', d.profileScore);
  setText('gfg-badge',         d.badge);
}

function renderTelemetry(data) {
  if (data.cf)  renderCF(data.cf);
  if (data.lc)  renderLC(data.lc);
  if (data.cc)  renderCC(data.cc);
  if (data.gfg) renderGFG(data.gfg);
}

/* ---- Tab switching ---- */
function switchDashboardTab(tab) {
  document.querySelectorAll('.t-tab').forEach(t => {
    t.classList.toggle('t-tab--active', t.id === `db-tab-${tab}`);
  });
  document.querySelectorAll('.t-panel').forEach(p => {
    const active = p.id === `db-panel-${tab}`;
    if (active) { p.classList.remove('hidden'); p.style.display = ''; }
    else { p.classList.add('hidden'); }
  });
}

['cf', 'lc', 'cc', 'gfg'].forEach(tab => {
  const btn = document.getElementById(`db-tab-${tab}`);
  if (btn) btn.addEventListener('click', () => switchDashboardTab(tab));
});

/* ---- Live fetch ---- */
const HANDLES = {
  cf: 'SumitXorY',
  lc: 'sumit__chauhan__',
  cc: 'gosling_dude',
  gfg: 'sumit_chauhan143'
};

async function updateTelemetry() {
  const loader  = document.getElementById('dashboard-loader');
  const syncBtn = document.getElementById('telemetry-sync-btn');

  if (loader)  loader.classList.add('active');
  if (syncBtn) syncBtn.classList.add('syncing-active');

  try {
    const [cf, lc, cc, gfg] = await Promise.allSettled([
      fetchCF(HANDLES.cf),
      fetchLC(HANDLES.lc),
      fetchCC(HANDLES.cc),
      fetchGFG(HANDLES.gfg),
    ]);

    const data = {
      cf:  cf.status  === 'fulfilled' && cf.value?.rating                           ? cf.value  : FALLBACK_DATA.cf,
      lc:  lc.status  === 'fulfilled' && lc.value?.rating && lc.value?.solved       ? lc.value  : FALLBACK_DATA.lc,
      cc:  cc.status  === 'fulfilled' && cc.value?.rating && cc.value?.rating > 100 ? cc.value  : FALLBACK_DATA.cc,
      gfg: gfg.status === 'fulfilled' && gfg.value?.score                           ? gfg.value : FALLBACK_DATA.gfg,
    };

    renderTelemetry(data);
    saveCache(data);
  } catch (err) {
    console.warn('Telemetry fetch failed, using fallback.', err);
    renderTelemetry(FALLBACK_DATA);
  } finally {
    if (loader)  loader.classList.remove('active');
    if (syncBtn) syncBtn.classList.remove('syncing-active');
  }
}

// Sync button
const syncBtnEl = document.getElementById('telemetry-sync-btn');
if (syncBtnEl) {
  syncBtnEl.addEventListener('click', () => {
    localStorage.removeItem(CACHE_KEY);
    updateTelemetry();
  });
}

/* ---- Boot ---- */
(function bootTelemetry() {
  renderTelemetry(FALLBACK_DATA);
  switchDashboardTab('cf');

  const cached = loadCache();
  if (cached) { renderTelemetry(cached); return; }

  const dashEl = document.querySelector('.telemetry-wrap');
  if (!dashEl) { updateTelemetry(); return; }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      obs.disconnect();
      updateTelemetry();
    }
  }, { threshold: 0.1 });

  obs.observe(dashEl);
})();
