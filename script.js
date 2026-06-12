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
   COSMIC UNIVERSE CANVAS — REALISTIC EDITION
   Physically-based lighting · Saturn ring system · Lunar surface
   Multi-layer parallax · Atmospheric scattering · Shooting stars
   --------------------------------------------------------------- */
(function initCosmicUniverse() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let W, H, time = 0, scrollY = 0;
  let stars = [], shootingStars = [], lastShoot = 0;
  let mouse = { x: 0, y: 0 }, sm = { x: 0, y: 0 };

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* ─── Stars ─────────────────────────────────────────────────── */
  const STAR_COLS = [
    [255,255,255],[222,232,255],[255,238,218],[202,215,255],[255,218,210],[208,255,240],
  ];

  function makeStar() {
    const bright = Math.random();
    return {
      x: Math.random() * W, y: Math.random() * H,
      r:  bright > 0.92 ? 1.4 + Math.random() * 1.8
        : bright > 0.72 ? 0.6 + Math.random() * 0.9 : 0.18 + Math.random() * 0.5,
      a:   0.18 + bright * 0.82,
      par: 0.06 + bright * 0.88,
      ts:  0.35 + Math.random() * 2.4,
      to:  Math.random() * Math.PI * 2,
      col: STAR_COLS[Math.floor(Math.random() * STAR_COLS.length)],
    };
  }

  function initStars() {
    const n = Math.min(Math.floor(W * H / 2600), 520);
    stars = Array.from({ length: n }, makeStar);
  }

  function drawStars(mx, my, t) {
    stars.forEach(s => {
      const tw  = 0.5 + 0.5 * Math.sin(t * s.ts + s.to);
      const al  = s.a * (0.48 + 0.52 * tw);
      const rad = s.r * (0.86 + 0.14 * tw);
      const ox  = mx * s.par * 0.030;
      const oy  = my * s.par * 0.030 - scrollY * s.par * 0.065;
      const x   = ((s.x + ox) % W + W) % W;
      const y   = ((s.y + oy) % H + H) % H;
      const [rv, gv, bv] = s.col;

      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rv},${gv},${bv},${al})`;
      ctx.fill();

      // Diffraction spikes on brightest stars
      if (rad > 1.4 && tw > 0.73) {
        const spike = rad * 4.5 * ((tw - 0.73) / 0.27);
        ctx.save();
        ctx.globalAlpha = ((tw - 0.73) / 0.27) * al * 0.45;
        ctx.strokeStyle = `rgba(${rv},${gv},${bv},1)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x - spike, y); ctx.lineTo(x + spike, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - spike); ctx.lineTo(x, y + spike); ctx.stroke();
        ctx.restore();
      }
    });
  }

  /* ─── Nebulae ────────────────────────────────────────────────── */
  const NEBULAE = [
    { rx:0.14, ry:0.13, size:310, par:0.030, r:88,  g:90,  b:220, oa:0.05 },
    { rx:0.82, ry:0.60, size:240, par:0.038, r:28,  g:190, b:220, oa:0.044 },
    { rx:0.48, ry:0.87, size:180, par:0.032, r:145, g:115, b:240, oa:0.040 },
  ];

  function drawNebulae(mx, my) {
    NEBULAE.forEach(n => {
      const ox = mx * n.par * 0.04;
      const oy = my * n.par * 0.04 - scrollY * n.par * 0.09;
      const x  = n.rx * W + ox, y = n.ry * H + oy;
      ctx.save();
      ctx.scale(1.9, 1);
      const g = ctx.createRadialGradient(x/1.9, y, 0, x/1.9, y, n.size);
      g.addColorStop(0,    `rgba(${n.r},${n.g},${n.b},${n.oa})`);
      g.addColorStop(0.42, `rgba(${n.r},${n.g},${n.b},${n.oa * 0.38})`);
      g.addColorStop(1,    `rgba(${n.r},${n.g},${n.b},0)`);
      ctx.beginPath(); ctx.arc(x/1.9, y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    });
  }

  /* ─── Saturn ─────────────────────────────────────────────────── */
  // Ring tilt: 26° elevation from ring plane → vertical compression = sin(26°)
  const RING_TILT = Math.sin(26 * Math.PI / 180); // ≈ 0.438

  // Actual Cassini-era ring structure (inner/outer radii as multiples of planet radius)
  // [inner, outer, opacity, [R, G, B]]
  const RING_BANDS = [
    [1.235, 1.380, 0.11, [145, 118, 80]],  // C ring faint
    [1.380, 1.525, 0.19, [160, 132, 90]],  // C ring
    [1.525, 1.648, 0.74, [220, 195, 150]], // B ring inner
    [1.648, 1.768, 0.90, [232, 210, 165]], // B ring peak (brightest)
    [1.768, 1.870, 0.77, [222, 200, 156]], // B ring outer
    [1.870, 1.955, 0.62, [210, 185, 140]], // B ring fading
    [1.955, 2.025, 0.04, [30,  22,  12]],  // Cassini Division (dark gap)
    [2.025, 2.088, 0.62, [205, 182, 138]], // A ring inner
    [2.088, 2.150, 0.70, [212, 188, 144]], // A ring main
    [2.150, 2.168, 0.05, [28,  20,  10]],  // Encke gap (thin dark line)
    [2.168, 2.235, 0.54, [198, 175, 132]], // A ring outer
    [2.235, 2.360, 0.22, [172, 150, 112]], // A ring fading
    [2.360, 2.520, 0.09, [142, 122, 90]],  // Faint outer rings
  ];

  function drawRingBands(r) {
    RING_BANDS.forEach(([inn, out, alpha, [rv, gv, bv]]) => {
      ctx.beginPath();
      // Outer ellipse clockwise → filled area
      ctx.ellipse(0, 0, out * r, out * r * RING_TILT, 0, 0, Math.PI * 2, false);
      // Inner ellipse counter-clockwise → punch hole (creates annulus)
      ctx.ellipse(0, 0, inn * r, inn * r * RING_TILT, 0, 0, Math.PI * 2, true);
      ctx.fillStyle = `rgba(${rv},${gv},${bv},${alpha})`;
      ctx.fill('evenodd');
    });
  }

  function drawSaturnSphere(r) {
    const lx = -0.45, ly = -0.55; // light direction (upper-left)
    const hlx = lx * r * 0.32, hly = ly * r * 0.32;

    // Diffuse lighting gradient (lit hemisphere to dark limb)
    const base = ctx.createRadialGradient(hlx, hly, r * 0.01, 0, 0, r * 1.06);
    base.addColorStop(0,    'rgba(255, 238, 195, 0.98)'); // bright lit spot
    base.addColorStop(0.18, 'rgba(242, 218, 170, 0.97)');
    base.addColorStop(0.42, 'rgba(218, 192, 137, 0.95)');
    base.addColorStop(0.66, 'rgba(185, 157, 98,  0.93)');
    base.addColorStop(0.84, 'rgba(130, 102, 58,  0.91)');
    base.addColorStop(1.00, 'rgba(52,  36,  16,  0.89)'); // dark terminator
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.06, r, 0, 0, Math.PI * 2); // slightly oblate
    ctx.fillStyle = base; ctx.fill();

    // Atmospheric bands
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.06, r, 0, 0, Math.PI * 2); ctx.clip();
    [[-0.62,0.052,'rgba(170,138,82,0.22)'],[-0.40,0.042,'rgba(155,124,70,0.17)'],
     [-0.18,0.062,'rgba(188,160,106,0.15)'],[ 0.06,0.068,'rgba(178,148,90,0.20)'],
     [ 0.26,0.048,'rgba(162,132,76,0.16)'],[ 0.46,0.038,'rgba(150,122,68,0.13)'],
     [ 0.63,0.032,'rgba(140,114,62,0.10)']].forEach(([yf, hw, col]) => {
      ctx.beginPath();
      ctx.ellipse(0, yf * r, r * 1.04, r * hw, 0, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    });
    ctx.restore();

    // Ring shadow on planet — dark band near equator
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.06, r, 0, 0, Math.PI * 2); ctx.clip();
    const rs = ctx.createLinearGradient(0, -r * 0.20, 0, r * 0.30);
    rs.addColorStop(0,    'rgba(10,7,2,0)');
    rs.addColorStop(0.25, 'rgba(10,7,2,0.35)');
    rs.addColorStop(0.55, 'rgba(10,7,2,0.26)');
    rs.addColorStop(0.82, 'rgba(10,7,2,0.10)');
    rs.addColorStop(1,    'rgba(10,7,2,0)');
    ctx.fillStyle = rs;
    ctx.fillRect(-r * 1.1, -r * 0.20, r * 2.2, r * 0.50);
    ctx.restore();

    // Specular highlight
    const spec = ctx.createRadialGradient(hlx*0.62, hly*0.62, 0, hlx*0.62, hly*0.62, r*0.40);
    spec.addColorStop(0,   'rgba(255,252,240,0.32)');
    spec.addColorStop(0.38,'rgba(255,252,240,0.10)');
    spec.addColorStop(1,   'rgba(255,252,240,0)');
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.06, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = spec; ctx.fill();

    // Limb darkening
    const limb = ctx.createRadialGradient(0, 0, r * 0.54, 0, 0, r * 1.08);
    limb.addColorStop(0,    'rgba(0,0,0,0)');
    limb.addColorStop(0.68, 'rgba(0,0,0,0.04)');
    limb.addColorStop(0.85, 'rgba(0,0,0,0.24)');
    limb.addColorStop(1.00, 'rgba(0,0,0,0.72)');
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.08, r * 1.02, 0, 0, Math.PI * 2);
    ctx.fillStyle = limb; ctx.fill();

    // Atmospheric rim scatter
    const atm = ctx.createRadialGradient(0, 0, r * 0.92, 0, 0, r * 1.24);
    atm.addColorStop(0,    'rgba(205,172,112,0)');
    atm.addColorStop(0.55, 'rgba(205,172,112,0.04)');
    atm.addColorStop(1,    'rgba(205,172,112,0.13)');
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.24, r * 1.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = atm; ctx.fill();
  }

  function drawSaturn(mx, my, t) {
    const par = 0.12;
    const ox  = mx * par * 0.05 + Math.sin(t * 0.055) * 1.2;
    const oy  = my * par * 0.05 - scrollY * par * 0.11 + Math.cos(t * 0.045) * 0.8;
    const scx = W * 0.84 + ox;
    const scy = H * 0.19 + oy;
    const r   = Math.max(28, Math.min(56, W * 0.043));
    const tilt = -18 * Math.PI / 180;
    const big  = r * 4;

    ctx.save();
    ctx.translate(scx, scy);
    ctx.rotate(tilt);

    // Back rings (y < 0 in rotated frame — behind the planet)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-big, -big, big * 2, big); // covers y ∈ [−big, 0]
    ctx.clip();
    drawRingBands(r);
    ctx.restore();

    // Planet sphere
    drawSaturnSphere(r);

    // Front rings (y ≥ 0 in rotated frame — in front of planet)
    ctx.save();
    ctx.beginPath();
    ctx.rect(-big, 0, big * 2, big); // covers y ∈ [0, big]
    ctx.clip();
    drawRingBands(r);
    ctx.restore();

    ctx.restore();

    // Outer ambient glow (in screen coords)
    const gl = ctx.createRadialGradient(scx, scy, r, scx, scy, r * 4.5);
    gl.addColorStop(0, 'rgba(218,190,130,0.06)');
    gl.addColorStop(1, 'rgba(218,190,130,0)');
    ctx.beginPath(); ctx.arc(scx, scy, r * 4.5, 0, Math.PI * 2);
    ctx.fillStyle = gl; ctx.fill();
  }

  /* ─── Moon ───────────────────────────────────────────────────── */
  function drawMoon(mx, my, t) {
    const par = 0.17;
    const ox  = mx * par * 0.055 + Math.sin(t * 0.10 + 2.1) * 1.8;
    const oy  = my * par * 0.055 - scrollY * par * 0.13 + Math.cos(t * 0.085 + 1.4) * 1.2;
    const cx  = W * 0.11 + ox;
    const cy  = H * 0.30 + oy;
    const r   = Math.max(18, Math.min(36, W * 0.026));
    const lx  = -0.42, ly = -0.54; // same solar direction as Saturn
    const hlx = cx + lx * r * 0.32;
    const hly = cy + ly * r * 0.32;

    // Outer glow halo
    const glow = ctx.createRadialGradient(cx, cy, r * 0.72, cx, cy, r * 3.0);
    glow.addColorStop(0, 'rgba(212,207,192,0.06)');
    glow.addColorStop(1, 'rgba(212,207,192,0)');
    ctx.beginPath(); ctx.arc(cx, cy, r * 3.0, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();

    // Base surface (diffuse Lambertian)
    const base = ctx.createRadialGradient(hlx, hly, r * 0.02, cx, cy, r * 1.02);
    base.addColorStop(0,    'rgba(252,248,234,0.97)');
    base.addColorStop(0.28, 'rgba(225,220,203,0.96)');
    base.addColorStop(0.58, 'rgba(185,180,163,0.94)');
    base.addColorStop(0.80, 'rgba(132,127,112,0.92)');
    base.addColorStop(1.00, 'rgba(44, 41, 35, 0.88)');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = base; ctx.fill();

    // Lunar mare (dark basalt plains — like the real Moon)
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    [{ dx:-0.20, dy:-0.10, ex:0.28, ey:0.22, a:0.32 },
     { dx: 0.14, dy: 0.18, ex:0.20, ey:0.17, a:0.27 },
     { dx:-0.04, dy:-0.35, ex:0.17, ey:0.13, a:0.23 },
     { dx: 0.30, dy:-0.07, ex:0.14, ey:0.11, a:0.19 }].forEach(m => {
      const mg = ctx.createRadialGradient(
        cx + m.dx*r, cy + m.dy*r, 0,
        cx + m.dx*r, cy + m.dy*r, Math.max(m.ex, m.ey) * r
      );
      mg.addColorStop(0,    `rgba(102,96,84,${m.a})`);
      mg.addColorStop(0.65, `rgba(102,96,84,${m.a * 0.45})`);
      mg.addColorStop(1,    'rgba(102,96,84,0)');
      ctx.beginPath();
      ctx.ellipse(cx + m.dx*r, cy + m.dy*r, m.ex*r, m.ey*r, 0, 0, Math.PI*2);
      ctx.fillStyle = mg; ctx.fill();
    });
    ctx.restore();

    // Impact craters with proper 3-pass lighting
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    [[-0.32,-0.12,0.092],[0.12,0.27,0.072],[-0.10,0.05,0.050],
     [0.24,-0.21,0.060],[-0.18,0.37,0.040],[0.37,0.12,0.034],
     [-0.41,0.06,0.038],[0.05,-0.31,0.046],[-0.28,0.21,0.028]].forEach(([dx,dy,cr]) => {
      const px = cx + dx*r, py = cy + dy*r, cr2 = cr*r;
      // Dark floor
      const floor = ctx.createRadialGradient(px, py, 0, px, py, cr2);
      floor.addColorStop(0,    'rgba(80,75,64,0.42)');
      floor.addColorStop(0.65, 'rgba(95,90,78,0.18)');
      floor.addColorStop(1,    'rgba(95,90,78,0)');
      ctx.beginPath(); ctx.arc(px, py, cr2, 0, Math.PI * 2);
      ctx.fillStyle = floor; ctx.fill();
      // Bright rim (lit side)
      ctx.beginPath(); ctx.arc(px, py, cr2 * 0.96, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(248,244,230,0.16)';
      ctx.lineWidth = Math.max(0.5, cr2 * 0.16); ctx.stroke();
      // Shadow rim (opposite side)
      ctx.beginPath(); ctx.arc(px - lx*cr2*0.28, py - ly*cr2*0.28, cr2 * 0.88, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(35,32,26,0.18)';
      ctx.lineWidth = Math.max(0.4, cr2 * 0.12); ctx.stroke();
    });
    ctx.restore();

    // Phase shadow — waning gibbous terminator
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    const term = ctx.createRadialGradient(cx + r*0.44, cy, r*0.03, cx + r*0.80, cy, r*1.14);
    term.addColorStop(0,    'rgba(3,3,5,0.97)');
    term.addColorStop(0.42, 'rgba(3,3,5,0.62)');
    term.addColorStop(0.70, 'rgba(3,3,5,0.18)');
    term.addColorStop(1,    'rgba(3,3,5,0)');
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = term; ctx.fill();
    ctx.restore();

    // Limb darkening (sphere edge)
    const limb = ctx.createRadialGradient(cx, cy, r * 0.58, cx, cy, r * 1.02);
    limb.addColorStop(0,    'rgba(0,0,0,0)');
    limb.addColorStop(0.72, 'rgba(0,0,0,0.07)');
    limb.addColorStop(0.88, 'rgba(0,0,0,0.34)');
    limb.addColorStop(1,    'rgba(0,0,0,0.74)');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = limb; ctx.fill();
  }

  /* ─── Distant planets ────────────────────────────────────────── */
  const DISTANT_PLANETS = [
    { rx:0.11, ry:0.72, par:0.21, rr:20,
      c0:[85,150,242],  c1:[48,108,202], atm:[100,175,255], orb:[0.10,1.9] },
    { rx:0.66, ry:0.83, par:0.29, rr:12,
      c0:[205,84,62],   c1:[162,56,40],  atm:[225,108,85],  orb:[0.07,2.5] },
  ];

  function drawDistantPlanets(mx, my, t) {
    DISTANT_PLANETS.forEach(p => {
      const ox = mx * p.par * 0.06 + Math.sin(t * p.orb[0]) * 3.5;
      const oy = my * p.par * 0.06 - scrollY * p.par * 0.14 + Math.cos(t * p.orb[0] * 0.78) * 2.5;
      const cx = p.rx * W + ox;
      const cy = p.ry * H + oy;
      const r  = Math.max(8, Math.min(p.rr, W * 0.018));
      const lx = -0.42, ly = -0.54;
      const hlx = cx + lx * r * 0.30;
      const hly = cy + ly * r * 0.30;

      // Base sphere with directional lighting
      const base = ctx.createRadialGradient(hlx, hly, r * 0.02, cx, cy, r * 1.02);
      base.addColorStop(0,    `rgba(${Math.min(p.c0[0]+38,255)},${Math.min(p.c0[1]+32,255)},${Math.min(p.c0[2]+28,255)},0.95)`);
      base.addColorStop(0.42, `rgba(${p.c0[0]},${p.c0[1]},${p.c0[2]},0.93)`);
      base.addColorStop(0.78, `rgba(${p.c1[0]},${p.c1[1]},${p.c1[2]},0.91)`);
      base.addColorStop(1,    `rgba(${Math.floor(p.c1[0]*0.32)},${Math.floor(p.c1[1]*0.32)},${Math.floor(p.c1[2]*0.32)},0.88)`);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = base; ctx.fill();

      // Specular spot
      const spec = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, r * 0.48);
      spec.addColorStop(0, 'rgba(255,255,255,0.24)');
      spec.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();

      // Limb darkening
      const limb = ctx.createRadialGradient(cx, cy, r * 0.56, cx, cy, r * 1.02);
      limb.addColorStop(0,    'rgba(0,0,0,0)');
      limb.addColorStop(0.70, 'rgba(0,0,0,0.10)');
      limb.addColorStop(0.88, 'rgba(0,0,0,0.42)');
      limb.addColorStop(1,    'rgba(0,0,0,0.78)');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = limb; ctx.fill();

      // Atmosphere scatter
      const [ra,ga,ba] = p.atm;
      const atm = ctx.createRadialGradient(cx, cy, r * 0.70, cx, cy, r * 1.65);
      atm.addColorStop(0,    `rgba(${ra},${ga},${ba},0)`);
      atm.addColorStop(0.55, `rgba(${ra},${ga},${ba},0.05)`);
      atm.addColorStop(1,    `rgba(${ra},${ga},${ba},0.16)`);
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.65, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();
    });
  }

  /* ─── Shooting stars ─────────────────────────────────────────── */
  function makeShootingStar() {
    const ang = (8 + Math.random() * 32) * Math.PI / 180;
    const spd = 9 + Math.random() * 15;
    return {
      x: -80 + Math.random() * (W + 160),
      y: -50 + Math.random() * H * 0.55,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      len: 70 + Math.random() * 200, life: 1.0,
    };
  }

  function drawShootingStars() {
    if (time - lastShoot > 5 + Math.sin(time * 0.6) * 4 + 4) {
      shootingStars.push(makeShootingStar());
      lastShoot = time;
    }
    shootingStars = shootingStars.filter(s => s.life > 0);
    shootingStars.forEach(s => {
      const tx = s.x - s.vx * s.len / 14;
      const ty = s.y - s.vy * s.len / 14;
      const g  = ctx.createLinearGradient(tx, ty, s.x, s.y);
      g.addColorStop(0,    'rgba(255,255,255,0)');
      g.addColorStop(0.52, `rgba(220,235,255,${s.life * 0.48})`);
      g.addColorStop(1,    `rgba(255,255,255,${s.life})`);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.stroke();
      // Head flare
      ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.life})`; ctx.fill();
      s.x += s.vx; s.y += s.vy; s.life -= 0.019;
    });
  }

  /* ─── Init / loop ────────────────────────────────────────────── */
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }

  function initScene() { resize(); initStars(); }

  function render(ts) {
    time = ts * 0.001;
    sm.x += (mouse.x - sm.x) * 0.042;
    sm.y += (mouse.y - sm.y) * 0.042;
    const mx = sm.x - W / 2;
    const my = sm.y - H / 2;

    ctx.clearRect(0, 0, W, H);
    drawNebulae(mx, my);
    drawStars(mx, my, time);
    drawShootingStars();
    drawSaturn(mx, my, time);
    drawMoon(mx, my, time);
    drawDistantPlanets(mx, my, time);

    requestAnimationFrame(render);
  }

  initScene();
  requestAnimationFrame(render);

  let rsz;
  window.addEventListener('resize', () => {
    clearTimeout(rsz);
    rsz = setTimeout(initScene, 220);
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

const CACHE_KEY = 'portfolio_telemetry_cache_v4';
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
    handle: 'sumitchauh99td', profileScore: 1491, badge: 'Scholar',
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
  cf: 'SumitXorY',
  lc: 'sumit__chauhan__',
  cc: 'gosling_dude',
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
