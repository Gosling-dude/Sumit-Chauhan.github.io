/* ================================================================
   SUMIT CHAUHAN PORTFOLIO — SCRIPT.JS
   Animation Engine + Live Telemetry Dashboard
   ================================================================ */

/* ---------------------------------------------------------------
   REDUCED MOTION CHECK
   --------------------------------------------------------------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   FEATHER ICONS
   --------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.feather) feather.replace({ 'stroke-width': 1.75 });
});

/* ---------------------------------------------------------------
   SCROLL PROGRESS
   --------------------------------------------------------------- */
const scrollProgressBar = document.getElementById('scroll-progress');

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (scrollProgressBar) scrollProgressBar.style.width = progress + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ---------------------------------------------------------------
   NAVIGATION — SCROLL STATE + ACTIVE LINK
   --------------------------------------------------------------- */
const mainNav = document.getElementById('main-nav');
const navLinks = document.querySelectorAll('.nav-link[data-target]');

window.addEventListener('scroll', () => {
  if (!mainNav) return;
  mainNav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let currentId = '';
  const triggerY = window.innerHeight * 0.35;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= triggerY && rect.bottom > triggerY) {
      currentId = sec.id;
    }
  });

  navLinks.forEach(link => {
    const target = link.getAttribute('data-target');
    link.classList.toggle('active', target === currentId);
  });
}

window.addEventListener('scroll', updateActiveNavLink, { passive: true });
updateActiveNavLink();

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('data-target');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
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
   CUSTOM CURSOR
   --------------------------------------------------------------- */
(function initCursor() {
  if (prefersReducedMotion) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    dotX  += (mouseX - dotX)  * 0.9;
    dotY  += (mouseY - dotY)  * 0.9;
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    dot.style.transform  = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
    ring.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  const hoverSel = 'a, button, [role="button"], .mag-btn, .t-tab, .skill-pill, .platform-card, .nav-link';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });
})();

/* ---------------------------------------------------------------
   MAGNETIC BUTTONS
   --------------------------------------------------------------- */
(function initMagneticButtons() {
  if (prefersReducedMotion) return;

  const STRENGTH = 0.35;
  const RANGE    = 80;

  document.querySelectorAll('.mag-btn').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RANGE) {
        el.style.transform = `translate3d(${dx * STRENGTH}px, ${dy * STRENGTH}px, 0)`;
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ---------------------------------------------------------------
   HERO PARTICLE CANVAS
   --------------------------------------------------------------- */
(function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const COUNT    = prefersReducedMotion ? 0 : 90;
  const CONN_D   = 140;
  const MOUSE_R  = 160;

  let mouse = { x: -9999, y: -9999 };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.18 * (0.4 + Math.random() * 1.2);
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  0.6 + Math.random() * 1.6,
      a:  0.1 + Math.random() * 0.55,
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(makeParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_R && d > 0) {
        const force = (MOUSE_R - d) / MOUSE_R * 0.008;
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;
      }

      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 0.8) { p.vx *= 0.98; p.vy *= 0.98; }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
      if (p.y < -5)  p.y = H + 5;
      if (p.y > H+5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129,140,248,${p.a})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONN_D) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(129,140,248,${(1 - dist / CONN_D) * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  }, { passive: true });
})();

/* ---------------------------------------------------------------
   HERO TYPING EFFECT
   --------------------------------------------------------------- */
(function initTypingEffect() {
  const el = document.getElementById('role-text');
  if (!el) return;

  const roles = [
    'Full Stack Developer',
    'Competitive Programmer',
    'Open Source Contributor',
    'Problem Solver',
  ];

  let roleIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = roles[roleIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
      }
    }

    setTimeout(type, deleting ? 48 : 90);
  }

  setTimeout(type, 1200);
})();

/* ---------------------------------------------------------------
   HERO GSAP ANIMATIONS
   --------------------------------------------------------------- */
(function initHeroAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    gsap.set(['.hero-badge', '.hero-title-line', '.hero-desc', '.hero-actions',
              '.hero-social', '.hero-visual', '.hero-scroll-cue'], { opacity: 1 });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.fromTo('.hero-badge',
    { opacity: 0, y: 20, filter: 'blur(8px)' },
    { opacity: 1, y: 0,  filter: 'blur(0px)', duration: 1 }
  )
  .fromTo('.hero-title-line',
    { opacity: 0, y: 60, filter: 'blur(6px)' },
    { opacity: 1, y: 0,  filter: 'blur(0px)', duration: 1.2, stagger: 0.12 },
    '-=0.5'
  )
  .fromTo('.hero-desc',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0,  duration: 1 },
    '-=0.6'
  )
  .fromTo(['.hero-actions', '.hero-social'],
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0,  duration: 0.9, stagger: 0.12 },
    '-=0.7'
  )
  .fromTo('.hero-visual',
    { opacity: 0, scale: 0.88, y: 30 },
    { opacity: 1, scale: 1,    y: 0,  duration: 1.4, ease: 'power3.out' },
    '-=1.4'
  )
  .fromTo('.float-card',
    { opacity: 0, y: 20, scale: 0.9 },
    { opacity: 1, y: 0,  scale: 1,  duration: 0.9, stagger: 0.15, ease: 'back.out(1.6)' },
    '-=0.6'
  )
  .fromTo('.hero-scroll-cue',
    { opacity: 0 },
    { opacity: 0.4, duration: 1 },
    '-=0.3'
  );

  // Scroll parallax on hero
  ScrollTrigger.create({
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.5,
    onUpdate: self => {
      const prog = self.progress;
      gsap.set('.hero-visual',  { y: prog * 80 });
      gsap.set('.hero-content', { y: prog * 40 });
      gsap.set('.hero-bg-word', { y: prog * 120 });
    }
  });
})();

