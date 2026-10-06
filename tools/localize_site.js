const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const { SITE_ORIGIN, publicPathFor, languagePath } = require('./site_urls');
const { addThemeRuntime } = require('./theme_controls');
const { addMusicRuntime } = require('./music_controls');

const root = path.resolve(__dirname, '..');
const attributes = {
  'data-i18n': 'text', 'data-i18n-html': 'html',
  'data-i18n-placeholder': 'placeholder', 'data-i18n-title': 'title', 'data-i18n-alt': 'alt',
};

function readTranslations($, rel, readFile = (file) => fs.readFileSync(path.join(root, file), 'utf8')) {
  const data = { zh: {}, en: {} };
  const sandbox = { window: { registerI18nChunk(chunk) {
    for (const lang of ['zh', 'en']) Object.assign(data[lang], chunk[lang]);
  } } };
  vm.createContext(sandbox);
  $('script[src]').each((_, node) => {
    const url = new URL($(node).attr('src'), `${SITE_ORIGIN}/${rel}`);
    if (url.origin !== SITE_ORIGIN || !/^\/js\/i18n\/.+\.js$/.test(url.pathname)) return;
    vm.runInContext(readFile(url.pathname.slice(1)), sandbox, { timeout: 1000, filename: url.pathname });
  });
  return data;
}

function translateDocument($, translations, lang, rel) {
  for (const [attribute, target] of Object.entries(attributes)) {
    $(`[${attribute}]`).each((_, node) => {
      const el = $(node);
      const key = el.attr(attribute);
      const value = translations[lang][key];
      if (typeof value !== 'string') throw new Error(`${rel}: missing ${lang} translation ${key}`);
      if (target === 'text') el.text(value);
      else if (target === 'html') el.html(value);
      else el.attr(target, value);
    });
  }
}

