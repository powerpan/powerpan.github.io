const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { load } = require('cheerio');
const { fingerprintAssets } = require('./fingerprint_assets');

const root = path.resolve(__dirname, '..');

test('changed bytes invalidate asset URLs without manual version edits', () => {
  const html = Buffer.from('<script src="../js/i18n.js?v=old&mode=test#part"></script><link rel="preload" as="script" href="/js/i18n.js"><script src="https://example.com/remote.js?v=old"></script><script>const untouched = "i18n.js";</script>');
  const files = new Map([['en/index.html', html], ['js/i18n.js', Buffer.from('/* version one */')]]);
  const first = fingerprintAssets(files);
  assert.deepEqual(first, fingerprintAssets(files), 'Same bytes produce deterministic output');
  const $ = load(first.get('en/index.html').toString());
  const oldUrl = $('script[src]').first().attr('src');
  assert(oldUrl.endsWith('?mode=test#part'));
  assert.equal($('link').attr('href'), oldUrl.split('?')[0]);
  assert.equal($('script[src]').last().attr('src'), 'https://example.com/remote.js?v=old');
  assert.equal($('script').last().text(), 'const untouched = "i18n.js";');
  assert.equal(files.get('en/index.html'), html, 'Source input is not mutated');
  files.set('js/i18n.js', Buffer.from('/* version two */'));
  const next = fingerprintAssets(files);
  const newUrl = load(next.get('en/index.html').toString())('script[src]').first().attr('src');
  assert.notEqual(newUrl, oldUrl, 'A browser caching the old URL must request the new bytes');
  assert(!next.has(oldUrl.split('?')[0].slice(1)), 'Do not accumulate generated versions between builds');
  assert.throws(() => fingerprintAssets(new Map([['en/index.html', html]])), /missing fingerprintable asset/);
});

test('published pages cannot reuse cached pre-localization scripts or styles', () => {
  execFileSync(process.execPath, ['tools/build_site.js', '--skip-seo'], { cwd: root });
  for (const rel of ['index.html', 'en/index.html', 'en/blog/agent-goals-permission-boundaries.html']) {
    const $ = load(fs.readFileSync(path.join(root, '_site', rel), 'utf8'));
    const runtime = $('script[src]').filter((_, el) => /\/js\/i18n[.]/.test($(el).attr('src')));
    assert.equal(runtime.length, 1, `${rel}: exactly one language runtime`);
    $('script[src],link[rel="stylesheet"]').each((_, el) => {
      const url = new URL($(el).attr('src') || $(el).attr('href'), 'https://erichz.site/');
      if (url.origin !== 'https://erichz.site') return;
      const match = url.pathname.match(/^\/(.+)\.([a-f0-9]{16})\.(js|css)$/);
      assert(match, `${rel}: mutable asset URL can reuse a stale cache: ${url.pathname}`);
      const bytes = fs.readFileSync(path.join(root, '_site', url.pathname.slice(1)));
      assert.equal(match[2], createHash('sha256').update(bytes).digest('hex').slice(0, 16));
      const original = fs.readFileSync(path.join(root, '_site', `${match[1]}.${match[3]}`));
      assert(bytes.equals(original), 'Keep original asset paths for old documents');
    });
  }
});
