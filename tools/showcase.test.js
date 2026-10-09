const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const { chargeAt, createArrivalGate, milestoneParticles } = require('../js/showcase');
const { sampleMotion } = require('../js/hero-core');
const { readTranslations, translateDocument } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('timeline charge clamps before, during and after the visible reading range', () => {
  assert.equal(chargeAt(900, 1000, 800), 0);
  assert.equal(chargeAt(144, 1000, 800), 0.4);
  assert.equal(chargeAt(-1000, 1000, 800), 1);
  assert.equal(chargeAt(0, 0, 800), 0);
  assert.equal(chargeAt(0, 1000, 0), 0);
});

test('milestone arrival fires once, resists threshold jitter and rearms after retreat', () => {
  const gate = createArrivalGate();
  assert.equal(gate(900, 800, true), 'reset');
  assert.equal(gate(540, 800, true), 'fire');
  for (const y of [520, 550, 530, 580, 540]) assert.equal(gate(y, 800, true), 'idle');
  assert.equal(gate(700, 800, true), 'reset');
  assert.equal(gate(540, 800, true), 'fire');
});

test('milestone does not burst on motion resumption, hidden tabs or a jump past the section', () => {
  const gate = createArrivalGate();
  assert.equal(gate(400, 800, true, true), 'idle');
  assert.equal(gate(400, 800, true), 'fire');
  assert.equal(gate(400, 800, false), 'reset');
  assert.equal(gate(400, 800, true), 'idle');
  assert.equal(gate(700, 800, true), 'reset');
  assert.equal(gate(-200, 800, true), 'idle');
  assert.equal(gate(400, 800, true), 'idle');
});

test('milestone sparks are deterministic, bounded and finish with the arrival sequence', () => {
  const particles = milestoneParticles();
  assert.equal(particles.length, 18);
  assert.deepEqual(particles, milestoneParticles());
  for (const particle of particles) {
    assert(Object.values(particle).every(Number.isFinite));
    assert(Math.hypot(particle.x, particle.y) <= 135);
    assert(Math.hypot(particle.midX, particle.midY) < 65);
    assert(particle.delay >= 0 && particle.delay + 2.3 < 2.8);
  }
});

test('showcase features six screenshot-backed projects with accurate image labels', () => {
  const $ = load(read('index.html'));
  const cards = $('.project-card');
  assert.equal(cards.length, 6);
  const featured = ['civilization-z', 'trading-simulator', 'greenbird-badminton',
    'moyu-night-library', 'algorithm-museum', 'local-rag'];
  assert.deepEqual(cards.map((_, el) => $(el).attr('href')).get(),
    featured.map(slug => `projects/${slug}.html`));
  const screenshotProjects = fs.readdirSync(path.join(root, 'projects'))
    .filter(file => file.endsWith('.html') && load(read(`projects/${file}`))('img[src*="assets/projects/"]').length)
    .map(file => file.replace(/\.html$/, '')).sort();
  assert(featured.every(slug => screenshotProjects.includes(slug)));
  cards.each((_, el) => {
    assert(fs.existsSync(path.join(root, $(el).attr('href'))));
    assert($(el).find('.project-title').text().length > 0);
    assert($(el).find('.project-desc').text().length > 0);
  });
  assert.equal(cards.first().find('.project-visual-note').attr('data-i18n'), 'civ_screenshot_note');
  assert.equal(cards.find('.project-art, .project-scan').length, 0);
  const images = $('.project-screenshot');
  assert.equal(images.length, 6);
  images.each((index, el) => {
    const img = $(el);
    assert(fs.existsSync(path.join(root, img.attr('src'))));
    const detail = load(read(`projects/${featured[index]}.html`));
    assert(detail('img').toArray().some(image =>
      detail(image).attr('src') === `../${img.attr('src')}`));
    assert(Number(img.attr('width')) > 0 && Number(img.attr('height')) > 0);
    assert.equal(img.attr('loading'), 'lazy');
    assert.equal(img.attr('decoding'), 'async');
    assert(img.attr('alt').length > 0);
    assert.equal(img.closest('[aria-hidden="true"]').length, 0);
    assert.equal(img.closest('.project-visual').find('.project-art, .project-scan').length, 0);
  });
  assert.equal($('.timeline-current').length, 1);
  assert.equal($('.timeline-milestone').length, 1);
  assert.equal($('.timeline-milestone').attr('aria-hidden'), 'true');
  assert($('.timeline-item').last().hasClass('timeline-current'));
  assert.deepEqual($('.timeline-year').map((_, el) => $(el).attr('data-i18n')).get(),
    ['tl5_year', 'tl4_year', 'tl2_year', 'tl3_year', 'tl1_year', 'tl_hkust_year']);
  $('.timeline-item').each((index, el) => {
    assert.equal($(el).find(index % 2 ? '.timeline-right .timeline-role' : '.timeline-left .timeline-role').length, 1);
  });
  const translations = readTranslations($, 'index.html', read);
  for (const lang of ['zh', 'en']) {
    const page = load(read('index.html'));
    translateDocument(page, translations, lang, 'index.html');
    assert(page('.project-visual-note').toArray().every(el =>
      page(el).text() === translations[lang][page(el).attr('data-i18n')]));
    page('.project-card [data-i18n], .project-card [data-i18n-alt]').each((_, el) => {
      const node = page(el), textKey = node.attr('data-i18n'), altKey = node.attr('data-i18n-alt');
      const value = textKey ? node.text() : node.attr('alt');
      assert.equal(value, translations[lang][textKey || altKey]);
      if (lang === 'en') assert(!/[\u3400-\u9fff]/.test(value));
    });
    assert.equal(page('.timeline-current .timeline-role').text(), translations[lang].tl_hkust_role);
  }
  const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get();
  assert(scripts.indexOf('js/motion.js') < scripts.indexOf('js/hero-core.js'));
  assert(scripts.indexOf('js/hero-core.js') < scripts.indexOf('js/particles.js'));
  assert(fs.statSync(path.join(root, 'assets/vfx/project-atlas.jpg')).size < 600 * 1024);
});

