const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const { clusters, layoutFor, curvePoint } = require('../js/tech-atlas');
const { sceneProgress } = require('../js/scene-flow');
const { readTranslations, translateDocument, createLocalizedPages } = require('./localize_site');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('constellation expands AI coverage and keeps bounded separate mobile targets', () => {
  const original = ['Vue', 'JavaScript', 'HTML/CSS', 'WXML', 'Python', 'Java', 'PHP', 'MySQL', 'PyTorch', 'YOLO', 'SAM', 'C++', 'Docker', 'Flink'];
  const names = Object.values(clusters).flat().map(([name]) => name);
  assert.equal(names.length, 19);
  for (const name of original) assert(names.includes(name));
  assert.deepEqual(clusters.ai.map(([name]) => name).sort(), ['PyTorch', 'YOLO', 'SAM', 'C++', 'DETR', 'LLM', 'NLP', 'Stable Diffusion', 'ONNX'].sort());
  for (const group of Object.keys(clusters)) for (const mobile of [false, true]) {
    const points = layoutFor(group, mobile);
    assert.equal(points.length, clusters[group].length);
    for (const p of points) {
      assert(p.x >= 60 && p.x <= (mobile ? 300 : 740));
      assert(p.y >= 50 && p.y <= (mobile ? 260 : 490));
      for (const other of points.filter(other => other !== p)) assert(Math.hypot(p.x - other.x, p.y - other.y) > 90);
    }
  }
  assert.deepEqual(layoutFor('missing', true), []);
});

test('signal packets follow their exact SVG quadratic and never escape endpoints', () => {
  const start = { x: 410, y: 314 }, end = { x: 580, y: 88 };
  assert.deepEqual(curvePoint(start, end, 0), start);
  assert.deepEqual(curvePoint(start, end, 1), end);
  for (let i = 0; i <= 100; i++) {
    const point = curvePoint(start, end, i / 100);
    assert(point.x >= start.x && point.x <= end.x);
    assert(point.y >= end.y && point.y <= start.y);
  }
});

test('chapter flow clamps at both ends without capturing the scroll position', () => {
  assert.equal(sceneProgress(1000, 180, 800), 0);
  assert.equal(sceneProgress(-500, 180, 800), 1);
  assert(sceneProgress(300, 180, 800) > 0);
  assert.equal(sceneProgress(0, 180, 0), 0);
  assert(!read('js/scene-flow.js').includes('preventDefault'));
  assert(!read('js/scene-flow.js').includes('setInterval'));
});

test('atlas controls, translations and real project links are static and reciprocal', () => {
  const $ = load(read('index.html'));
  const translations = readTranslations($, 'index.html');
  assert.equal($('.atlas-selector button').length, 4);
  assert.equal($('.atlas-panel').length, 4);
  $('.atlas-selector button').each((_, button) => {
    const panel = $('#' + $(button).attr('aria-controls'));
    assert.equal(panel.attr('data-cluster'), $(button).attr('data-cluster'));
    panel.find('a').each((_, link) => assert(fs.existsSync(path.join(root, $(link).attr('href')))));
  });
  const aiTools = $('#atlasAi dd').map((_, el) => $(el).text().split(' · ')).get().flat();
  assert.deepEqual(aiTools.sort(), clusters.ai.map(([name]) => name).sort());
  assert.equal($('#atlasAi dt[data-i18n]').length, 3);
  assert.equal($('.atlas-panel:not([hidden])').attr('data-cluster'), 'ai');
  for (const lang of ['zh', 'en']) {
    const page = load(read('index.html'));
    translateDocument(page, translations, lang, 'index.html');
    assert(page('.atlas-hint').text().length > 10);
    if (lang === 'en') assert(!/[\u3400-\u9fff]/.test(page('.tech-atlas').text()));
  }
  assert.equal($('.scene-bridge').length, 2);
  $('.scene-bridge').each((_, el) => assert.equal($(el).attr('aria-hidden'), 'true'));
  assert(!read('js/interactions.js').includes('orbitContainer'));
});

