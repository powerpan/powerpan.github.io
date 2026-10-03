const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function target(extra = {}) {
  const listeners = new Map();
  const classes = new Set();
  return {
    dataset: {}, style: {}, attributes: {}, textContent: '',
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(fn);
    },
    emit(name, event = {}) { for (const fn of listeners.get(name) || []) fn(event); },
    classList: {
      add: name => classes.add(name), remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name); else classes.delete(name);
        return force;
      },
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    closest: () => null, querySelectorAll: () => [], querySelector: () => null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    ...extra,
  };
}

function runtime({ saved = 'on', reduced = false, fine = true, blocked = false, home = false, decorated = false } = {}) {
  const frames = new Map(), timers = new Map(), observers = [], media = new Map();
  let nextId = 0, now = 0, writes = 0, controlsReady = false;
  const pageButton = target();
  pageButton.closest = selector => selector === '[data-page-motion]' ? pageButton : null;
  const nodes = Object.fromEntries(['cursor', 'cursorDot', 'nav', 'detailScrollProgress', 'backToTop',
    'navHamburger', 'mobileNav', 'mobileNavClose'].map(id => [id, target()]));
  if (home) nodes.motionToggle = target();
  const counter = target({ dataset: { count: '250' } });
  const typewriter = target({ dataset: { typewriter: 'Example text' } });
  const magnet = target(), parallax = target({ dataset: { parallax: '0.5' } }), reveal = target();
  const section = target({ id: 'content', querySelector: () => ({ textContent: 'Content' }),
    scrollIntoView(options) { this.lastScroll = options; } });
  nodes.content = section;
  const toc = target({ dataset: { target: 'content', label: 'Content' } });
  const line = { prepend(node) { this.number = node.textContent; } };
  const selectors = {
    'section': [], '[data-count]': decorated ? [counter] : [],
    '[data-typewriter]': decorated ? [typewriter] : [],
    '.magnetic': [magnet], '[data-parallax]': [parallax], '.reveal': [reveal],
    '.detail-toc-item': [toc], '.detail-section[id]': [section],
    '.detail-code-body': [{ querySelectorAll: () => [line] }],
  };
  const document = target({
    hidden: false, body: target(), head: { appendChild() {} },
    documentElement: target({ dataset: {}, lang: 'en', scrollHeight: 2000 }),
    getElementById: id => nodes[id] || null,
    querySelectorAll: selector => selector === '[data-page-motion]'
      ? (controlsReady && !home ? [pageButton] : []) : selectors[selector] || [],
    createElement: () => target(),
  });
  const context = target({
    document, innerHeight: 800, pageYOffset: 0, performance: { now: () => now },
    matchMedia(query) {
      if (!media.has(query)) media.set(query, target({ matches: query.includes('reduced-motion') ? reduced : fine }));
      return media.get(query);
    },
    localStorage: {
      getItem() { if (blocked) throw Error('blocked'); return saved; },
      setItem(_, value) { if (blocked) throw Error('blocked'); saved = value; writes++; },
    },
    requestAnimationFrame(fn) { frames.set(++nextId, fn); return nextId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(fn) { timers.set(++nextId, fn); return nextId; },
    clearTimeout(id) { timers.delete(id); },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.elements = new Set(); observers.push(this); }
      observe(el) { this.elements.add(el); }
      unobserve(el) { this.elements.delete(el); }
    },
    scrollTo(options) { context.lastScroll = options; },
  });
  context.window = context;
  vm.createContext(context);
  for (const file of ['page-transitions', 'motion', 'cursor', 'detail']) vm.runInContext(read(`js/${file}.js`), context);
  controlsReady = true;
  document.emit('DOMContentLoaded');
  return {
    context, document, nodes, pageButton, frames, timers, counter, typewriter, magnet, parallax, reveal, toc, section, line,
    saved: () => saved, writes: () => writes,
    click() {
      if (home) nodes.motionToggle.emit('click');
      else document.emit('click', { target: pageButton });
    },
    move(x = 100, pointerType = 'mouse', el = target()) {
      document.emit('pointermove', { clientX: x, clientY: 100, pointerType, target: el });
    },
    step() {
      now += 16;
      const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(now));
    },
    intersect(el) {
      observers.filter(observer => observer.elements.has(el)).forEach(observer => observer.callback([{ target: el, isIntersecting: true }]));
    },
    preference(value) {
      for (const [query, item] of media) if (query.includes('reduced-motion')) { item.matches = value; item.emit('change'); }
    },
    pointer(value) {
      for (const [query, item] of media) if (!query.includes('reduced-motion')) { item.matches = value; item.emit('change'); }
    },
  };
}