test('screenshot covers remain uncropped and unfiltered with a separate label area', () => {
  const css = read('css/showcase.css');
  assert.match(css, /\.project-screenshot\s*\{[^}]*object-fit:\s*contain;/);
  assert.match(css, /\.project-visual-screenshot\s*\{[^}]*padding:\s*58px 24px 22px;/);
  assert.match(css, /\.project-visual-screenshot::before,\s*\.home-page \.project-card-screenshot::after\s*\{\s*display:\s*none;/);
});

function heroRuntime({ available = true, compile = true, link = true, active = true, fine = false } = {}) {
  const renders = [], subscribers = [], observers = [], listeners = new Map(), heroListeners = new Map();
  const calls = { gpu: 0, cpu: 0, cleanup: 0, uniforms: {}, colors: [] };
  const windowEvents = new Map();
  const noop = () => {};
  const context2d = new Proxy({
    clearRect: () => calls.cpu++,
    createLinearGradient: () => ({ addColorStop: (_, color) => calls.colors.push(color) }),
  }, { get: (target, name) => target[name] || noop });
  const gl = new Proxy({
    getShaderParameter: () => compile,
    getProgramParameter: () => link,
    createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}),
    deleteShader: () => calls.cleanup++,
    getAttribLocation: () => 0, getUniformLocation: (_, name) => name,
    uniform1f: (name, value) => { calls.uniforms[name] = value; },
    uniform2f: (name, ...values) => { calls.uniforms[name] = values; },
    uniform3f: (name, ...values) => { calls.uniforms[name] = values; },
    getExtension: () => ({ loseContext: noop }),
    drawArrays: () => calls.gpu++,
  }, { get: (target, name) => name in target ? target[name] : noop });
  let current;
  const fallback = {
    dataset: {}, getContext: kind => kind === '2d' ? context2d : null,
    replaceWith: node => { current = node; },
  };
  current = fallback;
  const canvas = {
    dataset: {}, getContext: () => available ? gl : null,
    setAttribute: noop, replaceWith: node => { current = node; },
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const hero = {
    dataset: {}, clientWidth: 1400, clientHeight: 900,
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 1400, height: 900 }),
    addEventListener: (name, callback) => heroListeners.set(name, callback),
  };
  const context = {
    addEventListener: (name, callback) => windowEvents.set(name, callback),
    document: {
      getElementById: id => id === 'hero' ? hero : current,
      createElement: () => canvas,
    },
    devicePixelRatio: 2,
    matchMedia: () => ({ matches: fine, addEventListener: noop }),
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
    SiteMotion: {
      enabled: active,
      subscribe: listener => { subscribers.push(listener); listener(active); },
      animate: (_, render) => { renders.push(render); render(0, 0); },
    },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('js/hero-core.js'), context);
  vm.runInContext(read('js/particles.js'), context);
  return { context, canvas, fallback, hero, renders, listeners, heroListeners, windowEvents, subscribers, observers, calls, current: () => current };
}

