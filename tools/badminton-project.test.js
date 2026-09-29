const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { load } = require('cheerio');
const { readTranslations, translateDocument } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const rel = 'projects/greenbird-badminton.html';
const source = fs.readFileSync(path.join(root, rel), 'utf8');
// Original JPEG hashes from the user's September 29 isolated-demo capture set.
const captures = {
  'booking-20260929.jpg': [1120, 1099, '5130dd445fb5d2aa00319026cf3b429010b1d676e8792e4e7aafa73b2dafb401'],
  'frontdesk-20260929.jpg': [1120, 1419, '138020f6f9345ee63f1872a05185f85b0d14ef44fbe501e1ba40c22a3534bfaf'],
  'checkout-20260929.jpg': [1135, 616, '7ec4d19b22bf738a08b65c2f4b04823a90126818818763d125397362b958e72f'],
  'pickup-20260929.jpg': [1120, 912, '6cfb1424300d256b13dd93fd68014be8873093177caa1168afe45763d24651a6'],
  'ledger-20260929.jpg': [1120, 2148, '99875524b134a745861376a591c46da3c3ddcd8e965871f4f8ad43fb63c5e1f6'],
};

test('badminton project uses five unaltered captures with dimensions and original-image links', () => {
  const $ = load(source);
  const links = $('.greenbird-screenshot');
  assert.equal(links.length, 5);
  links.each((_, el) => {
    const a = $(el), img = a.find('img'), src = img.attr('src');
    const [width, height, hash] = captures[path.basename(src)];
    assert.equal(a.attr('href'), src);
    assert.equal(a.attr('target'), '_blank');
    assert(a.attr('rel').includes('noopener'));
    assert.equal(Number(img.attr('width')), width);
    assert.equal(Number(img.attr('height')), height);
    assert(img.attr('data-i18n-alt'));
    assert(a.closest('figure').find('figcaption[data-i18n]').length);
    const data = fs.readFileSync(path.resolve(root, 'projects', src));
    assert.equal(createHash('sha256').update(data).digest('hex'), hash);
  });
  assert(!source.includes('object-fit: cover'));
});

test('badminton benchmark table matches the dated original sample without a production capacity claim', () => {
  const $ = load(source);
  const file = path.resolve(root, 'projects', $('.greenbird-source').attr('href'));
  const evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert(evidence.executed_at.startsWith('2026-09-24'));
  for (const row of evidence.measurements) {
    const cells = $(`[data-benchmark="${row.name}"] td`).map((_, el) => $(el).text()).get();
    assert.equal(Number(cells[0]), row.p50_ms);
    assert.equal(Number(cells[1]), row.p95_ms);
    assert.equal(cells[2], `${row.failures} / ${row.warm_samples}`);
    assert.equal(row.concurrency, 20);
    assert.equal(row.warm_samples, 200);
  }
  assert.match($('[data-i18n="greenbird_concurrency_note"]').text(), /不代表生产 QPS/);
});

test('badminton roles, captions and payment boundaries translate while the public URL stays stable', () => {
  const translations = readTranslations(load(source), rel);
  for (const lang of ['zh', 'en']) {
    const $ = load(source);
    translateDocument($, translations, lang, rel);
    assert.equal($('.greenbird-screenshot img').length, 5);
    assert.match($('h1').text(), /BF.*Badminton/);
    $('.detail-toc-item').each((_, el) => assert.equal($('#' + $(el).attr('data-target')).length, 1));
    if (lang === 'en') {
      assert(!/[\u3400-\u9fff]/.test($('.detail-content, figcaption').text()));
      assert.match($('[data-i18n="greenbird_evidence_note"]').text(), /not the official Alipay sandbox/);
      assert.match($('[data-i18n="greenbird_p9"]').text(), /maintenance staff only view/);
    }
  }
  const archive = load(fs.readFileSync(path.join(root, 'projects/index.html'), 'utf8'));
  assert.match(archive('a[href="greenbird-badminton.html"] .project-list-title').text(), /BF Badminton/);
  assert.equal(load(source)('link[rel="canonical"]').attr('href'), 'https://erichz.site/projects/greenbird-badminton');
});
