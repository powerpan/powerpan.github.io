const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { load } = require('cheerio');
const { createLocalizedPages, readTranslations } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const rel = 'projects/word-note.html';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
// Original demo captures, in reading order. Keep the QA title and UI intact.
const captures = [
  ['01-dashboard-light', 2498, 1600, 'acf9cda2c471cf533ad87963317f8054d8f8c9ee3a4772d24e8cda4ec0440726'],
  ['10-floating-quick-add', 720, 264, 'aef612979b7abf38da40a0ec2ba52cb318fab55e5b926b4b6bfae76df57da500'],
  ['03-quick-add-result', 2498, 1600, 'c423142e1876be45b4ac5756f103a4494bdbc758bed9de341b1568dfb372af09'],
  ['04-inbox-candidates', 2498, 1600, 'b31993a51c3032cc08e2fe09903f5b874e62cc78eeb207343129998827a57255'],
  ['06-chinese-meaning-search', 2498, 1600, '6c8db0532f0284b9d2ba7cfa19fa42bebbb85fe7ef2b3f73560a90c557003318'],
  ['08-review-answer', 2498, 1600, 'ce0a8dfb52622fdfaa613835ba44176dcf25ccc3fb7207dce89a19434e6585a9'],
];

test('Word Note uses six unaltered demo captures with correct dimensions and full-size links', () => {
  const $ = load(read(rel));
  assert.equal($('.wordnote-figure').length, captures.length);
  $('.wordnote-figure').each((index, el) => {
    const [name, width, height, hash] = captures[index];
    const figure = $(el), img = figure.find('img'), link = figure.find('a');
    const src = `../assets/projects/word-note/${name}.png`;
    assert.equal(img.attr('src'), src);
    assert.equal(link.attr('href'), src);
    assert.equal(img.attr('width'), String(width));
    assert.equal(img.attr('height'), String(height));
    assert.equal(img.attr('loading'), index ? 'lazy' : 'eager');
    assert.equal(img.attr('decoding'), 'async');
    assert(img.attr('data-i18n-alt'));
    assert(figure.find('figcaption[data-i18n]').text());
    const bytes = fs.readFileSync(path.resolve(root, 'projects', src));
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  });
  assert.match($('style').text(), /\.wordnote-figure img\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/);
  assert.match($('style').text(), /max-width:\s*600px[\s\S]*\.wordnote-flow\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.equal($('.detail-toc-item').length, 6);
  $('.detail-toc-item').each((_, el) => {
    const button = $(el), section = $('#' + button.attr('data-target'));
    assert(button.is('button[type="button"]'));
    assert.equal(button.attr('title'), section.find('h2').text());
  });
});

test('Word Note is featured without losing older projects or changing article slots', () => {
  const home = load(read('index.html')), archive = load(read('projects/index.html'));
  const card = home('.project-card[href="projects/word-note.html"]');
  assert.equal(card.length, 1);
  assert.equal(home('.project-card').length, 6);
  assert.equal(card.find('.project-screenshot').attr('src'), 'assets/projects/word-note/01-dashboard-light.png');
  assert.equal(card.find('.project-visual-note').attr('data-i18n'), 'wn_screenshot_note');
  assert.equal(archive('.project-list-card[href="word-note.html"]').length, 1);
  assert.equal(archive('.project-list-card[href="local-rag.html"]').length, 1);
  assert.equal(archive('.project-list-card').length, 15);
  assert.equal(home('#blog .blog-item').length, 6);
});

test('Word Note has static bilingual content, working language routes and explicit release boundaries', () => {
  const source = load(read(rel));
  const translations = readTranslations(source, rel, read);
  source('[data-i18n^="wn_"]').each((_, el) => {
    assert.equal(source(el).text(), translations.zh[source(el).attr('data-i18n')]);
  });
  const pages = createLocalizedPages(['index.html', 'projects/index.html', rel]
    .map(file => ({ rel: file, html: read(file) })));
  for (const lang of ['zh', 'en']) {
    const prefix = lang === 'en' ? 'en/' : '';
    const $ = load(pages.get(prefix + rel).toString());
    assert.equal($('html').attr('lang'), lang === 'en' ? 'en' : 'zh-CN');
    assert.equal($('h1').text(), 'Word Note');
    assert.equal($('#langToggle').length, 1);
    assert.equal($('#langToggle').attr('href'), lang === 'en' ? '/projects/word-note' : '/en/projects/word-note');
    assert.equal($('link[rel="canonical"]').attr('href'), `https://erichz.site/${prefix}projects/word-note`);
    assert.equal($('link[hreflang]').length, 2);
    assert.equal($('.detail-back').attr('href'), `/${prefix}projects/`);
    assert.equal($('[data-page-motion]').length, 1);
    assert.equal(JSON.parse($('script[type="application/ld+json"]').text()).inLanguage, lang === 'en' ? 'en' : 'zh-CN');
    assert.equal($('a[download]').length, 0);
    assert.doesNotMatch($.html(), /\/Users\/ericpan|file:\/\//);
    const provenance = $('.wordnote-provenance').text();
    const status = $('#status').text();
    assert.match(provenance, /WordNoteQA/);
    assert.match(provenance, /V1/);
    if (lang === 'en') {
      $('body [data-i18n], body [data-i18n-alt], body [data-i18n-title]').each((_, el) => {
        const node = $(el);
        if (node.attr('data-i18n') === 'nav_lang') return;
        assert(!/[\u3400-\u9fff]/.test(node.text() + (node.attr('alt') || '') + (node.attr('title') || '')));
      });
      assert.match(provenance, /offline preset AI responses/);
      assert.match(provenance, /original windows/);
      assert.match(status, /no downloadable installer, accounts or cloud sync/);
      assert.match(status, /plaintext/);
      assert.match($('#review').text(), /still being validated/);
    } else {
      assert.match(provenance, /离线预置 AI 响应/);
      assert.match(status, /没有提供安装包下载/);
      assert.match(status, /明文/);
      assert.match($('#review').text(), /仍在新版中验证/);
    }
  }
});
