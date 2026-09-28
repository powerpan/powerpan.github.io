const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const { languagePath, SITE_ORIGIN } = require('./site_urls');
const { createLocalizedPages, readTranslations, translateDocument, mappedLink, localizedSchema } = require('./localize_site');

test('language URLs are reversible and idempotent at root, archives and details', () => {
  for (const pathname of ['/', '/blog/', '/blog/example', '/blog/topics/ai', '/projects/example']) {
    const english = languagePath(pathname, 'en');
    assert.equal(english, '/en' + pathname);
    assert.equal(languagePath(english, 'en'), english);
    assert.equal(languagePath(english, 'zh'), pathname);
  }
  assert.equal(languagePath('/en', 'en'), '/en/');
  assert.equal(languagePath('/english', 'zh'), '/english');
  assert.throws(() => languagePath('/', 'fr'), /Unsupported/);
});

test('DOM translation preserves text escaping, nested markup, attributes and scripts', () => {
  const $ = load('<h1 data-i18n="plain">old</h1><p data-i18n-html="rich">old</p><input data-i18n-placeholder="plain"><img data-i18n-alt="plain"><button data-i18n-title="plain"></button><script>const sample = "<h1>";</script><pre>&lt;tag&gt;&amp;</pre>');
  const data = { en: { plain: '<tag> & "text"', rich: '<strong>Nested <em>content</em></strong><a href="example.html">Link</a>' } };
  translateDocument($, data, 'en', 'fixture');
  assert.equal($('h1').text(), data.en.plain);
  assert.equal($('h1 tag').length, 0);
  assert.equal($('p strong em').text(), 'content');
  assert.equal($('input').attr('placeholder'), data.en.plain);
  assert.equal($('img').attr('alt'), data.en.plain);
  assert.equal($('button').attr('title'), data.en.plain);
  assert.equal($('script').text(), 'const sample = "<h1>";');
  assert.equal($('pre').text(), '<tag>&');
  assert.throws(() => translateDocument($, { en: {} }, 'en', 'fixture'), /missing en translation/);
});

test('translation loading follows only the declared local chunks in order', () => {
  const $ = load('<script src="../js/i18n.js"></script><script src="../js/i18n/core.js?v=1"></script><script src="https://example.com/js/i18n/other.js"></script><script src="../js/i18n/articles/example.js"></script><script>throw new Error("do not run interactions")</script>');
  const seen = [];
  const data = readTranslations($, 'blog/example.html', (file) => {
    seen.push(file);
    return `window.registerI18nChunk({zh:{title:"中文"},en:{title:${JSON.stringify(file)}}});`;
  });
  assert.deepEqual(seen, ['js/i18n/core.js', 'js/i18n/articles/example.js']);
  assert.equal(data.en.title, seen[1]);
  assert.equal(data.en.unloaded, undefined);
});

test('only known page links change language; resources, query, hash and external URLs survive', () => {
  const pages = new Set(['/', '/blog/', '/blog/example']);
  for (const [input, expected] of [
    ['../index.html#blog', '/en/#blog'], ['index.html', '/en/blog/'],
    ['example.html?q=1&n=2#part', '/en/blog/example?q=1&n=2#part'],
    ['https://erichz.site/blog/example', '/en/blog/example'],
    ['../assets/picture.png', '/assets/picture.png'], ['missing.html', '/blog/missing.html'],
    ['#part', '#part'], ['?q=1', '?q=1'], ['mailto:test@example.com', 'mailto:test@example.com'],
    ['https://other.example/a.html', 'https://other.example/a.html'], ['data:image/png;base64,abc', 'data:image/png;base64,abc'],
  ]) assert.equal(mappedLink(input, 'blog/example.html', 'en', pages), expected);
  assert.equal(mappedLink('example.html', 'blog/index.html', 'en', pages, true), '/blog/example.html');
});

test('schema localization updates page facts but preserves author identity and dates', () => {
  const url = SITE_ORIGIN + '/blog/example';
  const pages = new Map([['/blog/example', { en: { canonical: SITE_ORIGIN + '/en/blog/example', name: 'English title', description: 'English summary' } }]]);
  const author = { '@type': 'Person', name: 'Eric Pan', url: SITE_ORIGIN };
  const schema = localizedSchema({ '@type': 'BlogPosting', url, mainEntityOfPage: url, headline: '中文', description: '中文', inLanguage: 'zh-CN', datePublished: '2026-01-02', author }, 'en', pages);
  assert.equal(schema.url, SITE_ORIGIN + '/en/blog/example');
  assert.equal(schema.headline, 'English title');
  assert.equal(schema.inLanguage, 'en');
  assert.equal(schema.datePublished, '2026-01-02');
  assert.deepEqual(schema.author, author);
});

