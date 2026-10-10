const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { load } = require('cheerio');
const { createLocalizedPages, readTranslations } = require('./localize_site');
const { initSharpGallery } = require('../js/ml-sharp');

const root = path.resolve(__dirname, '..');
const rel = 'projects/ml-sharp.html';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('tools/fixtures/ml-sharp-media.json'));
const assetDir = path.join(root, 'assets/projects/ml-sharp');

test('ML-SHARP pairs only the five approved scenes, with opt-in baseline videos and intact edit maps', () => {
  const $ = load(read(rel));
  assert.equal($('[data-sharp-scene]').length, 5);
  assert.equal($('[data-sharp-tab]').length, 5);
  assert.equal($('video').length, 5);
  assert.equal($('details.sharp-edits[open]').length, 5);
  assert.equal(manifest.sourceDirectory, 'ML-SHARP/test_photo');
  assert.deepEqual(fs.readdirSync(assetDir).sort(), [...manifest.scenes.flatMap(s => s.files.map(f => f.file)), manifest.cover.file].sort());
  for (const scene of manifest.scenes) {
    const panel = $(`#scene-${scene.slug}`), video = panel.find('video');
    const photo = panel.find('.sharp-pair img'), map = panel.find('.sharp-map-scroll img');
    const base = `../assets/projects/ml-sharp/${scene.slug}`;
    assert.equal(photo.attr('src'), base + '.jpg');
    assert.equal(photo.attr('width'), String(scene.width));
    assert.equal(photo.attr('height'), String(scene.height));
    assert.equal(video.find('source').attr('src'), base + '.mp4');
    assert.equal(video.attr('poster'), base + '.jpg');
    assert.equal(video.attr('preload'), 'none');
    assert.equal(video.attr('autoplay'), undefined);
    assert(video.is('[controls][playsinline][muted]'));
    assert.equal(scene.video.format.duration, '2.000000');
    assert.deepEqual(scene.video.streams.map(s => s.codec_name), ['h264']);
    assert.equal(map.length, 4);
    assert.equal(panel.find('.sharp-map-grid').attr('style'), `--map-photo-ratio: ${scene.width} / ${scene.height}`);
    map.each((i, el) => {
      const image = $(el), link = image.parent();
      assert.equal(image.attr('src'), base + '-edits.jpg');
      assert.equal(link.attr('href'), image.attr('src'));
      assert.equal(link.attr('style'), `--map-column: ${i}`);
      assert.equal(image.attr('width'), '3072');
      assert.equal(image.attr('height'), '808');
      assert.equal(image.attr('alt'), '', 'the link and caption name this grid region');
      const label = $('#' + link.attr('aria-labelledby').split(' ')[1]);
      assert(label.text().includes(scene.mapCounts[i].toLocaleString('en-US')));
    });
    assert.equal(panel.find('.sharp-map-original').attr('href'), base + '-edits.jpg');
    assert(photo.attr('data-i18n-alt'));
    assert.equal(panel.attr('hidden'), undefined, 'all scenes work without JavaScript');
    assert(panel.find('[data-sharp-play]').is('[hidden]'));
    for (const file of scene.files) {
      const bytes = fs.readFileSync(path.join(assetDir, file.file));
      assert.equal(bytes.length, file.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
      assert(bytes.length < 25 * 1024 * 1024);
    }
  }
  assert.equal($('.detail-toc-item').length, 6);
  assert.doesNotMatch($('main').text(), /六秒|6\s*秒|6-second|six.second/i);
  const css = read('css/ml-sharp.css');
  assert.match(css, /object-fit: contain/);
  assert.match(css, /max-width: 540px[\s\S]*grid-template-columns: 1fr/);
  assert.match(css, /\.sharp-map-scroll \{ overflow-x: auto/);
  assert.match(css, /\.sharp-map-panel \{[^}]*aspect-ratio: var\(--map-photo-ratio\)/);
  assert.match(css, /height: calc\(100% \* 808 \/ 768\)/);
  assert.match(css, /top: calc\(-100% \* 40 \/ 768\)/);
  assert.match(css, /\.sharp-table-wrap \{ overflow-x: auto/);
});

test('ML-SHARP preserves approved prose, factual limits and the five-scene table in both static languages', () => {
  const $ = load(read(rel));
  const translations = readTranslations($, rel, read);
  const draft = read('blog-drafts/ml-sharp-project-review.md').split('## 配图安排')[0];
  const normalize = text => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`/g, '').replace(/\s+/g, '');
  $('main [data-i18n-html^="ms_b"]').each((_, el) => {
    assert(normalize(draft).includes(normalize($(el).text())), $(el).attr('data-i18n-html'));
  });
  const zhKeys = Object.keys(translations.zh).filter(k => k.startsWith('ms_')).sort();
  assert.deepEqual(zhKeys, Object.keys(translations.en).filter(k => k.startsWith('ms_')).sort());
  const pages = createLocalizedPages(['index.html', 'projects/index.html', rel].map(file => ({ rel: file, html: read(file) })));
  for (const lang of ['zh', 'en']) {
    const prefix = lang === 'en' ? 'en/' : '';
    const page = load(pages.get(prefix + rel).toString());
    assert.equal(page('html').attr('lang'), lang === 'en' ? 'en' : 'zh-CN');
    assert.equal(page('h1').text(), 'ML-SHARP');
    assert.equal(page('details.sharp-edits[open]').length, 5);
    assert.equal(page('#scene-corridor-title').text(), lang === 'en' ? 'Campus corridor' : '校园走廊');
    assert.doesNotMatch(page('main').text(), /酒店走廊|商店走廊|shop corridor|hotel corridor/i);
    assert.match(page('#scene-corridor img').first().attr('alt'), lang === 'en' ? /campus corridor/ : /校园走廊/);
    assert.equal(page('#langToggle').length, 1);
    assert.equal(page('#langToggle').attr('href'), lang === 'en' ? '/projects/ml-sharp' : '/en/projects/ml-sharp');
    assert.equal(page('link[rel="canonical"]').attr('href'), `https://erichz.site/${prefix}projects/ml-sharp`);
    assert.equal(page('link[hreflang]').length, 2);
    assert.equal(page('[data-page-motion]').length, 1);
    assert.equal(page('.detail-back').attr('href'), `/${prefix}projects/`);
    assert.deepEqual(page('.sharp-table tbody tr').toArray().map(row => page(row).find('td').toArray().map(td => page(td).text())), [
      ['3', '87,314', '7.40%'], ['14', '13,141', '1.11%'], ['0', '7,086', '0.60%'],
      ['29', '31,273', '2.65%'], ['0', '68,172', '5.78%'],
    ]);
    assert.doesNotMatch(page.html(), /\/Users\/ericpan|file:\/\//);
    if (lang === 'en') {
      page('main [data-i18n], main [data-i18n-html], main [data-i18n-alt]').each((_, el) => {
        assert.doesNotMatch(page(el).text() + (page(el).attr('alt') || ''), /[\u3400-\u9fff]/);
      });
      assert.match(page('#results').text(), /did not measure/i);
      assert.match(page('#next').text(), /not.*real.time|no real.time/i);
    }
  }
  const archive = load(read('projects/index.html')), home = load(read('index.html'));
  assert.equal(archive('.project-list-card').length, 15);
  assert.equal(archive('.project-list-card[href="ml-sharp.html"]').length, 1);
  assert.deepEqual(archive('.project-list-num').toArray().map(el => archive(el).text()), Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0')));
  assert.equal(home('.project-card').length, 6);
  assert.equal(home('.project-card').eq(3).attr('href'), 'projects/ml-sharp.html');
  assert.equal(home('.project-card[href="projects/moyu-night-library.html"]').length, 0);
  assert.equal(archive('.project-list-card[href="moyu-night-library.html"]').length, 1);
  assert.equal(home('#blog .blog-item').length, 6);
});

test('ML-SHARP cover is the requested layer-two crop, not a browser screenshot', () => {
  const { cover } = manifest;
  const bytes = fs.readFileSync(path.join(assetDir, cover.file));
  assert.equal(cover.source, 'corridor-edits.jpg');
  assert.deepEqual(cover.crop, { left: 1536, top: 0, width: 1536, height: 808 });
  assert.equal(bytes.readUInt32BE(16), cover.crop.width);
  assert.equal(bytes.readUInt32BE(20), cover.crop.height);
  assert.equal(bytes.length, cover.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), cover.sha256);
  const home = load(read('index.html'));
  const image = home('.project-card[href="projects/ml-sharp.html"] .project-screenshot');
  assert.equal(image.attr('src'), `assets/projects/ml-sharp/${cover.file}`);
  assert.equal(image.attr('width'), String(cover.crop.width));
  assert.equal(image.attr('height'), String(cover.crop.height));
});

function fixture() {
  class Element {
    constructor(id) { this.id = id; this.dataset = {}; this.hidden = false; this.attrs = {}; this.events = {}; }
    setAttribute(key, value) { this.attrs[key] = value; }
    addEventListener(key, fn) { (this.events[key] ||= []).push(fn); }
    emit(key, event = {}) { return Promise.all((this.events[key] || []).map(fn => fn(event))); }
    focus() { doc.activeElement = this; }
    querySelector(key) { return this.children[key]; }
  }
  const doc = new Element('document'), win = new Element('window');
  doc.defaultView = win;
  const observed = [];
  let intersect;
  win.IntersectionObserver = class {
    constructor(callback) { intersect = callback; }
    observe(video) { observed.push(video); }
  };
  const tabs = [], panels = [], videos = [], buttons = [], errors = [];
  for (let i = 0; i < 5; i++) {
    const tab = new Element(`tab-${i}`), panel = new Element(`scene-${i}`);
    const video = new Element(`video-${i}`), button = new Element(), error = new Element();
    video.paused = true;
    video.currentTime = 0;
    video.playCalls = 0;
    video.pause = () => { video.paused = true; };
    video.play = async () => { video.playCalls++; video.paused = false; await video.emit('play'); };
    button.hidden = true;
    error.hidden = true;
    panel.children = { video, '[data-sharp-play]': button, '.sharp-error': error };
    tabs.push(tab); panels.push(panel); videos.push(video); buttons.push(button); errors.push(error);
  }
  const gallery = new Element('gallery'), tablist = new Element('tabs');
  tablist.hidden = true;
  gallery.children = { '[data-sharp-tabs]': tablist };
  gallery.querySelectorAll = key => ({ '[data-sharp-tab]': tabs, '[data-sharp-scene]': panels, video: videos }[key]);
  initSharpGallery(gallery, doc);
  return { gallery, doc, win, tabs, panels, videos, buttons, errors, observed, intersect: entries => intersect(entries) };
}

test('gallery never starts media on initialization, unrelated clicks or keyboard scene selection', async () => {
  const f = fixture();
  initSharpGallery(f.gallery, f.doc);
  assert.equal(f.tabs[0].events.click.length, 1, 'initialization is idempotent');
  assert.equal(f.panels.filter(p => !p.hidden).length, 1);
  assert.equal(f.tabs[0].tabIndex, 0);
  await f.doc.emit('click');
  await f.doc.emit('keydown', { key: 'Enter' });
  await f.tabs[2].emit('click');
  let prevented = false;
  await f.tabs[2].emit('keydown', { key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert(prevented);
  assert.equal(f.doc.activeElement, f.tabs[3]);
  assert.equal(f.panels[3].hidden, false);
  assert.equal(f.tabs[3].attrs['aria-selected'], 'true');
  await f.tabs[3].emit('keydown', { key: 'Home', preventDefault() {} });
  assert.equal(f.doc.activeElement, f.tabs[0]);
  await f.tabs[0].emit('keydown', { key: 'ArrowLeft', preventDefault() {} });
  assert.equal(f.doc.activeElement, f.tabs[4]);
  assert(f.videos.every(v => v.playCalls === 0 && v.paused));
});

test('explicit playback pauses peers, scene changes, offscreen media and hidden pages without autoresume', async () => {
  const f = fixture();
  await f.buttons[0].emit('click');
  assert.equal(f.videos[0].paused, false);
  assert.equal(f.videos[0].playCalls, 1);
  await f.tabs[1].emit('click');
  assert(f.videos.every(v => v.paused));
  await f.buttons[1].emit('click');
  f.intersect([{ target: f.videos[1], isIntersecting: false }]);
  assert.equal(f.videos[1].paused, true);
  f.intersect([{ target: f.videos[1], isIntersecting: true }]);
  assert.equal(f.videos[1].paused, true);
  await f.buttons[1].emit('click');
  f.doc.hidden = true;
  await f.doc.emit('visibilitychange');
  assert(f.videos.every(v => v.paused));
  f.doc.hidden = false;
  await f.doc.emit('visibilitychange');
  assert(f.videos.every(v => v.paused));
  await f.buttons[1].emit('click');
  await f.win.emit('pagehide');
  assert(f.videos.every(v => v.paused));
  assert.equal(f.observed.length, 5);
});

test('pending or failed playback cannot resume a hidden scene and leaves an explicit retry', async () => {
  const f = fixture();
  let resolve;
  f.videos[0].play = () => new Promise(done => { resolve = () => { f.videos[0].paused = false; done(); }; });
  const pending = f.buttons[0].emit('click');
  await f.tabs[1].emit('click');
  resolve();
  await pending;
  assert.equal(f.videos[0].paused, true);
  f.videos[1].play = async () => { throw new Error('Media unavailable'); };
  await f.buttons[1].emit('click');
  assert.equal(f.errors[1].hidden, false);
  f.videos[1].play = async () => { throw Object.assign(new Error('Cancelled'), { name: 'AbortError' }); };
  await f.buttons[1].emit('click');
  assert.equal(f.errors[1].hidden, true);
});
