/* ================================================================
   SUMIT CHAUHAN - PORTFOLIO · SCRIPT.JS
   Page UI: navigation, mobile menu, backdrop video, hero + reveal
   animations, project cards and dashboard tabs.
   Live coding-profile data lives in js/live-profiles.mjs.
   Loaded with `defer`, so the DOM is parsed and Feather/GSAP (also
   deferred, earlier in the document) have already run.
   ================================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   PROJECTS - edit projects here, in one place. Featured projects get
   the large two-column card; the rest go in the "More projects" grid.
   Links only render when a URL is present.
   --------------------------------------------------------------- */
const GITHUB_PROFILE = 'https://github.com/Gosling-dude';

const PROJECTS = [
  {
    id: 'deeptrace',
    title: 'DeepTrace',
    category: 'AI Detection · SaaS Platform',
    description:
      'AI image detection SaaS. A dual-stream CNN + FFT frequency-domain model with Grad-CAM explainability, behind JWT auth, role-based access and admin analytics.',
    highlights: [
      'Dual-stream CNN + FFT architecture: 96.8% detection accuracy at 180ms inference',
      'Grad-CAM heatmap overlays for explainability and auditability',
      'JWT auth with role-based access control and admin user management',
      'Dockerized FastAPI + React 18 stack with PostgreSQL and async workers',
    ],
    technologies: ['Python', 'FastAPI', 'PyTorch', 'React 18', 'TypeScript', 'Docker', 'PostgreSQL'],
    liveUrl: 'https://deep-trace-seven.vercel.app/',
    githubUrl: 'https://github.com/Gosling-dude/DeepTrace',
    featured: true,
  },
  {
    id: 'herbigpt',
    title: 'HerbiGPT',
    category: 'Generative AI · RAG Chatbot',
    description:
      'An AI Ayurveda chatbot that gives instant, grounded wellness guidance. Answers come from a LangChain retrieval pipeline over 2,500+ curated sources, which keeps hallucinations down.',
    highlights: [
      'LangChain retrieval over 2,500+ sources grounds every answer',
      'React front end with an Express API and Python retrieval service',
      'Deployed and live for anyone to try',
    ],
    technologies: ['React', 'Express', 'Python', 'LangChain'],
    liveUrl: 'https://herbigpt.netlify.app/',
    githubUrl: 'https://github.com/Gosling-dude/HerbiGPT---Your-Holistic-Wellness-Guide',
    featured: true,
  },
  {
    id: 'cyberflux',
    title: 'CyberFlux',
    category: 'Network Security · Distributed Systems',
    description:
      'Distributed TCP/IP packet inspection on a Raspberry Pi cluster that detects SSH brute-force and ARP spoofing attacks in real time.',
    highlights: [],
    technologies: ['Python', 'C++', 'Scapy', 'Linux'],
    liveUrl: null,
    githubUrl: 'https://github.com/Gosling-dude/CyberFlux-Advanced-Network-Intrusion-Detection-System-NIDS',
    featured: false,
  },
];

/* ---------------------------------------------------------------
   OPEN-SOURCE CONTRIBUTIONS - rendered into the experience timeline.
   `logo` is a symbol id from the Simple Icons sprite in index.html.
   `status`/`date` are shown only when known; nothing is inferred.
   --------------------------------------------------------------- */
