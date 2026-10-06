const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const { createLocalizedPages, readTranslations } = require('./localize_site');
const { addMusicRuntime } = require('./music_controls');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const key = 'site-audio-handoff';
const now = 1000000;
const settle = () => new Promise(resolve => setImmediate(resolve));

function target(extra = {}) {
  const events = new Map();
  return {
    dataset: {}, attributes: {}, hidden: false, textContent: '', value: '',
    addEventListener(name, fn) { if (!events.has(name)) events.set(name, []); events.get(name).push(fn); },
    emit(name, event = {}) { for (const fn of events.get(name) || []) fn(event); },
    setAttribute(name, value) { this.attributes[name] = value; },
    focus() { this.focused = true; },
    ...extra,
  };
}
function state(extra = {}) {
  return { version: 1, track: 'emerald-drift', position: 32, volume: 0.25, savedAt: now, resume: false, ...extra };
}
function runtime({ store = new Map(), saved, blocked = false, lang = 'zh', error, deferred = false } = {}) {
  if (saved !== undefined) store.set(key, typeof saved === 'string' ? saved : JSON.stringify(saved));
  let calls = 0, position = 0, finish;
  const audio = target({
    paused: true, volume: 1, readyState: 0, duration: NaN,
    play() {
      calls++;
      if (error) return Promise.reject(error);
      this.paused = false;
      if (deferred) return new Promise(resolve => { finish = resolve; });
      return Promise.resolve();
    },
    pause() { const playing = !this.paused; this.paused = true; if (playing) this.emit('pause'); },
  });
  Object.defineProperty(audio, 'currentTime', {
    get: () => position,
    set(value) { assert(audio.readyState >= 1, 'Never seek before metadata'); position = value; },
  });
  const nodes = Object.fromEntries(['siteSound', 'nowPlaying', 'soundSettings', 'soundPanel',
    'soundVolume', 'soundVolumeValue', 'soundStatus'].map(id => [id, target()]));
  const title = target({ dataset: { i18n: 'bgm_title' } });
  nodes.siteSound.querySelectorAll = () => [title];
  nodes.soundPanel.hidden = true;
  nodes.bgm = audio;
  const document = target({ readyState: 'complete', documentElement: { lang }, getElementById: id => nodes[id] });
  const context = target({ document, Date: { now: () => now }, sessionStorage: {
    getItem(name) { if (blocked) throw Error('blocked'); return store.get(name) || null; },
    setItem(name, value) { if (blocked) throw Error('blocked'); store.set(name, value); },
  } });
  context.window = context;
  context.I18N = { zh: {}, en: {} };
  context.registerI18nChunk = chunk => { for (const lang of ['zh', 'en']) Object.assign(context.I18N[lang], chunk[lang]); };
  vm.createContext(context);
  vm.runInContext(read('js/i18n/core.js'), context);
  vm.runInContext(read('js/music.js'), context);
  return {
    context, document, nodes, audio, store, title, calls: () => calls,
    click() { nodes.nowPlaying.emit('click'); },
    metadata() { audio.readyState = 4; audio.duration = 180; audio.emit('loadedmetadata'); },
    finish() { finish?.(); },
    saved() { return JSON.parse(store.get(key)); },
  };
}

test('all bilingual page types share one silent native audio dock and one retained motion control', () => {
  const entries = ['index.html', 'blog/index.html', 'blog/encrypted-substring-search.html',
    'projects/index.html', 'projects/civilization-z.html'].map(rel => ({ rel, html: read(rel) }));
  for (const [rel, content] of createLocalizedPages(entries)) {
    const $ = load(content.toString());
    assert.equal($('#bgm').length, 1, rel);
    assert.equal($('#bgm').attr('preload'), 'none', rel);
    assert($('#bgm').is('[loop]:not([autoplay])'), rel);
    assert.equal($('#bgm source').attr('src'), '/assets/emerald-drift.mp3', rel);
    assert.equal($('#siteSound').length, 1, rel);
    assert($('#nowPlaying').is('button[type="button"]'), rel);
    assert.equal($('#nowPlaying').attr('aria-pressed'), 'false', rel);
    assert.equal($('#nowPlaying').attr('aria-label'), rel.startsWith('en/') ? 'Play background music' : '播放背景音乐', rel);
    assert.equal($('.sound-title').text(), rel.startsWith('en/') ? 'Emerald Drift' : 'Emerald Drift｜翡翠漂流', rel);
    assert.equal($('#soundPanel #motionToggle, #soundPanel [data-page-motion]').length, 1, rel);
    assert.equal($('#motionToggle, [data-page-motion]').length, 1, rel);
    assert.equal($('#mobileBgmBtn').length, 0, rel);
    assert.equal($('script[src="/js/music.js"]').length, 1, rel);
    assert.equal($('link[href="/css/music.css"]').length, 1, rel);
    assert($.html().indexOf('id="soundPanel"') < $.html().indexOf('src="/js/motion.js"'), rel);
  }
  const $ = load(read('index.html'));
  const t = readTranslations($, 'index.html').zh;
  addMusicRuntime($, 'zh', t); addMusicRuntime($, 'zh', t);
  assert.equal($('#siteSound, #bgm, #motionToggle').length, 3);
  assert.equal($('script[src="/js/music.js"]').length, 1);
  const bytes = fs.readFileSync(path.join(root, 'assets/emerald-drift.mp3'));
  assert(bytes.length > 100000 && bytes.length < 5000000);
  assert.equal(bytes.subarray(0, 3).toString(), 'ID3');
  assert(!read('js/features.js').includes('tryPlay'));
});

