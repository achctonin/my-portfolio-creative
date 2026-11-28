const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const narrow = window.matchMedia('(max-width: 700px)');
function closeMenu() {
  navigation.hidden = narrow.matches;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
}
function syncNavigation() {
  toggle.hidden = !narrow.matches;
  closeMenu();
}
syncNavigation();
narrow.addEventListener('change', syncNavigation);
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.hidden = !open;
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && narrow.matches && !navigation.hidden) {
    closeMenu();
    toggle.focus();
  }
});
// Keep native details semantics, with interruptible opening AND closing motion.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.personal-notes details').forEach(details => {
  const summary = details.querySelector('summary');
  let animation = null;
  let expanded = details.open;
  details.dataset.expanded = String(expanded);

  function settle() {
    if (animation) animation.cancel();
    animation = null;
    details.open = expanded;
    details.style.overflow = '';
    summary.setAttribute('aria-expanded', String(expanded));
  }

  summary.addEventListener('click', event => {
    event.preventDefault();
    const start = details.getBoundingClientRect().height;
    if (animation) animation.cancel();
    expanded = !expanded;
    details.dataset.expanded = String(expanded);
    summary.setAttribute('aria-expanded', String(expanded));
    if (reducedMotion.matches || typeof details.animate !== 'function') {
      settle();
      return;
    }

    // Keep content present until the closing animation finishes.
    details.open = true;
    const style = getComputedStyle(details);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const end = expanded
      ? details.getBoundingClientRect().height
      : summary.getBoundingClientRect().height + border;
    details.style.overflow = 'hidden';
    animation = details.animate(
      { height: [`${start}px`, `${end}px`] },
      { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    animation.onfinish = settle;
  });
  // Apply a changed OS preference immediately, even during an animation.
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) settle();
  });
});

// ---- Carousel gallery: add a project by adding one object below. ----
const BASE = 'assets/carousels/';
const projects = [
  { id: 'miche-question', tab: 'The Question', count: 7, kind: 'Carousel · MICHE.studio',
    title: 'The question<br><em>we ask every client</em>',
    summary: 'A seven-slide carousel built around one question a design studio asks before every project.',
    tags: ['Carousel design', 'Layout'], format: '1080 × 1350 px · 7 slides',
    arc: 'Opens with the question, builds to the answer, and closes on a clear call to action.' },
  { id: 'miche-small-studios', tab: 'Small Studios', count: 5, kind: 'Carousel · MICHE.studio',
    title: 'Why small studios<br><em>win big projects</em>',
    summary: 'A five-slide carousel that makes the case for working with a boutique studio.',
    tags: ['Carousel design', 'Typography'], format: '1080 × 1350 px · 5 slides',
    arc: 'A bold hook, three numbered points with photography, then a short closing line.' },
  { id: 'sth-miami', tab: 'Miami Events', count: 6, kind: 'Carousel · STH Miami',
    title: 'Good experiences<br><em>are better shared</em>',
    summary: 'An event-promotion carousel for a Miami week of Pilates and yacht experiences.',
    tags: ['Carousel design', 'Editing'], format: '1080 × 1350 px · 6 slides',
    arc: 'An offer first, then the events one by one, ending on a mood-setting closer.' },
  { id: 'bridging-funding', tab: 'Property Finance', count: 6, kind: 'Carousel · Bridging Funding',
    title: 'The property is great.<br><em>So why can’t you get the finance?</em>',
    summary: 'A six-slide carousel explaining why timing and structure matter in property finance.',
    tags: ['Carousel design', 'Infographic'], format: '1080 × 1350 px · 6 slides',
    arc: 'A question hook, a few key factors, and a closing slide that invites contact.' }
];

// Open on the Miami events carousel first
projects.sort((a, b) => (b.id === 'sth-miami') - (a.id === 'sth-miami'));
const $ = id => document.getElementById(id);
const slide = $('slide'), counter = $('counter'), thumbs = $('thumbs'), tabs = $('project-tabs');
let current = projects[0], index = 0;

