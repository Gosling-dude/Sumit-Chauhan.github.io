/* ================================================================
   SUMIT CHAUHAN — PORTFOLIO · SCRIPT.JS
   Page UI: navigation, mobile menu, backdrop video, hero + reveal
   animations, project cards and dashboard tabs.
   Live coding-profile data lives in js/live-profiles.mjs.
   Loaded with `defer`, so the DOM is parsed and Feather/GSAP (also
   deferred, earlier in the document) have already run.
   ================================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   PROJECTS — edit projects here, in one place. Cards are rendered
   from this array; links are only shown when a URL is present.
   --------------------------------------------------------------- */
const PROJECTS = [
  {
    id: 'herbigpt',
    title: 'HerbiGPT',
    category: 'Generative AI · Live Web App',
    description:
      'An AI assistant for questions about herbs and medicinal plants, built and shipped as a publicly available web app.',
    highlights: [
      'Conversational interface backed by a large language model',
      'Deployed on Netlify and live for anyone to try',
    ],
    technologies: ['Generative AI', 'LLM', 'Netlify'],
    liveUrl: 'https://herbigpt.netlify.app/',
    githubUrl: null,
  },
  {
    id: 'deeptrace',
    title: 'DeepTrace',
    category: 'AI Detection · SaaS Platform',
    description:
      'Production-grade AI image detection SaaS — dual-stream CNN + FFT frequency-domain architecture with Grad-CAM explainability, full JWT auth, RBAC, and admin analytics dashboards.',
    highlights: [
      'Dual-stream CNN + FFT architecture achieving 96.8% detection accuracy at 180ms inference',
      'Grad-CAM heatmap overlay for model explainability and auditability',
      'JWT-based auth with role-based access control and admin user management',
      'Dockerized FastAPI + React 18 stack with PostgreSQL and async workers',
    ],
    technologies: ['Python', 'FastAPI', 'PyTorch', 'React 18', 'TypeScript', 'Docker', 'PostgreSQL'],
    liveUrl: null,
    githubUrl: 'https://github.com/Gosling-dude/DeepTrace',
  },
];

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'className') el.className = value;
    else if (key === 'text') el.textContent = value;
    else el.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    el.append(child);
  }
  return el;
}

function externalLink(href, className, children, srLabel) {
  return h('a', { href, className, target: '_blank', rel: 'noopener noreferrer' }, [
    ...children,
    h('span', { className: 'sr-only', text: srLabel }),
  ]);
}

function projectCard(project, index) {
  const number = String(index + 1).padStart(2, '0');
  const links = [];
  if (project.liveUrl) {
    links.push(externalLink(project.liveUrl, 'project-link-btn project-link-btn--primary mag-btn', [
      'Live Demo ', h('span', { 'aria-hidden': 'true', text: '↗' }),
    ], `${project.title} live demo (opens in a new tab)`));
  }
  if (project.githubUrl) {
    links.push(externalLink(project.githubUrl, 'project-link-btn mag-btn', [
      h('i', { 'data-feather': 'github' }), 'GitHub ', h('span', { 'aria-hidden': 'true', text: '↗' }),
    ], `${project.title} source on GitHub (opens in a new tab)`));
  }

  return h('article', {
    className: `project-item reveal-elem glass-panel${index % 2 ? ' project-item--flip' : ''}`,
    'aria-labelledby': `project-${project.id}-title`,
  }, [
    h('div', { className: 'project-visual', 'aria-hidden': 'true' }, [
      h('div', { className: 'project-plate' }, [
        h('span', { className: 'project-plate-idx', text: number }),
        h('span', { className: 'project-plate-rule' }),
        h('span', { className: 'project-plate-name', text: project.title.toUpperCase() }),
      ]),
    ]),
    h('div', { className: 'project-content' }, [
      h('div', { className: 'project-header' }, [
        h('div', {}, [
          h('span', { className: 'project-type-label', text: project.category }),
          h('h3', { className: 'project-title', id: `project-${project.id}-title`, text: project.title }),
        ]),
        h('div', { className: 'project-links-row' }, links),
      ]),
      h('p', { className: 'project-desc', text: project.description }),
      project.highlights.length
        ? h('ul', { className: 'project-bullets' }, project.highlights.map((t) => h('li', { text: t })))
        : null,
      h('ul', { className: 'project-tech-stack', 'aria-label': 'Technologies' },
        project.technologies.map((t) => h('li', { className: 'tech-chip', text: t }))),
    ]),
  ]);
}

(function renderProjects() {
  const list = document.getElementById('projects-list');
  if (!list) return;
  list.replaceChildren(...PROJECTS.map(projectCard));
})();

/* ---------------------------------------------------------------
   ICONS — once, after all icon placeholders (incl. projects) exist
   --------------------------------------------------------------- */
if (window.feather) feather.replace({ 'stroke-width': 1.75, width: 18, height: 18 });

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

/* ---------------------------------------------------------------
   SCROLL PROGRESS
   --------------------------------------------------------------- */
const scrollProgressBar = document.getElementById('scroll-progress');