test('detail cursor is idle by default, coalesces moves and stops when settled', () => {
  const r = runtime();
  assert.equal(r.frames.size, 0);
  r.move(); r.step();
  assert.equal(r.frames.size, 0);
  r.move(700); r.move(800);
  assert.equal(r.frames.size, 1);
  for (let i = 0; i < 120; i++) r.step();
  assert.equal(r.frames.size, 0);
  assert(r.document.body.classList.contains('custom-cursor-active'));
  assert.match(r.nodes.cursor.style.transform, /translate3d/);
});

test('saved off, reduced motion and touch never start the detail cursor', () => {
  for (const options of [{ saved: 'off' }, { reduced: true }, { fine: false }]) {
    const r = runtime(options); r.move();
    assert.equal(r.frames.size, 0);
    assert(!r.document.body.classList.contains('custom-cursor-active'));
  }
  const r = runtime(); r.move(100, 'touch');
  assert.equal(r.frames.size, 0);
});

test('one shared switch cancels motion immediately and persists once on either surface', () => {
  for (const home of [false, true]) for (const blocked of [false, true]) {
    const r = runtime({ home, blocked });
    r.move(); r.step(); r.move(700);
    assert.equal(r.frames.size, 1);
    r.click();
    assert.equal(r.context.SiteMotion.enabled, false);
    assert.equal(r.document.documentElement.dataset.motion, 'off');
    assert.equal((home ? r.nodes.motionToggle : r.pageButton).attributes['aria-pressed'], 'false');
    assert.equal(r.frames.size, 0);
    assert.equal(r.writes(), blocked ? 0 : 1);
    assert(!r.document.body.classList.contains('custom-cursor-active'));
    r.move(); assert.equal(r.frames.size, 0);
    r.click();
    assert.equal(r.context.SiteMotion.enabled, true);
    assert.equal(r.frames.size, 0); // Restoring motion does not resurrect an idle cursor loop.
    r.move(); assert.equal(r.frames.size, 1);
  }
});

test('visibility, blur, pagehide, keyboard, inputs and pointer capability cancel the cursor', () => {
  const hideActions = [
    r => r.document.documentElement.emit('pointerleave'),
    r => r.document.emit('keydown', { key: 'Tab' }),
    r => { r.document.hidden = true; r.document.emit('visibilitychange'); r.move(); },
    r => r.context.emit('blur'), r => r.context.emit('pagehide'), r => r.pointer(false),
    r => r.move(500, 'mouse', target({ closest: selector => selector.startsWith('input') ? {} : null })),
  ];
  for (const hide of hideActions) {
    const r = runtime(); r.move(); r.step(); r.move(700); hide(r);
    assert.equal(r.frames.size, 0);
    assert(!r.document.body.classList.contains('custom-cursor-active'));
  }
});

test('system changes, cross-tab preference and restored history update runtime and control together', () => {
  const r = runtime(); r.move();
  r.preference(true); r.click();
  assert.equal(r.context.SiteMotion.enabled, false);
  assert.equal(r.pageButton.disabled, true);
  assert.equal(r.frames.size, 0);
  r.preference(false);
  assert.equal(r.context.SiteMotion.enabled, true);
  r.context.localStorage.setItem('site-motion', 'off');
  r.context.emit('storage', { key: 'site-motion', newValue: 'off' });
  assert.equal(r.context.SiteMotion.enabled, false);
  assert.equal(r.pageButton.attributes['aria-pressed'], 'false');
  r.context.localStorage.setItem('site-motion', 'on');
  r.context.emit('pageshow', { persisted: true });
  assert.equal(r.context.SiteMotion.enabled, true);
  assert.equal(r.pageButton.attributes['aria-pressed'], 'true');
  r.context.emit('storage', { key: null, newValue: null });
  assert.equal(r.context.SiteMotion.enabled, true);
});