function sitePath(value, rel) {
  if (!value || /^(?:#|\?|data:|mailto:|tel:|javascript:)/i.test(value)) return null;
  const url = new URL(value, `${SITE_ORIGIN}/${rel}`);
  return url.origin === SITE_ORIGIN ? url : null;
}

function mappedLink(value, rel, lang, pages, resource = false) {
  const url = sitePath(value, rel);
  if (!url) return value;
  const clean = publicPathFor(url.pathname);
  const page = pages.has(clean);
  const pathname = page && !resource ? languagePath(clean, lang) : url.pathname;
  return pathname + url.search + url.hash;
}

function rewriteLinks($, rel, lang, pages) {
  $('a[href], area[href]').each((_, node) => {
    const el = $(node);
    el.attr('href', mappedLink(el.attr('href'), rel, lang, pages, el.is('[download]')));
  });
  $('[src], [poster], link[href]').each((_, node) => {
    const el = $(node);
    for (const attribute of ['src', 'poster', 'href']) {
      const value = el.attr(attribute);
      if (value && !el.is('link[rel="canonical"], link[hreflang], link[type="application/rss+xml"]')) {
        el.attr(attribute, mappedLink(value, rel, lang, pages, true));
      }
    }
  });
  $('[srcset]').each((_, node) => {
    const el = $(node);
    // Embedded data URLs are left intact; ordinary responsive candidates share root assets.
    if (/data:/i.test(el.attr('srcset'))) throw new Error(`${rel}: data srcset needs an explicit parser`);
    el.attr('srcset', el.attr('srcset').split(',').map((candidate) => {
      const [url, ...size] = candidate.trim().split(/\s+/);
      return [mappedLink(url, rel, lang, pages, true), ...size].join(' ');
    }).join(', '));
  });
  function cssUrls(css) {
    return css.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g, (_, quote, value) =>
      `url(${quote}${mappedLink(value, rel, lang, pages, true)}${quote})`);
  }
  $('[style]').each((_, node) => $(node).attr('style', cssUrls($(node).attr('style'))));
  $('style').each((_, node) => $(node).text(cssUrls($(node).text())));
}

function text(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function metadata($, rel, lang, translations, blogCards) {
  const canonical = SITE_ORIGIN + languagePath(publicPathFor(rel), lang);
  let title = $('title').text();
  let description = $('meta[name="description"]').attr('content');
  if (lang === 'en') {
    const tag = rel.startsWith('blog/topics/') ? path.basename(rel, '.html') : null;
    if (tag) {
      const label = translations.en[`blog_tag_${tag}`];
      title = `${label} — Eric`;
      description = `Articles, engineering notes and perspectives on ${label.toLowerCase()} by Eric Pan.`;
    } else if (rel === 'index.html') {
      title = 'Eric — Full-Stack & AI Vision Developer';
      description = 'AI engineering, computer vision, agent architecture and system design. Projects and technical writing by Eric Pan.';
    } else if (rel === 'blog/index.html') {
      title = 'Blog — Eric';
      description = 'Articles on AI engineering, computer vision, agent systems, software architecture and society by Eric Pan.';
    } else if (rel === 'projects/index.html') {
      title = 'Projects — Eric';
      description = 'Software projects by Eric Pan, covering computer vision, AI agents, data systems and full-stack applications.';
    } else {
      title = `${text($('h1').first().text())} — Eric`;
      const card = blogCards.get(publicPathFor(rel));
      description = card ? translations.en[card.descriptionKey] : text($('.detail-subtitle').first().text());
    }
  }
  if (!text(title) || !text(description)) throw new Error(`${rel}: missing ${lang} SEO metadata`);
  return { canonical, title: text(title), description: text(description), name: text(title).replace(/ — Eric$/, '') };
}

function localizedSchema(value, lang, metadataByPath) {
  if (Array.isArray(value)) return value.map((item) => localizedSchema(item, lang, metadataByPath));
  if (!value || typeof value !== 'object') return value;
  if (value['@type'] === 'Person') return value;
  const out = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizedSchema(item, lang, metadataByPath)]));
  for (const key of ['url', 'mainEntityOfPage']) {
    if (typeof value[key] === 'string' && value[key].startsWith(SITE_ORIGIN)) {
      const url = new URL(value[key]);
      const meta = url.origin === SITE_ORIGIN && metadataByPath.get(url.pathname)?.[lang];
      if (meta) out[key] = meta.canonical + url.search + url.hash;
    }
  }
  if ('inLanguage' in out) out.inLanguage = lang === 'en' ? 'en' : 'zh-CN';
  const page = typeof value.url === 'string' && value.url.startsWith(SITE_ORIGIN + '/')
    ? metadataByPath.get(new URL(value.url).pathname)?.[lang] : null;
  if (page && lang === 'en') {
    if ('name' in out && out['@type'] !== 'WebSite') out.name = page.name;
    if ('headline' in out) out.headline = page.name;
    if ('description' in out) out.description = page.description;
    if ('articleSection' in out) {
      const category = value.keywords?.[1];
      const topic = metadataByPath.get(`/blog/topics/${category}`)?.en;
      if (topic) { out.articleSection = topic.name; out.keywords = [topic.name, category]; }
    }
  }
  return out;
}

function addLanguageNavigation($, lang, canonical) {
  const other = lang === 'en' ? 'zh' : 'en';
  const target = languagePath(new URL(canonical).pathname, other);
  const label = other === 'en' ? 'EN' : '中';
  const name = other === 'en' ? 'Read this page in English' : '阅读本页中文版';
  $('#langToggle').remove();
  const desktop = $('<a id="langToggle" class="lang-toggle magnetic" data-hover></a>');
  desktop.attr({ href: target, hreflang: other === 'en' ? 'en' : 'zh-CN', 'aria-label': name }).text(label);
  if ($('#nav .nav-status').length) $('#nav .nav-status').before(desktop);
  else $('#nav').append(desktop);
  const mobile = $('#mobileLangBtn');
  if (mobile.length) {
    const link = $('<a id="mobileLangBtn" class="mobile-lang-btn" data-i18n="nav_lang"></a>');
    link.attr({ href: target, hreflang: other === 'en' ? 'en' : 'zh-CN', 'aria-label': name }).text(label);
    mobile.replaceWith(link);
  }
}

