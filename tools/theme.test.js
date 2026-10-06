const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { load } = require('cheerio');
const geometry = require('../js/theme-ribbon');
const { addThemeRuntime } = require('./theme_controls');

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function runtime({ enabled = true, reduced = false, supported = true, clip = true,
  blocked = false, saved = 'dark', language = 'zh-CN', delayed = false } = {}) {
  const events = new Map(), frames = new Map(), storage = new Map([['site-theme', saved]]);
  const writes = [], notifications = [], paints = [], animations = [], transitions = [];
  const button = { attrs: {}, hidden: true, disabled: false,
    setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; },
    addEventListener() {},
  };
  const ctx = new Proxy({ createLinearGradient: () => ({ addColorStop() {} }) },
    { get: (target, name) => target[name] || ((...args) => paints.push([name, ...args])) });
  const canvas = { setAttribute() {}, getContext: () => ctx };
  const status = { setAttribute() {} };
  const root = { lang: language, dataset: {}, animate(keyframes, options) {
    const done = deferred();
    const animation = { finished: done.promise, cancel() { done.reject(Error('cancelled')); } };
    animations.push({ keyframes, options, done });
    return animation;
  } };
  let subscriber, mutation, frame = 0;
  const doc = { documentElement: root, hidden: false, body: { appendChild() {} },
    getElementById: id => id === 'themeToggle' ? button : null,
    createElement: tag => tag === 'canvas' ? canvas : status,
    addEventListener: (name, callback) => events.set(name, callback),
  };
  if (supported) doc.startViewTransition = update => {
    const ready = deferred(), done = deferred();
    const t = { ready, done, update, skips: 0 };
    transitions.push(t);
    if (!delayed) update();
    return { ready: ready.promise, finished: done.promise, skipTransition() { t.skips++; done.resolve(); } };
  };
  const window = { ThemeRibbon: geometry, addEventListener: (name, callback) => events.set(name, callback),
    dispatchEvent: event => notifications.push(event.type),
    SiteMotion: { enabled, subscribe(callback) { subscriber = callback; callback(enabled); } },
  };
  const env = { window, document: doc, ThemeRibbon: geometry, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 2,
    CSS: { supports: () => clip }, Event: class { constructor(type) { this.type = type; } },
    performance: { now: () => 0 },
    MutationObserver: class { constructor(callback) { mutation = callback; } observe() {} },
    matchMedia: () => ({ matches: reduced, addEventListener: (name, callback) => events.set('media:' + name, callback) }),
    localStorage: { getItem: name => { if (blocked) throw Error('blocked'); return storage.get(name); },
      setItem: (name, value) => { if (blocked) throw Error('blocked'); writes.push([name, value]); storage.set(name, value); } },
    requestAnimationFrame(callback) { frames.set(++frame, callback); return frame; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/theme.js'), 'utf8'), env);
  return { env, root, button, canvas, status, events, frames, animations, transitions, storage, writes, notifications, paints,
    mount: () => events.get('DOMContentLoaded')(), toggle: () => window.SiteTheme.toggle(),
    motion: active => subscriber(active), translate: () => mutation(),
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('theme restores before DOM initialization, with dark default and blocked-storage fallback', async () => {
  for (const options of [{ saved: 'light' }, { saved: null }, { blocked: true, saved: 'light' }]) {
    const r = runtime(options);
    const expected = options.saved === 'light' && !options.blocked ? 'light' : 'dark';
    assert.equal(r.root.dataset.theme, expected);
    assert.equal(r.env.window.SiteTheme.amount, expected === 'light' ? 1 : 0);
    assert.equal(r.frames.size, 0);
    assert.equal(r.button.hidden, true);
    r.mount();
    assert.equal(r.button.hidden, false);
    assert.equal(r.status.textContent, undefined, 'First paint should not announce an unsolicited change');
    assert.equal(r.writes.length, 0);
  }
});
test('motion-off, reduced motion and unsupported features use an immediate accessible switch', async () => {
  for (const options of [{ enabled: false }, { reduced: true }, { supported: false }, { clip: false }, { blocked: true, enabled: false }]) {
    const r = runtime(options); r.mount();
    await r.toggle();
    assert.equal(r.root.dataset.theme, 'light');
    assert.equal(r.transitions.length, 0);
    assert.equal(r.frames.size, 0);
    assert.equal(r.button.attrs['aria-pressed'], 'true');
    assert.equal(r.button.title, '切换到深色主题');
    assert.equal(r.status.textContent, '已切换到浅色主题');
    assert.equal(r.notifications[0], 'site-theme-change');
  }
});
test('one finite wave locks repeated clicks, caps the bitmap and releases frames on completion', async () => {
  const r = runtime(); r.mount();
  const task = r.toggle(); await r.toggle();
  assert.equal(r.transitions.length, 1);
  assert.equal(r.button.disabled, true);
  assert(r.canvas.width * r.canvas.height <= 800000);
  r.transitions[0].ready.resolve(); await flush();
  assert.equal(r.animations[0].options.pseudoElement, '::view-transition-new(root)');
  assert.equal(r.animations[0].keyframes.length, 41);
  const [id, tick] = [...r.frames][0]; r.frames.delete(id); tick(400);
  assert(r.paints.some(call => call[0] === 'stroke'));
  r.animations[0].done.resolve(); r.transitions[0].done.resolve(); await task;
  assert.equal(r.frames.size, 0);
  assert.equal(r.canvas.width * r.canvas.height, 1);
  assert.equal(r.root.dataset.themeTransition, undefined);
  assert.equal(r.button.disabled, false);
  assert.equal(r.button.attrs['aria-busy'], undefined);
});
test('navigation, resize, visibility and motion changes cancel pending decorative work', async () => {
  for (const name of ['resize', 'pagehide', 'pageswap', 'visibilitychange', 'motion', 'media:change']) {
    const r = runtime(); r.mount(); const task = r.toggle();
    if (name === 'motion') r.motion(false);
    else if (name === 'media:change') r.events.get(name)({ matches: true });
    else { r.env.document.hidden = true; r.events.get(name)(); }
    r.transitions[0].ready.resolve(); await task;
    assert.equal(r.transitions[0].skips, 1, name);
    assert.equal(r.animations.length, 0, name);
    assert.equal(r.frames.size, 0, name);
    assert.equal(r.button.disabled, false, name);
    assert.equal(r.canvas.width, 1, name);
  }
});
test('late cancelled callbacks cannot overwrite a newer cross-tab preference', async () => {
  const r = runtime({ delayed: true }); r.mount(); const task = r.toggle();
  r.events.get('storage')({ key: 'site-theme', newValue: 'dark' });
  r.transitions[0].update(); r.transitions[0].ready.resolve(); await task;
  assert.equal(r.root.dataset.theme, 'dark');
  assert.equal(r.writes.length, 0);
  assert.equal(r.button.disabled, false);
});
test('snapshot failure, cleared storage and bfcache restore keep a usable consistent preference', async () => {
  const r = runtime(); r.mount(); const task = r.toggle();
  r.transitions[0].ready.reject(Error('snapshot failed')); await task;
  assert.equal(r.root.dataset.theme, 'light'); assert.equal(r.button.disabled, false);
  const writes = r.writes.length;
  r.events.get('storage')({ key: null, newValue: null });
  assert.equal(r.root.dataset.theme, 'dark'); assert.equal(r.writes.length, writes);
  r.storage.set('site-theme', 'light'); r.events.get('pageshow')({ persisted: true });
  assert.equal(r.root.dataset.theme, 'light'); assert.equal(r.writes.length, writes);
  r.root.lang = 'en'; r.translate();
  assert.equal(r.button.title, 'Switch to dark theme'); assert.equal(r.button.attrs['aria-label'], 'Switch to dark theme');
});
test('all localized layouts inject one bootstrap and adjacent language/theme controls idempotently', () => {
  for (const lang of ['zh', 'en']) {
    const $ = load('<html><head><script src="js/theme.js"></script><link href="css/theme.css"></head><body><nav id="nav"><a id="langToggle">EN</a><span class="nav-status"></span><button class="nav-hamburger"></button></nav></body></html>');
    addThemeRuntime($, lang); addThemeRuntime($, lang);
    assert.equal($('script[src="/js/theme.js"]').length, 1);
    assert.equal($('script[src="/js/theme-ribbon.js"]').length, 1);
    assert.equal($('link[href="/css/theme.css"]').length, 1);
    assert.equal($('#themeToggle').length, 1);
    assert.equal($('#langToggle').next().attr('id'), 'themeToggle');
    assert.equal($('#themeToggle').parent().attr('class'), 'nav-tools');
    assert.equal($('.nav-tools').next().attr('class'), 'nav-hamburger');
    assert.equal($('#themeToggle').attr('aria-label'), lang === 'en' ? 'Switch to light theme' : '切换到浅色主题');
    assert.equal($('#themeToggle').text(), '');
    assert.equal($('#themeToggle svg[aria-hidden="true"]').length, 2);
    assert.equal($('#themeToggle [data-theme-label]').length, 0);
  }
});
test('legacy syntax colors adapt without changing dark defaults, copy text or unrelated inline styles', () => {
  const $ = load('<html><head></head><body><div class="detail-code-body"><span style="color:#F1FA8C;font-weight:600">"example"</span></div><span style="color:#F1FA8C">outside</span></body></html>');
  addThemeRuntime($, 'en');
  const first = $.html(); addThemeRuntime($, 'en');
  assert.equal($.html(), first);
  assert.equal($('.detail-code-body span').attr('style'), 'color:var(--syntax-f1fa8c,#F1FA8C);font-weight:600');
  assert.equal($('.detail-code-body').text(), '"example"');
  assert.equal($('body > span').attr('style'), 'color:#F1FA8C');
});
test('the annular path has stable topology and covers portrait, landscape and desktop corners', () => {
  function contains(points, x, y) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i], [xj, yj] = points[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  for (const [w, h] of [[1280, 800], [390, 844], [844, 390]]) for (const phase of [0, 3, 13]) {
    for (const center of [[w / 2, h / 4], [w / 2, h * .75]]) {
      const start = geometry.frame(0, w, h, phase, center), end = geometry.frame(1, w, h, phase, center);
      assert.deepEqual(start.outer, start.inner);
      assert.equal(end.innerRadius, 0);
      assert([[0, 0], [w, 0], [0, h], [w, h]].every(([x, y]) => contains(end.outer, x, y)));
      for (const frame of geometry.keyframes(w, h, phase, center)) {
        assert(!/NaN|Infinity/.test(frame.clipPath));
        assert.equal((frame.clipPath.match(/M/g) || []).length, 2);
      }
    }
  }
});