test('homepage shared clock still pauses, resumes and restores visible scenes without duplicate loops', () => {
  const r = runtime({ home: true });
  const scene = target();
  let renders = 0;
  r.context.SiteMotion.animate(scene, () => renders++);
  assert.equal(r.frames.size, 0);
  r.intersect(scene); r.step();
  assert.equal(r.frames.size, 1);
  assert.equal(renders, 2);
  r.click();
  assert.equal(r.frames.size, 0);
  assert.equal(renders, 3); // Keep a static scene when paused.
  r.click(); r.intersect(scene);
  assert.equal(r.frames.size, 1);
  r.document.hidden = true; r.document.emit('visibilitychange');
  assert.equal(r.frames.size, 0);
  r.document.hidden = false; r.document.emit('visibilitychange');
  assert.equal(r.frames.size, 1);
  r.context.emit('pagehide');
  assert.equal(r.frames.size, 0);
  r.context.emit('pageshow', { persisted: true });
  assert.equal(r.frames.size, 1);
});

test('pausing finishes counters and typewriters and clears decorative transforms', () => {
  for (const hidden of [false, true]) {
    const r = runtime({ decorated: true });
    r.intersect(r.counter); r.step();
    assert(r.frames.size > 0); assert(r.timers.size > 0);
    r.magnet.emit('mousemove', { clientX: 80, clientY: 80 });
    r.context.pageYOffset = 500; r.context.emit('scroll'); r.step();
    assert.match(r.magnet.style.transform, /translate/);
    assert.match(r.parallax.style.transform, /translateY/);
    if (hidden) { r.document.hidden = true; r.document.emit('visibilitychange'); } else r.click();
    assert.equal(r.frames.size, 0); assert.equal(r.timers.size, 0);
    assert.equal(r.counter.textContent, '250+');
    assert.equal(r.typewriter.textContent, 'Example text');
    assert.equal(r.magnet.style.transform, ''); assert.equal(r.parallax.style.transform, '');
  }
  const off = runtime({ saved: 'off', decorated: true });
  off.intersect(off.counter);
  assert.equal(off.frames.size, 0); assert.equal(off.timers.size, 0);
  assert.equal(off.counter.textContent, '250+');
  assert.equal(off.typewriter.textContent, 'Example text');
});

test('reduced motion keeps code, reveal, progress, TOC, back-to-top and mobile navigation usable', () => {
  for (const saved of ['on', 'off']) {
    const r = runtime({ saved });
    assert.equal(r.line.number, '01');
    r.intersect(r.reveal); assert(r.reveal.classList.contains('visible'));
    r.context.pageYOffset = 600; r.context.emit('scroll'); r.step();
    assert.equal(r.nodes.detailScrollProgress.style.width, '50%');
    assert(r.nodes.nav.classList.contains('scrolled'));
    assert(r.toc.classList.contains('active'));
    assert(r.nodes.backToTop.classList.contains('visible'));
    r.toc.emit('click'); r.nodes.backToTop.emit('click');
    assert.equal(r.section.lastScroll.behavior, saved === 'on' ? 'smooth' : 'instant');
    assert.equal(r.context.lastScroll.behavior, saved === 'on' ? 'smooth' : 'instant');
    assert.equal(r.context.lastScroll.top, 0);
    r.nodes.navHamburger.emit('click');
    assert.equal(r.document.body.style.overflow, 'hidden');
    assert(r.nodes.mobileNav.classList.contains('open'));
    r.nodes.mobileNavClose.emit('click');
    assert.equal(r.document.body.style.overflow, '');
    assert(!r.nodes.mobileNav.classList.contains('open'));
  }
});

test('every detail template loads one ordered shared runtime and cursor, including future editor output', () => {
  const files = ['blog', 'projects'].flatMap(dir => fs.readdirSync(path.join(root, dir), { recursive: true })
    .filter(file => file.endsWith('.html')).map(file => `${dir}/${file}`));
  assert(files.length > 50);
  for (const file of files) {
    const $ = load(read(file));
    const scripts = $('script[src]').map((_, el) => path.basename($(el).attr('src').split('?')[0])).get();
    if (!scripts.includes('detail.js')) continue;
    for (const name of ['motion.js', 'cursor.js', 'detail.js']) assert.equal(scripts.filter(src => src === name).length, 1, `${file}: ${name}`);
    assert(scripts.indexOf('motion.js') < scripts.indexOf('cursor.js'), file);
    assert(scripts.indexOf('cursor.js') < scripts.indexOf('detail.js'), file);
  }
  const editor = read('admin/editor.html');
  assert(editor.indexOf('../js/motion.js') < editor.indexOf('../js/cursor.js'));
  assert(editor.indexOf('../js/cursor.js') < editor.indexOf('../js/detail.js'));
  assert(!read('js/detail.js').includes('animateCursor'));
});