const src = (p, i) => `${BASE}${p.id}/${String(i + 1).padStart(2, '0')}.jpg`;
const plain = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function fadeIn(el, offset, ms = 300, delay = 0) {
  if (reducedMotion.matches || !el.animate) return;
  el.animate([{ opacity: 0, transform: offset }, { opacity: 1, transform: 'none' }],
    { duration: ms, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
}

function showSlide(i, animated = true) {
  const dir = Math.sign(i - index); // 1 = forward, -1 = back, 0 = same slide
  index = (i + current.count) % current.count;
  slide.src = src(current, index);
  slide.alt = `${plain(current.title)}, slide ${index + 1} of ${current.count}`;
  counter.textContent = `Slide ${index + 1} of ${current.count}`;
  [...thumbs.children].forEach((b, n) => b.setAttribute('aria-pressed', String(n === index)));
  new Image().src = src(current, (index + 1) % current.count); // preload next
  const t = thumbs.children[index]; // keep the active thumbnail centered
  if (t) thumbs.scrollTo({ left: t.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  if (animated && dir) {
    fadeIn(slide, `translateX(${dir * 28}px)`);
    fadeIn(counter, 'translateY(6px)', 240);
  }
}

function showProject(p) {
  current = p;
  [...tabs.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === p.id)));
  $('p-kind').textContent = p.kind;
  $('p-title').innerHTML = p.title;
  $('p-summary').textContent = p.summary;
  $('p-tags').innerHTML = p.tags.map(t => `<span>${t}</span>`).join('');
  $('p-format').textContent = p.format;
  $('p-arc').textContent = p.arc;
  thumbs.innerHTML = '';
  for (let i = 0; i < p.count; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.innerHTML = `<img src="${src(p, i)}" alt="" width="54" height="68" loading="lazy">`;
    b.addEventListener('click', () => showSlide(i));
    thumbs.appendChild(b);
  }
  showSlide(0, false);
  document.querySelectorAll('.project-story > *').forEach((el, n) => fadeIn(el, 'translateY(10px)', 420, n * 60));
}

projects.forEach(p => {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.id = p.id;
  b.textContent = p.tab;
  b.addEventListener('click', () => showProject(p));
  tabs.appendChild(b);
});

$('prev').addEventListener('click', () => showSlide(index - 1));
$('next').addEventListener('click', () => showSlide(index + 1));
$('viewer').addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showSlide(index - 1);
  if (e.key === 'ArrowRight') showSlide(index + 1);
});
let startX = null; // swipe on touch screens
slide.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
slide.addEventListener('touchend', e => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 40) showSlide(index + (dx < 0 ? 1 : -1));
  startX = null;
});
showProject(projects[0]);

// ---- Scroll reveal: subtle fade-up for section text ----
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('reveal-on');
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.profile-copy > *, .section-intro, .about-grid > div > *, .contact-card > :not(.contact-flower)').forEach(el => {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min([...el.parentElement.children].indexOf(el), 5) * 70 + 'ms';
    revealer.observe(el);
  });
}

