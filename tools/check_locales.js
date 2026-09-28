#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('cheerio');
const { canonicalFor, languagePath, SITE_ORIGIN } = require('./site_urls');

const root = path.resolve(__dirname, '..', '_site');
function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [path.relative(root, file).split(path.sep).join('/')];
  });
}

function checkLocales() {
  const files = filesUnder(root);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const pages = new Set(htmlFiles.map(canonicalFor));
  const chinese = htmlFiles.filter((file) => !file.startsWith('en/'));
  assert.equal(htmlFiles.length, chinese.length * 2, 'Every published page needs both languages');
  assert(files.filter((file) => file.startsWith('en/')).every((file) => file.endsWith('.html')), 'Share assets, not copies');
  let assets = 0;
  for (const rel of htmlFiles) {
    const english = rel.startsWith('en/');
    const base = english ? rel.slice(3) : rel;
    assert(fs.existsSync(path.join(root, 'en', base)) && fs.existsSync(path.join(root, base)), `${rel}: missing counterpart`);
    const $ = load(fs.readFileSync(path.join(root, rel), 'utf8'));
    const canonical = canonicalFor(rel);
    assert.equal($('html').attr('lang'), english ? 'en' : 'zh-CN', rel);
    assert.equal($('html').attr('data-site-lang'), english ? 'en' : 'zh', rel);
    assert.equal($('link[rel="canonical"]').length, 1, rel);
    assert.equal($('link[rel="canonical"]').attr('href'), canonical, rel);
    assert.equal($('link[hreflang]').length, 2, rel);
    for (const lang of ['zh', 'en']) {
      const alternate = $('link[hreflang="' + (lang === 'en' ? 'en' : 'zh-CN') + '"]');
      const expected = SITE_ORIGIN + languagePath(new URL(canonical).pathname, lang);
      assert.equal(alternate.attr('href'), expected, rel);
      assert(pages.has(expected), `${rel}: hreflang points to nonexistent page`);
    }
    assert.equal($('#langToggle').length, 1, rel);
    assert($('#langToggle').is('a[href]'), `${rel}: language switch must work without JavaScript`);
    assert($('h1').text().trim(), `${rel}: empty h1`);
    assert.equal($('meta[property="og:title"]').attr('content'), $('title').text(), rel);
    assert.equal($('meta[name="twitter:title"]').attr('content'), $('title').text(), rel);
    for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      assert.equal($(selector).attr('content'), $('meta[name="description"]').attr('content'), rel);
    }
    $('a[href],area[href]').each((_, node) => {
      const el = $(node);
      const url = new URL(el.attr('href'), canonical);
      if (url.origin !== SITE_ORIGIN || !pages.has(SITE_ORIGIN + url.pathname)) return;
      const otherLanguage = ['langToggle', 'mobileLangBtn'].includes(el.attr('id'));
      assert.equal(url.pathname.startsWith('/en/'), otherLanguage ? !english : english, `${rel}: wrong language link ${url}`);
    });
    function asset(value) {
      const url = new URL(value, canonical);
      if (url.origin !== SITE_ORIGIN) return;
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      assert(file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile(), `${rel}: missing asset ${value}`);
      assets++;
    }
    $('[src],[poster],link[rel="stylesheet"]').each((_, node) => {
      for (const attr of ['src', 'poster', 'href']) if ($(node).attr(attr)) asset($(node).attr(attr));
    });
    $('[srcset]').each((_, node) => $(node).attr('srcset').split(',').forEach((entry) => asset(entry.trim().split(/\s+/)[0])));
    $('[style],style').each((_, node) => {
      const css = $(node).attr('style') || $(node).text();
      for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)/g)) if (!match[1].startsWith('#')) asset(match[1]);
    });
    $('script[type="application/ld+json"]').each((_, node) => {
      const walk = (value) => {
        if (!value || typeof value !== 'object') return;
        if ('inLanguage' in value) assert.equal(value.inLanguage, english ? 'en' : 'zh-CN', rel);
        if (value['@type'] === 'Person') return;
        for (const key of ['url', 'mainEntityOfPage']) {
          if (typeof value[key] === 'string' && pages.has(value[key])) {
            assert.equal(new URL(value[key]).pathname.startsWith('/en/'), english, `${rel}: wrong schema URL`);
          }
        }
        Object.values(value).forEach(walk);
      };
      walk(JSON.parse($(node).text()));
    });
    if (english) {
      assert.equal($('link[type="application/rss+xml"]').length, 0, `${rel}: do not label the Chinese feed as English`);
      const visible = $.root().clone();
      visible.find('script,style,noscript,#langToggle,#mobileLangBtn').remove();
      let content = visible.text();
      // Native school names and the essay's explicitly defined Chinese terms are intentional.
      const allowed = base === 'index.html' ? ['华南理工大学', '香港科技大学']
        : base === 'blog/involution-choice.html' ? ['内卷', '躺平'] : [];
      for (const phrase of allowed) content = content.split(phrase).join('');
      assert(!/[\u3400-\u9fff]/.test(content), `${rel}: untranslated visible Chinese text`);
      assert($('.blog-article-body,.detail-content,main,section').text().trim().length > 100, `${rel}: no static English body`);
    }
  }
  console.log(`Locale checks passed: ${chinese.length} bilingual pairs, ${assets} local asset references, reciprocal hreflang and static English content.`);
}

try { checkLocales(); } catch (error) { console.error(error.message); process.exitCode = 1; }
