#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { SITE_ORIGIN, canonicalFor, rewritePublicLinks } = require('./site_urls');

const root = path.resolve(__dirname, '..', '_site');
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(file);
    return entry.name.endsWith('.html') ? [path.relative(root, file).split(path.sep).join('/')] : [];
  });
}

function checkUrls() {
  const files = htmlFiles(root);
  const sourceFiles = new Set(files);
  const canonicals = new Set(files.map(canonicalFor));
  let linkCount = 0;

  function checkSiteUrl(value, context) {
    if (typeof value === 'string' && value.startsWith(SITE_ORIGIN + '/')) {
      const url = new URL(value);
      assert(!url.pathname.endsWith('.html'), `${context}: non-canonical URL ${value}`);
    } else if (value && typeof value === 'object') {
      for (const item of Object.values(value)) checkSiteUrl(item, context);
    }
  }

  for (const rel of files) {
    const html = fs.readFileSync(path.join(root, rel), 'utf8');
    const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
    assert.equal(canonical.length, 1, `${rel}: expected one canonical`);
    assert.equal(canonical[0][1], canonicalFor(rel), `${rel}: incorrect canonical`);
    assert.equal(html.match(/<meta property="og:url" content="([^"]+)">/)?.[1], canonicalFor(rel), `${rel}: incorrect og:url`);
    assert.equal(rewritePublicLinks(html, rel, sourceFiles), html, `${rel}: legacy navigation URL`);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)];
    assert(schemas.length > 0, `${rel}: missing structured data`);
    for (const schema of schemas) {
      checkSiteUrl(JSON.parse(schema[1]), rel);
    }
    for (const match of html.matchAll(/<!--[^]*?-->|<(?:a|area)\b[^>]*>/gi)) {
      const tag = match[0];
      if (tag.startsWith('<!--') || /\sdownload(?:\s|=|>)/i.test(tag)) continue;
      const attribute = tag.match(/\shref\s*=\s*(["'])([^"']*)\1/i);
      if (!attribute) continue;
      const href = attribute[2].replace(/&amp;/g, '&');
      const url = new URL(href, canonicalFor(rel));
      if (url.origin !== SITE_ORIGIN) continue;
      assert(!url.pathname.endsWith('.html'), `${rel}: legacy link ${href}`);
      if (!canonicals.has(SITE_ORIGIN + url.pathname)) {
        const asset = path.resolve(root, '.' + decodeURIComponent(url.pathname));
        assert(asset.startsWith(root + path.sep) && fs.existsSync(asset) && fs.statSync(asset).isFile(), `${rel}: broken link ${href}`);
      }
      linkCount++;
    }
  }

  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, canonicals.size, 'Sitemap URL count differs from public HTML count');
  assert.deepEqual(new Set(locations), canonicals, 'Sitemap must list every final canonical exactly once');
  const feed = fs.readFileSync(path.join(root, 'feed.xml'), 'utf8');
  for (const match of feed.matchAll(/<link>([^<]+)<\/link>/g)) {
    assert(canonicals.has(match[1]), `RSS contains non-canonical link: ${match[1]}`);
  }
  for (const item of feed.matchAll(/<item>([^]*?)<\/item>/g)) {
    const link = item[1].match(/<link>([^<]+)<\/link>/)?.[1];
    const guid = item[1].match(/<guid isPermaLink="false">([^<]+)<\/guid>/)?.[1];
    assert.equal(guid, link + '.html', 'Preserve existing RSS identities independently of navigation URLs');
  }
  console.log(`URL checks passed: ${files.length} pages, ${linkCount} internal links, sitemap and RSS.`);
}

try {
  checkUrls();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