function createLocalizedPages(entries) {
  const pages = new Set(entries.map(({ rel }) => publicPathFor(rel)));
  const blogCards = new Map();
  const archive = entries.find(({ rel }) => rel === 'blog/index.html');
  if (archive) {
    const $ = load(archive.html);
    $('.blog-list-card').each((_, node) => {
      const el = $(node);
      blogCards.set(publicPathFor(new URL(el.attr('href'), `${SITE_ORIGIN}/blog/index.html`).pathname), {
        descriptionKey: el.find('.blog-list-desc').attr('data-i18n'),
      });
    });
  }
  const documents = [];
  const metadataByPath = new Map();
  for (const { rel, html } of entries) {
    const translations = readTranslations(load(html), rel);
    const pair = {};
    for (const lang of ['zh', 'en']) {
      const $ = load(html);
      translateDocument($, translations, lang, rel);
      const meta = metadata($, rel, lang, translations, blogCards);
      pair[lang] = meta;
      documents.push({ $, rel, lang, meta, translations });
    }
    metadataByPath.set(publicPathFor(rel), pair);
  }
  const output = new Map();
  for (const { $, rel, lang, meta, translations } of documents) {
    rewriteLinks($, rel, lang, pages);
    $('html').attr({ lang: lang === 'en' ? 'en' : 'zh-CN', 'data-site-lang': lang });
    $('title').text(meta.title);
    $('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').attr('content', meta.description);
    $('meta[property="og:title"], meta[name="twitter:title"]').attr('content', meta.title);
    $('meta[property="og:url"]').attr('content', meta.canonical);
    $('link[rel="canonical"]').attr('href', meta.canonical);
    $('link[hreflang]').remove();
    for (const locale of ['zh', 'en']) {
      const link = $('<link rel="alternate">').attr({ hreflang: locale === 'en' ? 'en' : 'zh-CN',
        href: SITE_ORIGIN + languagePath(publicPathFor(rel), locale) });
      $('head').append(link);
    }
    if (lang === 'en') $('link[type="application/rss+xml"]').remove();
    $('script[type="application/ld+json"]').each((_, node) => {
      const schema = localizedSchema(JSON.parse($(node).text()), lang, metadataByPath);
      $(node).text('\n' + JSON.stringify(schema, null, 2).replace(/</g, '\\u003c') + '\n');
    });
    $('.detail-toc-item[data-target]').each((_, node) => {
      const el = $(node);
      const label = text($('[id]').filter((_, target) => $(target).attr('id') === el.attr('data-target')).find('h2').first().text());
      if (label) el.attr('data-label', label);
    });
    addLanguageNavigation($, lang, meta.canonical);
    addThemeRuntime($, lang);
    // Opt in before the blocking bootstrap; otherwise an early reveal can cancel the transition.
    $('head').prepend('<link rel="stylesheet" href="/css/page-transitions.css"><script src="/js/page-transitions.js" blocking="render"></script>');
    const heading = $('h1').first();
    if (heading.length) {
      if (!heading.attr('id')) heading.attr('id', 'page-heading');
      $('head').prepend($('<link rel="expect" blocking="render">').attr('href', '#' + heading.attr('id')));
    }
    $('html').attr('data-page-scene', rel.startsWith('blog/') || rel.startsWith('projects/') ? 'reading' : 'showcase');
    if (!$('#motionToggle').length) {
      const label = lang === 'en' ? 'Motion effects' : '动态效果';
      const hint = lang === 'en' ? 'Pause or resume decorative motion' : '暂停或恢复装饰动画';
      $('body').append($('<button type="button" class="page-motion-button" data-page-motion aria-pressed="true"></button>')
        .attr('title', hint).text(label));
    }
    addMusicRuntime($, lang, translations[lang]);
    $('head').append('<noscript><style>.reveal,.timeline-item,.detail-hero .detail-tag,.detail-title,.detail-subtitle,.detail-meta{opacity:1!important;transform:none!important;visibility:visible!important}.loader,#cursor,#cursorDot,.nav-hamburger,.page-motion-button{display:none!important}.lang-toggle{display:inline-flex!important}body,a,button{cursor:auto!important}</style></noscript>');
    output.set(lang === 'en' ? 'en/' + rel : rel, Buffer.from($.html()));
  }
  return output;
}

module.exports = { createLocalizedPages, readTranslations, translateDocument, mappedLink, localizedSchema };