test('unrelated clicks, typing, theme changes, settings and volume adjustments never start music', () => {
  const r = runtime();
  assert.equal(r.audio.volume, 0.4);
  for (const name of ['themeToggle', 'navHamburger', 'articleLink', 'contactInput']) {
    r.document.emit('click', { target: { id: name, closest: () => null } });
    r.document.emit('keydown', { key: 'Enter' });
    r.document.emit('keydown', { key: 'a' });
  }
  r.nodes.soundSettings.emit('click');
  assert.equal(r.nodes.soundPanel.hidden, false);
  r.nodes.soundVolume.value = '25'; r.nodes.soundVolume.emit('input');
  r.document.emit('keydown', { key: 'Escape' });
  assert.equal(r.nodes.soundPanel.hidden, true);
  assert.equal(r.calls(), 0);
  assert.equal(r.audio.paused, true);
  assert.equal(r.saved().resume, false);
});

test('only the music button starts playback and toggles native accessible state', async () => {
  const r = runtime({ lang: 'en' });
  r.click(); await settle();
  assert.equal(r.calls(), 1);
  assert.equal(r.audio.paused, false);
  assert.equal(r.nodes.nowPlaying.attributes['aria-pressed'], 'true');
  assert.equal(r.nodes.nowPlaying.attributes['aria-label'], 'Pause background music');
  r.click();
  assert.equal(r.audio.paused, true);
  assert.equal(r.nodes.nowPlaying.attributes['aria-pressed'], 'false');
});

test('active page navigation carries progress and volume once, without another global-gesture listener', async () => {
  const first = runtime(); first.metadata(); first.click(); await settle();
  first.audio.currentTime = 64; first.audio.volume = 0.25;
  first.context.emit('pagehide');
  assert.equal(first.audio.paused, true);
  assert.equal(first.saved().resume, true);
  const next = runtime({ store: first.store });
  assert.equal(next.calls(), 1);
  next.metadata(); await settle();
  assert.equal(next.audio.currentTime, 64);
  assert.equal(next.audio.volume, 0.25);
  assert.equal(next.saved().resume, false);
  const fresh = runtime({ store: first.store });
  assert.equal(fresh.calls(), 0);
});

test('paused navigation and saved checkpoints stay silent but retain the last position', async () => {
  const first = runtime(); first.metadata(); first.click(); await settle();
  first.audio.currentTime = 73; first.click(); first.context.emit('pagehide');
  const next = runtime({ store: first.store });
  assert.equal(next.calls(), 0);
  next.click(); next.metadata(); await settle();
  assert.equal(next.audio.currentTime, 73);
});

test('MP3 duration may be infinite or arrive late without losing the pending seek', async () => {
  for (const duration of [Infinity, NaN]) {
    const r = runtime({ saved: state({ resume: true, position: 64 }) });
    r.audio.readyState = 1; r.audio.duration = duration; r.audio.emit('loadedmetadata');
    await settle();
    r.audio.duration = 180; r.audio.emit('durationchange');
    assert.equal(r.audio.currentTime, 64);
    r.audio.currentTime = 67; r.audio.emit('canplay');
    assert.equal(r.audio.currentTime, 67, 'Later media events never rewind completed seeks');
  }
});

test('stale, malformed, future and mismatched playback handoffs never autoplay', () => {
  for (const saved of ['{broken', state({ savedAt: now - 60001, resume: true }),
    state({ savedAt: now + 1, resume: true }), state({ track: 'old', resume: true }),
    state({ position: -1, resume: true }), state({ volume: 7, resume: true }),
    state({ version: 2, resume: true })]) {
    assert.equal(runtime({ saved }).calls(), 0);
  }
});

test('blocked playback offers explicit retry and never retries on unrelated clicks or typing', async () => {
  const r = runtime({ saved: state({ resume: true }), error: { name: 'NotAllowedError' } });
  await settle();
  assert.equal(r.audio.paused, true);
  assert.equal(r.nodes.nowPlaying.attributes['aria-pressed'], 'false');
  assert.equal(r.nodes.soundStatus.textContent, '点击音乐按钮继续播放');
  r.document.emit('click', { target: { closest: () => null } });
  r.document.emit('keydown', { key: 'Enter' });
  assert.equal(r.calls(), 1);
});

test('rapid pause and pagehide invalidate late playback promises', async () => {
  for (const leave of [false, true]) {
    const r = runtime({ deferred: true }); r.click();
    if (leave) r.context.emit('pagehide'); else r.click();
    r.finish(); await settle();
    assert.equal(r.audio.paused, true);
    assert.equal(r.nodes.nowPlaying.attributes['aria-pressed'], 'false');
  }
});

test('bfcache history restores the latest progress rather than the old document position', async () => {
  const first = runtime(); first.metadata(); first.click(); await settle();
  first.audio.currentTime = 12; first.context.emit('pagehide');
  const next = runtime({ store: first.store }); next.metadata(); await settle();
  next.audio.currentTime = 35; next.context.emit('pagehide');
  first.context.emit('pageshow', { persisted: true }); await settle();
  assert.equal(first.audio.currentTime, 35);
  assert.equal(first.audio.paused, false);
});

test('blocked storage and media errors leave the current player and pause control usable', async () => {
  const r = runtime({ blocked: true }); r.click(); await settle();
  assert.equal(r.audio.paused, false);
  r.click(); assert.equal(r.audio.paused, true);
  const failed = runtime({ error: { name: 'NotSupportedError' }, lang: 'en' });
  failed.click(); await settle();
  assert.equal(failed.nodes.soundStatus.textContent, 'Music is unavailable. Click to retry');
  assert.equal(failed.saved().resume, false);
});