test('both hero renderers redraw a changed palette even with motion disabled', () => {
  for (const available of [true, false]) {
    const r = heroRuntime({ available, active: false });
    r.context.SiteTheme = { amount: 1, theme: 'light' };
    const before = available ? r.calls.gpu : r.calls.cpu;
    r.windowEvents.get('site-theme-change')();
    assert((available ? r.calls.gpu : r.calls.cpu) > before);
    if (available) assert.equal(r.calls.uniforms.themeMix, 1);
    else assert(r.calls.colors.some(color => color.includes('0, 100, 64')));
    assert.equal(r.renders.length, 1, 'A palette change never starts another motion loop');
  }
});

test('natural motion visibly changes pose within two seconds and pointer motion stays bounded', () => {
  const first = sampleMotion(0), next = sampleMotion(2);
  assert(Math.hypot(next.spin - first.spin, next.tiltX - first.tiltX, next.tiltY - first.tiltY) > 0.22);
  const left = sampleMotion(0, -1, 0), right = sampleMotion(0, 1, 0);
  assert(Math.abs(right.tiltY - left.tiltY) > 1.5);
  assert(Math.abs(right.driftX - left.driftX) > 0.12);
  for (let time = 0; time <= 30; time++) for (const edge of [-1, 1]) {
    const pose = sampleMotion(time, edge, edge);
    assert(Math.abs(pose.tiltX) < 1.2 && Math.abs(pose.tiltY) < 1.2, 'Ring never rotates edge-on');
  }
});

test('pointer response is damped, returns on leave, ignores touch and resets when motion is off', () => {
  const runtime = heroRuntime({ fine: true });
  const move = runtime.heroListeners.get('pointermove');
  move({ clientX: 1400, clientY: 450, pointerType: 'mouse' });
  for (let frame = 1; frame <= 10; frame++) runtime.renders[0](frame * 0.04, 0.04);
  assert(runtime.calls.uniforms.drift[0] > 0.05);
  runtime.heroListeners.get('pointerleave')();
  runtime.renders[0](0.44, 0.04);
  assert(runtime.calls.uniforms.drift[0] > 0.03, 'Release should ease back rather than snap');
  for (let frame = 12; frame <= 35; frame++) runtime.renders[0](frame * 0.04, 0.04);
  assert(Math.abs(runtime.calls.uniforms.drift[0] - sampleMotion(1.4).driftX) < 0.002);
  move({ clientX: 1400, clientY: 450, pointerType: 'touch' });
  runtime.renders[0](1.44, 0.04);
  assert(Math.abs(runtime.calls.uniforms.drift[0] - sampleMotion(1.44).driftX) < 0.002);
  runtime.context.SiteMotion.enabled = false;
  runtime.subscribers.forEach(listener => listener(false));
  move({ clientX: 1400, clientY: 450, pointerType: 'mouse' });
  runtime.renders[0](1.44, 0);
  assert.equal(runtime.calls.uniforms.drift[0], sampleMotion(1.44).driftX);
});

test('WebGL success has one renderer, a capped target and a 30fps paint gate', () => {
  const runtime = heroRuntime();
  assert.equal(runtime.current(), runtime.canvas);
  assert.equal(runtime.canvas.dataset.renderer, 'webgl');
  assert.equal(runtime.renders.length, 1);
  assert.equal(runtime.calls.cpu, 0);
  assert(runtime.canvas.width * runtime.canvas.height < 722000);
  const before = runtime.calls.gpu;
  runtime.renders[0](0.016, 0.016);
  assert.equal(runtime.calls.gpu, before);
  runtime.renders[0](0.04, 0.024);
  assert.equal(runtime.calls.gpu, before + 1);
});

test('unavailable WebGL, compile failures and link failures retain the 2D fallback', () => {
  for (const options of [{ available: false }, { compile: false }, { link: false }]) {
    const runtime = heroRuntime(options);
    assert.equal(runtime.current(), runtime.fallback);
    assert.equal(runtime.fallback.dataset.renderer, 'canvas2d');
    assert.equal(runtime.renders.length, 1);
    assert(runtime.calls.cpu > 0);
    if (options.available !== false) assert(runtime.calls.cleanup > 0);
    runtime.context.initHeroFibers();
    assert.equal(runtime.renders.length, 1, 'Fallback initialization is idempotent');
  }
});