const CONTRIBUTIONS = [
  {
    project: 'TensorFlow',
    repo: 'tensorflow/tensorflow',
    logo: 'tensorflow',
    tone: 'tensorflow',
    number: 126899,
    title: 'Fix SIGABRT when a string constant reaches DeviceCompilationClusterSignature',
    status: 'Merged',
    date: { label: 'Sep 2026', iso: '2026-09' },
    description:
      'Fixed an XLA/JIT crash: DT_STRING constants reached hashing logic that assumed memcpy-able tensor storage and aborted the process. Added a safe TensorProto serialization fallback plus regression tests.',
    tags: ['XLA / JIT', 'Crash fix', 'Correctness', 'Regression tests'],
    url: 'https://github.com/tensorflow/tensorflow/pull/126899',
  },
  {
    project: 'Apache Arrow',
    repo: 'apache/arrow',
    logo: 'apachearrow',
    tone: 'arrow',
    number: 51197,
    title: 'GH-33432: [R] Match base/stringr semantics for str_replace() with NA replacement',
    status: 'Merged',
    date: { label: 'Sep 2026', iso: '2026-09' },
    description:
      'Fixed string replacement in the R bindings so an NA replacement yields NA, matching base R and stringr, instead of inserting the literal string "NA". Regression tests cover the regex, fixed and ignore-case paths.',
    tags: ['R bindings', 'String semantics', 'Bug fix', 'Regression tests'],
    url: 'https://github.com/apache/arrow/pull/51197',
  },
  {
    project: 'OpenTelemetry Java',
    repo: 'open-telemetry/opentelemetry-java',
    logo: 'opentelemetry',
    tone: 'otel',
    number: 7937,
    title: 'Emit warning when TraceIdRatioBasedSampler is used as child sampler',
    status: 'Merged',
    date: null,
    description:
      'Added the spec-required compatibility warning at configuration time, with no change to runtime behavior.',
    tags: ['Tracing', 'Spec compliance'],
    url: 'https://github.com/open-telemetry/opentelemetry-java/pull/7937',
  },
  {
    project: 'OpenTelemetry Java',
    repo: 'open-telemetry/opentelemetry-java',
    logo: 'opentelemetry',
    tone: 'otel',
    number: 7951,
    title: 'Clarify suppressed warnings in API common module',
    status: null,
    date: null,
    description: 'Documented intentional warning suppressions to make the module easier to maintain. No functional changes.',
    tags: ['Maintainability'],
    url: 'https://github.com/open-telemetry/opentelemetry-java/pull/7951',
  },
  {
    project: 'Gemini CLI',
    repo: 'google-gemini/gemini-cli',
    logo: 'googlegemini',
    tone: 'gemini',
    number: 2725,
    title: 'Support GOOGLE_CLOUD_PROJECT_ID fallback',
    status: null,
    date: null,
    description: 'Added a backward-compatible environment variable fallback so setup works the same across platforms.',
    tags: ['Developer experience'],
    url: 'https://github.com/google-gemini/gemini-cli/pull/2725',
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

const SVG_NS = 'http://www.w3.org/2000/svg';
function spriteIcon(id, className) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#icon-${id}`);
  svg.append(use);
  return svg;
}

function externalLink(href, className, children, srLabel) {
  return h('a', { href, className, target: '_blank', rel: 'noopener noreferrer' }, [
    ...children,
    h('span', { className: 'sr-only', text: srLabel }),
  ]);
}

const arrow = () => h('span', { 'aria-hidden': 'true', text: '↗' });

function projectLinks(project) {
  const links = [];
  if (project.liveUrl) {
    links.push(externalLink(project.liveUrl, 'project-link-btn project-link-btn--primary mag-btn',
      ['Live Demo ', arrow()], `${project.title} live demo (opens in a new tab)`));
  }
  if (project.githubUrl) {
    links.push(externalLink(project.githubUrl, 'project-link-btn mag-btn',
      [spriteIcon('github', 'project-link-icon'), 'GitHub ', arrow()], `${project.title} source on GitHub (opens in a new tab)`));
  }
  return h('div', { className: 'project-links-row' }, links);
}

function techList(project) {
  return h('ul', { className: 'project-tech-stack', 'aria-label': 'Technologies' },
    project.technologies.map((t) => h('li', { className: 'tech-chip', text: t })));
}

function featuredProjectCard(project, index) {
  return h('article', {
    className: `project-item reveal-elem glass-panel${index % 2 ? ' project-item--flip' : ''}`,
    'aria-labelledby': `project-${project.id}-title`,
  }, [
    h('div', { className: 'project-visual', 'aria-hidden': 'true' }, [
      h('div', { className: 'project-plate' }, [
        h('span', { className: 'project-plate-idx', text: String(index + 1).padStart(2, '0') }),
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
      ]),
      h('p', { className: 'project-desc', text: project.description }),
      project.highlights.length
        ? h('ul', { className: 'project-bullets' }, project.highlights.map((t) => h('li', { text: t })))
        : null,
      techList(project),
      projectLinks(project),
    ]),
  ]);
}

function compactProjectCard(project) {
  return h('li', { className: 'mini-project glass-panel' }, [
    h('span', { className: 'project-type-label', text: project.category }),
    h('h4', { className: 'mini-project-title', text: project.title }),
    h('p', { className: 'mini-project-desc', text: project.description }),
    techList(project),
    projectLinks(project),
  ]);
}

function githubProjectsCard() {
  return h('li', { className: 'mini-project mini-project--github glass-panel' }, [
    spriteIcon('github', 'mini-project-gh'),
    h('h4', { className: 'mini-project-title', text: 'Everything else' }),
    h('p', { className: 'mini-project-desc', text: 'Experiments, competitive programming tooling and smaller builds live on GitHub.' }),
    externalLink(`${GITHUB_PROFILE}?tab=repositories`, 'project-link-btn mag-btn',
      ['Browse repositories ', arrow()], 'All repositories on GitHub (opens in a new tab)'),
  ]);
}

function renderProjects() {
  const list = document.getElementById('projects-list');
  const grid = document.getElementById('more-projects-grid');
  if (list) list.replaceChildren(...PROJECTS.filter((p) => p.featured).map(featuredProjectCard));
  if (grid) grid.replaceChildren(...PROJECTS.filter((p) => !p.featured).map(compactProjectCard), githubProjectsCard());
}

function contributionCard(c) {
  const meta = [h('span', { className: 'oss-card-repo', text: c.repo })];
  if (c.status) meta.push(h('span', { className: 'tl-status', text: c.status }));
  if (c.date) meta.push(h('time', { className: 'oss-card-date', datetime: c.date.iso, text: c.date.label }));

  return h('li', { className: 'tl-node tl-node--oss' }, [
    h('article', { className: `oss-card oss-card--${c.tone}`, 'aria-label': `${c.project} pull request #${c.number}` }, [
      h('header', { className: 'oss-card-head' }, [
        h('span', { className: 'oss-card-logo' }, [spriteIcon(c.logo, 'oss-card-logo-svg')]),
        h('div', { className: 'oss-card-id' }, [
          h('span', { className: 'oss-card-project', text: c.project }),
          h('span', { className: 'oss-card-meta' }, meta),
        ]),
      ]),
      h('h4', { className: 'oss-card-title', text: c.title }),
      h('p', { className: 'oss-card-desc', text: c.description }),
      h('div', { className: 'tl-tags' }, c.tags.map((t) => h('span', { className: 'tl-tag', text: t }))),
      externalLink(c.url, 'pr-btn', [
        h('i', { 'data-feather': 'git-pull-request' }),
        h('span', { text: 'View Pull Request' }),
        h('span', { className: 'pr-btn-arrow', 'aria-hidden': 'true', text: '↗' }),
      ], `${c.repo} #${c.number} (opens in a new tab)`),
    ]),
  ]);
}

function renderContributions() {
  const label = document.getElementById('oss-label');
  if (!label) return;
  document.querySelectorAll('[data-oss-fallback]').forEach((el) => el.remove());
  label.after(...CONTRIBUTIONS.map(contributionCard));
}

renderProjects();
renderContributions();

/* ---------------------------------------------------------------
   ICONS - once, after all icon placeholders (incl. projects) exist
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
   NAVIGATION - SCROLL STATE + ACTIVE LINK
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
   MOBILE MENU - one handler. (index.html used to bind a second click
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
