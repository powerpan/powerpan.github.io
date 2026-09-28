const fs = require('node:fs');
const { createHash } = require('node:crypto');
const { load } = require('cheerio');
const { SITE_ORIGIN } = require('./site_urls');

function contentOf(value) {
  return Buffer.isBuffer(value) ? value : fs.readFileSync(value);
}

function fingerprintAssets(files) {
  const output = new Map(files);
  const names = new Map();
  for (const [rel, source] of files) {
    if (!/^(?:js\/.*\.js|css\/.*\.css)$/.test(rel)) continue;
    const bytes = contentOf(source);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    // Keep siblings so relative references retain their base directory.
    const versioned = rel.replace(/\.(js|css)$/, `.${hash}.$1`);
    if (output.has(versioned)) throw new Error(`Asset fingerprint collision: ${versioned}`);
    names.set('/' + rel, '/' + versioned);
    output.set(versioned, bytes);
  }
  for (const [rel, source] of files) {
    if (!rel.endsWith('.html')) continue;
    const $ = load(contentOf(source).toString());
    $('script[src],link[rel="stylesheet"],link[rel="preload"][as="script"],link[rel="preload"][as="style"],link[rel="modulepreload"]').each((_, node) => {
      const el = $(node);
      const attribute = el.is('script') ? 'src' : 'href';
      const value = el.attr(attribute);
      if (!value) return;
      const url = new URL(value, `${SITE_ORIGIN}/${rel}`);
      if (url.origin !== SITE_ORIGIN) return;
      const versioned = names.get(url.pathname);
      if (!versioned) throw new Error(`${rel}: missing fingerprintable asset ${value}`);
      url.searchParams.delete('v');
      el.attr(attribute, versioned + url.search + url.hash);
    });
    output.set(rel, Buffer.from($.html()));
  }
  // Unversioned files remain available for previously cached HTML and source previews.
  return output;
}

module.exports = { fingerprintAssets };