function transitionRuntime({ blocked = false, reduced = false, saved = 'on' } = {}) {
  const events = {}, documentEvents = {}, attributes = {};
  const button = { setAttribute: (key, value) => { attributes[key] = value; } };
  const preference = { matches: reduced, addEventListener: (name, fn) => { events[`media:${name}`] = fn; } };
  const context = {
    matchMedia: () => preference,
    document: { documentElement: { dataset: {} }, querySelector: () => null, querySelectorAll: () => [button],
      addEventListener: (name, fn) => { documentEvents[name] = fn; } },
    localStorage: {
      getItem: () => { if (blocked) throw Error('blocked'); return saved; },
      setItem: (_, value) => { if (blocked) throw Error('blocked'); saved = value; },
    },
    addEventListener: (name, fn) => { events[name] = fn; },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('js/page-transitions.js'), context);
  const click = () => documentEvents.click({ target: { closest: () => button } });
  return { context, events, click, attributes, button, preference };
}

test('page transitions honor saved, system and blocked-storage preferences', () => {
  for (const options of [{ saved: 'off' }, { reduced: true }]) {
    const r = transitionRuntime(options);
    let skipped = 0;
    r.events.pagereveal({ viewTransition: { skipTransition: () => skipped++ } });
    assert.equal(skipped, 1);
    assert.equal(r.context.document.documentElement.dataset.motion, 'off');
  }
  for (const blocked of [false, true]) {
    const r = transitionRuntime({ blocked });
    r.click();
    let skipped = false;
    r.events.pageswap({ viewTransition: { skipTransition: () => { skipped = true; } } });
    assert(skipped);
    assert.equal(r.attributes['aria-pressed'], 'false');
    r.click();
    assert.equal(r.attributes['aria-pressed'], 'true');
    r.events.pagereveal({}); // Unsupported native transitions must stay harmless.
  }
});

test('localized pages bootstrap motion before paint, without duplicate homepage controls', () => {
  const entries = ['index.html', 'projects/neural-vision.html'].map(rel => ({ rel, html: read(rel) }));
  const output = createLocalizedPages(entries);
  for (const [rel, html] of output) {
    const $ = load(html.toString());
    assert.equal($('head script[src="/js/page-transitions.js"]').length, 1);
    assert.equal($('link[href="/css/page-transitions.css"]').length, 1);
    assert.equal($('head script[src="/js/page-transitions.js"]').attr('blocking'), 'render');
    assert.equal($('link[rel="expect"]').attr('href'), '#' + $('h1').first().attr('id'));
    assert($.html().indexOf('/css/page-transitions.css') < $.html().indexOf('/js/page-transitions.js'));
    assert.equal($('#motionToggle, [data-page-motion]').length, 1);
    if (rel.includes('neural-vision')) assert.equal($('html').attr('data-page-scene'), 'reading');
  }
});

test('shared titles are named only for visible destination links, then cleaned for history', async () => {
  const r = transitionRuntime();
  r.context.matchMedia = () => ({ matches: true });
  r.context.innerHeight = 900;
  const title = { style: { removeProperty: () => { delete title.style.viewTransitionName; } } };
  const makeLink = top => ({ href: 'https://erichz.site/projects/neural-vision',
    getBoundingClientRect: () => ({ top, bottom: top + 80, width: 400 }), querySelector: () => title });
  r.context.document.querySelectorAll = selector => selector === 'a[href]' ? [makeLink(2000), makeLink(300)] : [];
  let finish;
  const finished = new Promise(resolve => { finish = resolve; });
  r.events.pageswap({ activation: { entry: { url: 'https://erichz.site/projects/neural-vision' } }, viewTransition: { finished } });
  assert.equal(title.style.viewTransitionName, 'story-title');
  finish();
  await finished;
  assert.equal(title.style.viewTransitionName, undefined);
  r.events.pageswap({ activation: { entry: { url: 'https://external.example/' } }, viewTransition: { finished } });
  assert.equal(title.style.viewTransitionName, undefined);
});

test('native transition cancellation is handled without intercepting navigation', async () => {
  const r = transitionRuntime();
  r.events.pagereveal({ viewTransition: {
    ready: Promise.reject(new Error('Transition was cancelled')),
    finished: Promise.reject(new Error('Navigation superseded')),
  } });
  await Promise.resolve();
  assert.equal(r.context.document.documentElement.dataset.motion, 'on');
  assert(!read('js/page-transitions.js').includes('preventDefault'));
});