function scrollFraction() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
}
function updateScrollProgress() {
  if (scrollProgressBar) scrollProgressBar.style.width = scrollFraction() * 100 + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ---------------------------------------------------------------
   NAVIGATION — SCROLL STATE + ACTIVE LINK
   --------------------------------------------------------------- */
const mainNav = document.getElementById('main-nav');
const navLinks = document.querySelectorAll('.nav-link[data-target]');
const sceneSections = Array.from(document.querySelectorAll('.scene-section'));

let activeSectionId = '';

window.addEventListener('scroll', () => {
  if (mainNav) mainNav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

function updateActiveSection() {
  const centerY = window.innerHeight * 0.42;
  let currentId = sceneSections.length ? sceneSections[0].id : '';
  for (const sec of sceneSections) {
    if (sec.getBoundingClientRect().top <= centerY) currentId = sec.id;
  }
  if (currentId === activeSectionId) return;
  activeSectionId = currentId;
  navLinks.forEach((l) => {
    const active = l.getAttribute('data-target') === currentId;
    l.classList.toggle('active', active);
    if (active) l.setAttribute('aria-current', 'true');
    else l.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('load', updateActiveSection);
updateActiveSection();

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => { e.preventDefault(); smoothScrollTo(link.getAttribute('data-target')); });
});

/* ---------------------------------------------------------------
   MOBILE MENU — one handler. (index.html used to bind a second click
   handler too; the two toggles cancelled out and the menu never opened.)
   --------------------------------------------------------------- */
(function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const isOpen = () => menu.classList.contains('open');
  function setOpen(open, { returnFocus = false } = {}) {
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if ('inert' in menu) menu.inert = !open;
    if (open) {
      const first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else if (returnFocus) {
      btn.focus();
    }
  }
  setOpen(false);

  btn.addEventListener('click', () => setOpen(!isOpen()));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  });
  window.matchMedia('(min-width: 921px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
})();

/* ---------------------------------------------------------------
   BACKDROP VIDEO
   Decorative only. Phones, reduced-motion and data-saver visitors get
   the still poster (CSS background on .cosmos-stage) and never download
   the video. On desktop the poster sits underneath until the first
   frame plays, then the video fades in over it.
   --------------------------------------------------------------- */
(function initCosmicBackdrop() {
  const video = document.getElementById('cosmos-video');
  const stage = video && video.closest('.cosmos-stage');
  if (!video || !stage) return;

  const connection = navigator.connection || {};
  const saveData = connection.saveData === true || /(^|-)2g$/.test(connection.effectiveType || '');
  const small = window.matchMedia('(max-width: 760px)').matches;
  if (small || prefersReducedMotion || saveData) return;

  video.src = video.dataset.src;

  video.addEventListener('loadedmetadata', () => {
    // Slightly under real time so the drift reads as ambient.
    video.playbackRate = 0.75;
  }, { once: true });
  video.addEventListener('playing', () => stage.classList.add('is-playing'), { once: true });

  // Autoplay can still be refused (battery saver, policy). The poster is
  // already the right backdrop, so just release the element.
  video.play().catch(() => {
    video.removeAttribute('src');
    video.load();
  });

  // No decoding while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (!video.getAttribute('src')) return;
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
  if (prefersReducedMotion) { el.textContent = roles[0]; return; }
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
   Every [data-anim] element starts at opacity 0 in CSS, so each one
   must be revealed here. (.hero-mini-stats used to be missed and stayed
   invisible.)
   --------------------------------------------------------------- */
(function initHeroAnimations() {
  const showAll = () => document.querySelectorAll('[data-anim]').forEach((el) => { el.style.opacity = 1; });
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) { showAll(); return; }
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.fromTo('[data-anim="hero-badge"]', { opacity: 0, y: 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 })
    .fromTo('[data-anim="hero-line"]', { opacity: 0, y: 60, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.12 }, '-=0.5')
    .fromTo('[data-anim="hero-desc"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '-=0.6')
    .fromTo(['[data-anim="hero-actions"]', '[data-anim="hero-social"]', '[data-anim="hero-stats"]'],
      { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')
    .fromTo('.hero-scroll-cue', { opacity: 0 }, { opacity: 0.5, duration: 1 }, '-=0.3');

  // Safety net: whatever happens to the timeline, nothing stays invisible.
  setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 6000);

  ScrollTrigger.create({
    trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.5,
    onUpdate: (self) => gsap.set('.hero-content', { y: self.progress * 40 }),
  });
})();

/* ---------------------------------------------------------------
   SECTION REVEAL ANIMATIONS
   --------------------------------------------------------------- */
(function initRevealAnimations() {
  const elems = document.querySelectorAll('.reveal-elem');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elems.forEach((el) => el.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  elems.forEach((el) => observer.observe(el));
})();

/* ---------------------------------------------------------------
   DASHBOARD TABS (WAI-ARIA tabs: click, arrows, Home/End)
   --------------------------------------------------------------- */
(function initDashboardTabs() {
  const tabs = Array.from(document.querySelectorAll('.telemetry-tabs [role="tab"]'));
  if (!tabs.length) return;

  function select(tab, { focus = false } = {}) {
    for (const t of tabs) {
      const active = t === tab;
      t.classList.toggle('t-tab--active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    }
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], { focus: true });
    });
  });
})();