test('bilingual generation is deterministic, emits static navigation, shares assets and translates both initial documents', () => {
  const html = `<!doctype html><html><head><title>Example</title><meta name="description" content="Example"><link rel="canonical" href="https://erichz.site/projects/example"><meta property="og:url"><script type="application/ld+json">{"@type":"CreativeWork","url":"https://erichz.site/projects/example","inLanguage":["zh-CN","en"]}</script><link rel="stylesheet" href="../css/base.css"></head><body><nav id="nav"><span class="nav-status"></span></nav><button id="mobileLangBtn" onclick="toggleLang()"></button><h1 data-i18n="nav_about">stale</h1><p class="detail-subtitle" data-i18n="nav_blog">stale</p><img src="../assets/photo.png"><script src="../js/i18n/core.js"></script><script>const sample = '<div>';</script></body></html>`;
  const entries = [{ rel: 'projects/example.html', html }];
  const first = createLocalizedPages(entries);
  const second = createLocalizedPages(entries);
  assert.deepEqual([...first.keys()], ['projects/example.html', 'en/projects/example.html']);
  for (const [rel, content] of first) assert(content.equals(second.get(rel)));
  const $ = load(first.get('en/projects/example.html').toString());
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('h1').text(), '// About');
  assert.equal($('img').attr('src'), '/assets/photo.png');
  assert.equal($('#langToggle').attr('href'), '/projects/example');
  assert($('#mobileLangBtn').is('a'));
  assert.equal($('#mobileLangBtn').attr('onclick'), undefined);
  assert.equal($('link[hreflang]').length, 2);
  assert.equal($('script').last().text(), "const sample = '<div>';");
  const zh = load(first.get('projects/example.html').toString());
  assert.equal(zh('h1').text(), '// 关于');
});

function runtime(staticLang, preference, blockedStorage = false) {
  const events = [];
  const navigations = [];
  let queries = 0;
  const context = {
    URL,
    localStorage: { getItem() { if (blockedStorage) throw new Error('blocked'); return preference; }, setItem() { if (blockedStorage) throw new Error('blocked'); } },
    document: {
      documentElement: { getAttribute: () => staticLang },
      addEventListener: (_, fn) => events.push(fn),
      getElementById: () => null,
      querySelectorAll: () => { queries++; return []; },
      querySelector: (selector) => selector.startsWith('link[hreflang=')
        ? { href: SITE_ORIGIN + (selector.includes('"en"') ? '/en' : '') + '/blog/example' } : null,
    },
    window: { location: { pathname: (staticLang === 'en' ? '/en' : '') + '/blog/example', search: '?q=1', hash: '#part', assign: (url) => navigations.push(url) }, addEventListener() {} },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js/i18n.js'), 'utf8'), context);
  context.registerI18nChunk({ zh: { nav_lang: 'EN' }, en: { nav_lang: '中' } });
  events.forEach((fn) => fn());
  return { context, navigations, queryCount: () => queries };
}

test('published runtime obeys URL language despite saved preferences, and never replaces static links', () => {
  for (const lang of ['zh', 'en']) for (const preference of ['zh', 'en']) {
    const { context, navigations, queryCount } = runtime(lang, preference);
    assert.equal(context.currentLang, lang);
    assert.equal(context.document.documentElement.lang, lang === 'zh' ? 'zh-CN' : 'en');
    assert.equal(queryCount(), 0);
    assert.deepEqual(navigations, []);
    context.toggleLang();
    assert.equal(navigations[0], (lang === 'zh' ? '/en' : '') + '/blog/example?q=1#part');
  }
  assert.equal(runtime('en', 'zh', true).context.currentLang, 'en');
});

test('source preview retains in-place switching without an English route or available storage', () => {
  const { context, navigations, queryCount } = runtime(null, 'zh', true);
  context.toggleLang();
  assert.equal(context.currentLang, 'en');
  assert.equal(context.document.documentElement.lang, 'en');
  assert(queryCount() > 0);
  assert.deepEqual(navigations, []);
});
