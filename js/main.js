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
  { id: 'sth-miami', tab: 'Miami Events', count: 5, kind: 'Carousel · STH Miami',
    title: 'Good experiences<br><em>are better shared</em>',
    summary: 'An event-promotion carousel for a Miami week of Pilates and yacht experiences.',
    tags: ['Carousel design', 'Editing'], format: '1080 × 1350 px · 5 slides',
    arc: 'An offer first, then the events one by one, ending on a mood-setting closer.' },
  { id: 'bridging-funding', tab: 'Property Finance', count: 5, kind: 'Carousel · Bridging Funding',
    title: 'The property is great.<br><em>So why can’t you get the finance?</em>',
    summary: 'A five-slide carousel explaining why timing and structure matter in property finance.',
    tags: ['Carousel design', 'Infographic'], format: '1080 × 1350 px · 5 slides',
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