test('lost GPU context restores the original canvas and stops GPU drawing', () => {
  const runtime = heroRuntime();
  runtime.listeners.get('webglcontextlost')();
  assert.equal(runtime.current(), runtime.fallback);
  assert.equal(runtime.hero.dataset.core, 'fallback');
  assert.equal(runtime.fallback.dataset.renderer, 'canvas2d');
  assert(runtime.observers[0].disconnected);
  const before = runtime.calls.gpu;
  runtime.renders[0](1, 0.04);
  assert.equal(runtime.calls.gpu, before);
  assert(runtime.calls.cpu > 0);
});

test('sustained slow frames lower decorative resolution without removing the hero', () => {
  const runtime = heroRuntime();
  const before = runtime.canvas.width;
  for (let frame = 1; frame <= 30; frame++) runtime.renders[0](frame * 0.05, 0.05);
  assert(runtime.canvas.width < before);
  assert(runtime.canvas.width >= before * 0.64);
  assert.equal(runtime.current(), runtime.canvas);
});

test('disabled motion still draws a static hero with no private animation loop', () => {
  for (const available of [true, false]) {
    const runtime = heroRuntime({ available, active: false });
    assert(runtime.calls.gpu + runtime.calls.cpu > 0);
    assert.equal(runtime.renders.length, 1);
  }
});

test('timeline respects visibility and motion settings without a continuous animation loop', () => {
  let observer, subscriber, frame = 0, top = 700;
  const events = {}, styles = {}, classes = [new Set(), new Set()];
  const items = classes.map((charged, index) => ({
    offsetTop: index * 1000,
    classList: {
      contains: name => name === 'timeline-current' ? index === 1 : charged.has(name),
      toggle: (name, on) => on ? charged.add(name) : charged.delete(name),
    },
    querySelector: selector => selector === '.timeline-center' ? { offsetTop: 8, offsetHeight: 12 } : null,
  }));
  const timeline = {
    querySelectorAll: () => items,
    getBoundingClientRect: () => ({ top, height: 1300 }),
    style: { setProperty: (name, value) => { styles[name] = value; } },
  };
  const context = {
    innerHeight: 800,
    document: { hidden: false, querySelector: () => timeline, addEventListener() {} },
    SiteMotion: { enabled: true, subscribe: listener => { subscriber = listener; listener(); } },
    IntersectionObserver: class { constructor(callback) { observer = callback; } observe() {} },
    ResizeObserver: class { observe() {} },
    requestAnimationFrame: () => ++frame, cancelAnimationFrame() {},
    addEventListener: (name, callback) => { events[name] = callback; },
  };
  context.window = context;
  vm.runInNewContext(read('js/showcase.js'), context);
  assert.equal(styles['--timeline-charge'], '0.000%');
  assert.equal(styles['--timeline-start'], '14px');
  assert.equal(styles['--timeline-span'], '1000px', 'Axis stops at last node, not the bottom of its description');
  events.scroll();
  assert.equal(frame, 0, 'Offscreen timeline schedules no work');
  top = 130;
  observer([{ isIntersecting: true }]);
  assert.equal(styles['--timeline-charge'], '40.000%');
  assert.equal(styles['--timeline-fill'], '400px');
  assert(classes[0].has('is-charged'));
  assert(!classes[1].has('is-charged'), 'Present node lights only when reached');
  top = -500;
  observer([{ isIntersecting: true }]);
  assert.equal(styles['--timeline-fill'], '1000px');
  assert(classes[1].has('is-charged'));
  assert(classes[1].has('has-arrived'));
  context.document.hidden = true;
  events.scroll();
  assert.equal(frame, 0, 'Background tab schedules no work');
  context.SiteMotion.enabled = false;
  subscriber();
  assert.equal(styles['--timeline-charge'], '100.000%');
  assert(classes.every(item => item.has('is-charged')));
  assert(!classes[1].has('has-arrived'), 'Motion off clears the arrival animation');
  context.document.hidden = false;
  events.scroll();
  assert.equal(frame, 0, 'Motion-off mode schedules no work');
  context.SiteMotion.enabled = true;
  subscriber();
  events.scroll();
  assert.equal(frame, 1);
  events.scroll();
  assert.equal(frame, 1, 'Scroll events coalesce into a single frame');
});