// ---- Interactive autumn leaves (hero + "Meet Ninotchca" section) ----
(() => {
  if (reducedMotion.matches) return;
  const profileEl = document.getElementById('profile');
  if (!profileEl) return;

  const IMAGES = Array.from({ length: 24 }, (_, i) => `assets/leaves/leaf${i + 1}.png`);
  const COLORS = ['#f7c8d8', '#f3a9c3', '#ee93b6', '#e67da6', '#fbd9e4', '#d96592'];
  const MAX = 50;
  const rand = (a, b) => a + Math.random() * (b - a);
  const isSmall = () => innerWidth < 700;

  // --- a pink maple leaf, drawn once per colour (cheap to reuse every frame)
  const HALF = [[50,2],[56,17],[61,13],[60,29],[74,21],[72,34],[80,33],[76,45],[95,43],[82,57],[90,66],[66,69],[58,74],[54,85],[50,89]];
  const OUTLINE = HALF.concat(HALF.slice(1, -1).reverse().map(([x, y]) => [100 - x, y]));
  const VEINS = [[50,87,50,12],[50,66,75,27],[50,66,25,27],[50,62,90,45],[50,62,10,45],[52,70,80,62],[48,70,20,62]];
  function mapleSprite(color, size = 128) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), s = size * .8 / 96;
    g.setTransform(s, 0, 0, s, size / 2 - 50 * s, size * .07 - 2 * s);
    g.beginPath(); OUTLINE.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
    g.fillStyle = color; g.fill();
    g.lineCap = 'round'; g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,255,255,.65)';           // veins
    VEINS.forEach(([x1, y1, x2, y2]) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); });
    g.strokeStyle = 'rgba(190,80,120,.9)'; g.lineWidth = 2.6;                                   // stem
    g.beginPath(); g.moveTo(50, 88); g.lineTo(50, 99); g.stroke();
    return c;
  }
    // your own leaf pictures: the white background is removed and they are tinted pink automatically
  const TINTS = []; 
  const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v;
  function loadLeaf(src, tint) {
    const c = document.createElement('canvas'); c.width = c.height = 0;   // stays empty until the picture has loaded
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 192 / Math.max(img.naturalWidth, img.naturalHeight));
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        let r = p[i], gr = p[i + 1], b = p[i + 2];
        const lo = Math.min(r, gr, b);
        if (p[i + 3] === 255 && lo > 170) {                                  // white background -> transparent, soft edges
          const al = lo > 240 ? 0 : (240 - lo) / 70;
          p[i + 3] = al * 255;
          if (al > 0) { r = clamp255((r - 255 * (1 - al)) / al); gr = clamp255((gr - 255 * (1 - al)) / al); b = clamp255((b - 255 * (1 - al)) / al); }
        }
        if (tint) {                                                          // dark parts -> deep rose, light parts -> pale pink
          const t = Math.max(0, Math.min(1, (.3 * r + .59 * gr + .11 * b - 40) / 160));
          r = tint[0][0] + (tint[1][0] - tint[0][0]) * t; gr = tint[0][1] + (tint[1][1] - tint[0][1]) * t; b = tint[0][2] + (tint[1][2] - tint[0][2]) * t;
        }
        p[i] = r; p[i + 1] = gr; p[i + 2] = b;
      }
      g.putImageData(d, 0, 0);
    };
    img.src = src;
    return c;
  }
  const sprites = IMAGES.length
    ? IMAGES.flatMap(src => (TINTS.length ? TINTS : [null]).map(t => loadLeaf(src, t)))
    : COLORS.map(c => mapleSprite(c));

  // --- full-screen canvas that never blocks clicks
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', pointerEvents: 'none', zIndex: '5', opacity: '0', transition: 'opacity .5s' });
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  function resize() {
    if (innerWidth === W && innerHeight <= H && H - innerHeight < 200) return; // ignore phone address-bar jiggle
    W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, isSmall() ? 1.5 : 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }
  resize();

  // --- leaves
  const leaves = [];
  function makeLeaf(burst, bx, by) {
    const L = {
      x: burst ? bx : rand(-20, W + 20), y: burst ? by : rand(-40, H),
      size: rand(isSmall() ? 22 : 26, isSmall() ? 36 : 48), sprite: sprites[(Math.random() * sprites.length) | 0],
      vy: rand(28, 62), sway: rand(14, 38), freq: rand(.6, 1.4), ph: rand(0, 6.28),
      rot: rand(0, 6.28), spin: rand(-1.1, 1.1), flip: rand(0, 6.28), flipSpeed: rand(.8, 2.2),
      ix: 0, iy: 0, a: rand(.7, .92), temp: !!burst
    };
    if (burst) { const ang = rand(-Math.PI * .95, -Math.PI * .05), sp = rand(170, 380); L.ix = Math.cos(ang) * sp; L.iy = Math.sin(ang) * sp; }
    return L;
  }
  for (let i = 0, n = isSmall() ? 12 : 24; i < n; i++) leaves.push(makeLeaf());

  // --- pointer (mouse or finger) pushes leaves away
  const P = { x: -999, y: -999, vx: 0, vy: 0, on: false, t: 0 };
  addEventListener('pointermove', e => {
    const now = performance.now(), dt = Math.max(now - P.t, 8);
    P.vx = P.vx * .6 + (e.clientX - P.x) / dt * 1000 * .4; P.vy = P.vy * .6 + (e.clientY - P.y) / dt * 1000 * .4;
    P.x = e.clientX; P.y = e.clientY; P.t = now; P.on = true;
  }, { passive: true });
  addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') P.on = false; }, { passive: true });
  document.addEventListener('mouseleave', () => { P.on = false; });

  // --- click or tap on empty space bursts out a few leaves
  document.addEventListener('click', e => {
    if (!running || e.target.closest('a,button,summary,input,textarea,select,label')) return;
    for (let i = 0; i < 8 && leaves.length < MAX; i++) leaves.push(makeLeaf(true, e.clientX, e.clientY));
  });

  // --- animation loop (stops by itself once the section has scrolled away)
  let running = false, last = 0, t = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000 || .016, .05); last = now; t += dt;
    const reach = isSmall() ? 90 : 130, decay = Math.exp(-dt * 1.4);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = leaves.length - 1; i >= 0; i--) {
      const L = leaves[i];
      if (P.on) {
        const dx = L.x - P.x, dy = L.y - P.y, d2 = dx * dx + dy * dy;
        if (d2 < reach * reach) {
          const d = Math.sqrt(d2) || 1, f = 1 - d / reach;
          L.ix += dx / d * f * f * 1600 * dt + P.vx * f * dt * 3;
          L.iy += dy / d * f * f * 1600 * dt + P.vy * f * dt * 3;
          L.spin = Math.max(-7, Math.min(7, L.spin + dx / d * f * dt * 14));
        }
      }
      L.x += (Math.cos(t * L.freq + L.ph) * L.sway + L.ix) * dt;
      L.y += (L.vy + L.iy) * dt;
      L.ix *= decay; L.iy *= decay; L.spin += (0 - L.spin) * dt * .15;
      L.rot += (L.spin + L.ix * .004) * dt; L.flip += L.flipSpeed * dt;
      if (L.y > H + 60 || L.x < -200 || L.x > W + 200) {
        if (L.temp) { leaves.splice(i, 1); continue; }
        L.y = -50; L.x = rand(0, W); L.ix = L.iy = 0;
      }
      if (!L.sprite.width) continue;
      const k = Math.cos(L.flip), fx = (k < 0 ? -1 : 1) * (.22 + .78 * Math.abs(k));
      const cs = Math.cos(L.rot), sn = Math.sin(L.rot), w = L.size, h = L.size * L.sprite.height / L.sprite.width;
      ctx.setTransform(dpr * cs * fx, dpr * sn * fx, -dpr * sn, dpr * cs, dpr * L.x, dpr * L.y);
      ctx.globalAlpha = L.a; ctx.drawImage(L.sprite, -w / 2, -h / 2, w, h);
    }
    const o = Math.max(0, Math.min(1, profileEl.getBoundingClientRect().bottom / H)); // fades out as "Meet Ninotchca" scrolls away
    canvas.style.opacity = o;
    if (o <= .01) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  addEventListener('scroll', () => { if (!running && profileEl.getBoundingClientRect().bottom > 10) start(); }, { passive: true });
  addEventListener('resize', resize);
  start();
})();