/* ---------------------------------------------------------------
   SECTION REVEAL ANIMATIONS
   --------------------------------------------------------------- */
(function initRevealAnimations() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-elem').forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
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
      const el      = entry.target;
      const target  = parseInt(el.getAttribute('data-count'), 10);
      const suffix  = el.getAttribute('data-suffix') || '';
      const prefix  = el.getAttribute('data-prefix') || '';
      const dur     = prefersReducedMotion ? 0 : 1800;
      const start   = performance.now();

      function tick(now) {
        const pct    = Math.min((now - start) / dur, 1);
        const eased  = 1 - Math.pow(1 - pct, 3);
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

const CACHE_KEY = 'portfolio_telemetry_cache_v3';
const CACHE_TTL = 5 * 60 * 1000;

const FALLBACK_DATA = {
  cf: {
    rating: 1605, rank: 'expert', maxRating: 1605, maxRank: 'expert',
    solved: 1001, handle: 'TemporalNova',
    contests: [
      { contestName: 'Codeforces Round 997 (Div. 2)', rank: 1174, oldRating: 1546, newRating: 1605, ratingChange: 59 },
      { contestName: 'Codeforces Round 993 (Div. 2)', rank: 2356, oldRating: 1536, newRating: 1546, ratingChange: 10 },
      { contestName: 'Codeforces Round 988 (Div. 3)', rank: 1580, oldRating: 1496, newRating: 1536, ratingChange: 40 },
    ]
  },
  lc: {
    rating: 1649, rank: 'Knight', ranking: 39500,
    solved: 563, acceptance: '66.7', handle: 'sumit__chauhan__',
    easy: 129, medium: 343, hard: 91,
  },
  cc: {
    rating: 1756, stars: '3★', maxRating: 1817,
    globalRank: 4116, countryRank: 1068, solved: 189,
  },
  gfg: {
    score: 874, solved: 257, rank: 5399, streak: 11,
    handle: 'sumitchauh99td', profileScore: 874, badge: 'Scholar',
  }
};

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function saveCache(data) {
  try {
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

  const contests = (rating.result || []).slice(-5).reverse().map(c => ({
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
  const [res, statsRes] = await Promise.all([
    fetch(`https://alfa-leetcode-api.onrender.com/${handle}`),
    fetch(`https://alfa-leetcode-api.onrender.com/${handle}/solved`)
  ]);

  const data  = await res.json();
  const stats = await statsRes.json();

  return {
    rating:     data.ranking || 0,
    rank:       data.badge?.name || 'Knight',
    ranking:    data.ranking || 0,
    solved:     stats.solvedProblem || 0,
    acceptance: data.acceptanceRate || '0',
    handle,
    easy:   stats.easySolved   || 0,
    medium: stats.mediumSolved || 0,
    hard:   stats.hardSolved   || 0,
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

  return {
    rating:      parseInt(ratingEl?.textContent?.trim() || '1756', 10),
    stars:       starsEl?.textContent?.trim()?.replace(/[()]/g, '') || '3★',
    maxRating:   1817,
    globalRank:  globalRankEl  ? parseInt(globalRankEl.textContent.replace(/,/g, ''), 10) : 4116,
    countryRank: countryRankEl ? parseInt(countryRankEl.textContent.replace(/,/g, ''), 10) : 1068,
    solved:      solvedEl ? parseInt(solvedEl.textContent.match(/\d+/)?.[0] || '189', 10) : 189,
  };
}

async function fetchGFG(handle) {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.geeksforgeeks.org/user/${handle}/`)}`;
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
    if (active) {
      p.classList.remove('hidden');
      p.style.display = '';
    } else {
      p.classList.add('hidden');
    }
  });
}

['cf', 'lc', 'cc', 'gfg'].forEach(tab => {
  const btn = document.getElementById(`db-tab-${tab}`);
  if (btn) btn.addEventListener('click', () => switchDashboardTab(tab));
});

/* ---- Live fetch ---- */
const HANDLES = {
  cf: 'TemporalNova',
  lc: 'sumit__chauhan__',
  cc: 'sumitchauhan08',
  gfg: 'sumitchauh99td'
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
      cf:  cf.status  === 'fulfilled' ? cf.value  : FALLBACK_DATA.cf,
      lc:  lc.status  === 'fulfilled' ? lc.value  : FALLBACK_DATA.lc,
      cc:  cc.status  === 'fulfilled' ? cc.value  : FALLBACK_DATA.cc,
      gfg: gfg.status === 'fulfilled' ? gfg.value : FALLBACK_DATA.gfg,
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
  if (cached) {
    renderTelemetry(cached);
    return;
  }

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
