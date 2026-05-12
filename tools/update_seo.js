#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

const SITE_ORIGIN = 'https://erickk.site';
const SITE_NAME = 'Eric';
const AUTHOR_NAME = 'Eric Pan';
const DEFAULT_DESCRIPTION = 'Eric 的 AI 工程、计算机视觉、Agent 架构与系统设计技术博客。';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/og-default.svg`;
const RSS_LIMIT = 20;

const categories = [
  { id: 'ai', label: 'AI 工程', enLabel: 'AI Engineering' },
  { id: 'agent', label: 'Agent 自动化', enLabel: 'Agent Automation' },
  { id: 'vision', label: '视觉多模态', enLabel: 'Vision & Multimodal' },
  { id: 'architecture', label: '系统架构', enLabel: 'System Architecture' },
  { id: 'observation', label: '技术观察', enLabel: 'Tech Observation' },
  { id: 'essay', label: '社会随笔', enLabel: 'Social Essays' },
];

const categoryById = new Map(categories.map((category) => [category.id, category]));
const changedFiles = [];
const outOfDateFiles = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, content) {
  const file = path.join(root, rel);
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old === content) return;

  if (checkOnly) {
    outOfDateFiles.push(rel);
    return;
  }

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  changedFiles.push(rel);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirst(source, regex) {
  const match = source.match(regex);
  return match ? stripTags(match[1]) : '';
}

function extractAttr(source, regex) {
  const match = source.match(regex);
  return match ? match[1].trim() : '';
}

function toIsoDate(dateText) {
  if (!dateText) return '2026-01-01';
  const normalized = dateText.replace(/\./g, '-');
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  if (/^\d{4}-\d{2}$/.test(normalized)) return `${normalized}-01`;
  return '2026-01-01';
}

function toRssDate(dateText) {
  return new Date(`${toIsoDate(dateText)}T00:00:00Z`).toUTCString();
}

function canonicalFor(rel) {
  if (rel === 'index.html') return `${SITE_ORIGIN}/`;
  if (rel === 'blog/index.html') return `${SITE_ORIGIN}/blog/`;
  if (rel === 'projects/index.html') return `${SITE_ORIGIN}/projects/`;
  return `${SITE_ORIGIN}/${rel.replace(/\\/g, '/')}`;
}

function pathForUrl(rel) {
  return new URL(canonicalFor(rel)).pathname;
}

function readHeadMetadata(rel) {
  const html = read(rel);
  const title = extractFirst(html, /<title>([\s\S]*?)<\/title>/i)
    .replace(/\s+—\s+Eric(?:'s Project)?$/i, '')
    .trim();
  const description = extractAttr(html, /<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || DEFAULT_DESCRIPTION;
  return { title, description };
}

function collectBlogPosts(blogIndexHtml) {
  const posts = [];
  const cardRe = /(\s*<!--\s*(\d+)\s*-->\s*<a href="([^"]+)" class="blog-list-card[^"]*"[^>]*data-category="([^"]+)"[^>]*>[\s\S]*?<\/a>)/g;
  let match;
  while ((match = cardRe.exec(blogIndexHtml))) {
    const [block, cardHtml, num, href, category] = match;
    const titleKey = extractAttr(block, /class="blog-list-title"[^>]*data-i18n="([^"]+)"/);
    const descKey = extractAttr(block, /class="blog-list-desc"[^>]*data-i18n="([^"]+)"/);
    const title = extractFirst(block, /<div class="blog-list-title"[^>]*>([\s\S]*?)<\/div>/);
    const description = extractFirst(block, /<div class="blog-list-desc"[^>]*>([\s\S]*?)<\/div>/);
    const tag = extractFirst(block, /<span class="blog-list-tag"[^>]*>([\s\S]*?)<\/span>/);
    const date = extractFirst(block, /<span class="blog-list-date">([\s\S]*?)<\/span>/);
    const readtime = extractFirst(block, /<span class="blog-list-readtime">([\s\S]*?)<\/span>/);
    const slug = path.basename(href, '.html');
    posts.push({
      cardHtml,
      num: Number(num),
      href,
      rel: `blog/${href}`,
      slug,
      category,
      titleKey,
      descKey,
      title,
      description,
      tag: tag || categoryById.get(category)?.label || category,
      date,
      isoDate: toIsoDate(date),
      readtime,
      url: canonicalFor(`blog/${href}`),
    });
  }
  return posts;
}

function normalizeCardBlock(post, index, hrefPrefix = '') {
  const number = String(index + 1).padStart(2, '0');
  return post.cardHtml
    .replace(/<!--\s*\d+\s*-->/, `<!-- ${index + 1} -->`)
    .replace(/<div class="blog-list-num">[^<]*<\/div>/, `<div class="blog-list-num">${number}</div>`)
    .replace(/href="[^"]+"/, `href="${hrefPrefix}${post.href}"`);
}

function buildFilterChips(activeId, hrefPrefix = '') {
  const total = currentPosts.length;
  const countFor = (id) => id === 'all'
    ? total
    : currentPosts.filter((post) => post.category === id).length;

  const items = [
    { id: 'all', key: 'blog_filter_all', label: '全部', href: `${hrefPrefix}index.html` },
    ...categories.map((category) => ({
      id: category.id,
      key: `blog_filter_${category.id}`,
      label: category.label,
      href: `${hrefPrefix}topics/${category.id}.html`,
    })),
  ];

  return `            <div class="blog-filter-chips" id="blogFilterChips" role="tablist" aria-label="Blog topic filters">
${items.map((item) => `                <a class="blog-filter-chip${item.id === activeId ? ' active' : ''}" href="${item.href}" data-filter="${item.id}">
                    <span data-i18n="${item.key}">${item.label}</span>
                    <span class="blog-filter-chip-count">${countFor(item.id)}</span>
                </a>`).join('\n')}
            </div>`;
}

function replaceFilterChips(html, activeId, hrefPrefix = '') {
  return html.replace(
    /            <div class="blog-filter-chips" id="blogFilterChips"[\s\S]*?            <\/div>\n\n            <div class="blog-filter-summary">/,
    `${buildFilterChips(activeId, hrefPrefix)}\n\n            <div class="blog-filter-summary">`
  );
}

function injectSeoBlock(html, meta) {
  let out = html
    .replace(/\n?\s*<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/g, '')
    .replace(/\n?\s*<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/\n?\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\n?\s*<link\s+rel=["']alternate["'][^>]*application\/rss\+xml[^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+property=["']article:[^"']+["'][^>]*>/gi, '')
    .replace(/\n?\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, '');

  const json = JSON.stringify(meta.jsonLd, null, 2).replace(/</g, '\\u003c');
  const seoBlock = `    <!-- SEO:START -->
    <meta name="description" content="${escapeHtml(meta.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${meta.canonical}">
    <link rel="alternate" type="application/rss+xml" title="Eric Blog RSS" href="${SITE_ORIGIN}/feed.xml">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:type" content="${meta.ogType}">
    <meta property="og:title" content="${escapeHtml(meta.title)}">
    <meta property="og:description" content="${escapeHtml(meta.description)}">
    <meta property="og:url" content="${meta.canonical}">
    <meta property="og:image" content="${meta.image || DEFAULT_IMAGE}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(meta.title)}">
    <meta name="twitter:description" content="${escapeHtml(meta.description)}">
    <meta name="twitter:image" content="${meta.image || DEFAULT_IMAGE}">${meta.articleDate ? `
    <meta property="article:published_time" content="${meta.articleDate}">
    <meta property="article:modified_time" content="${meta.articleModified || meta.articleDate}">` : ''}
    <script type="application/ld+json">
${json}
    </script>
    <!-- SEO:END -->`;

  return out.replace(/(<title>[\s\S]*?<\/title>)/i, `$1\n${seoBlock}`);
}

function personSchema() {
  return {
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: SITE_ORIGIN,
    sameAs: ['https://github.com/powerpan'],
  };
}

function collectionSchema(title, description, canonical, posts) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    inLanguage: ['zh-CN', 'en'],
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: post.url,
        name: post.title,
      })),
    },
  };
}

function seoMetaForPage(rel, kind, override = {}) {
  const head = readHeadMetadata(rel);
  const canonical = override.canonical || canonicalFor(rel);
  const title = override.title || head.title || SITE_NAME;
  const description = override.description || head.description || DEFAULT_DESCRIPTION;

  let jsonLd;
  let ogType = 'website';
  let articleDate = '';

  if (kind === 'home') {
    jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_ORIGIN,
        description,
        inLanguage: ['zh-CN', 'en'],
        publisher: personSchema(),
      },
      {
        '@context': 'https://schema.org',
        ...personSchema(),
        jobTitle: 'Full-Stack & AI Vision Developer',
      },
    ];
  } else if (kind === 'blog-list') {
    jsonLd = collectionSchema(title, description, canonical, currentPosts);
  } else if (kind === 'topic') {
    jsonLd = collectionSchema(title, description, canonical, override.posts || []);
  } else if (kind === 'article') {
    const post = currentPosts.find((item) => item.rel === rel);
    const published = post?.isoDate || override.isoDate || '2026-01-01';
    ogType = 'article';
    articleDate = published;
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post?.title || title,
      description: post?.description || description,
      url: canonical,
      mainEntityOfPage: canonical,
      datePublished: published,
      dateModified: published,
      author: personSchema(),
      publisher: personSchema(),
      image: DEFAULT_IMAGE,
      articleSection: post?.tag,
      keywords: [post?.tag, post?.category].filter(Boolean),
      inLanguage: 'zh-CN',
    };
  } else if (kind === 'project') {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      description,
      url: canonical,
      author: personSchema(),
      image: DEFAULT_IMAGE,
      inLanguage: ['zh-CN', 'en'],
    };
  } else {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonical,
      inLanguage: ['zh-CN', 'en'],
    };
  }

  return {
    title,
    description,
    canonical,
    ogType,
    image: DEFAULT_IMAGE,
    articleDate,
    articleModified: articleDate,
    jsonLd,
  };
}

function ensureBlogListScript(html) {
  if (html.includes('../js/i18n/blog-list.js')) return html;
  return html.replace(
    /<script src="\.\.\/js\/i18n\/core\.js"><\/script>/,
    '<script src="../js/i18n/core.js"></script>\n    <script src="../js/i18n/blog-list.js"></script>'
  );
}

function buildRelatedPosts(post) {
  const sameCategory = currentPosts.filter((candidate) => candidate.category === post.category && candidate.slug !== post.slug);
  const fallback = currentPosts.filter((candidate) => candidate.category !== post.category && candidate.slug !== post.slug);
  return [...sameCategory, ...fallback].slice(0, 3);
}

function relatedPostsHtml(post) {
  const related = buildRelatedPosts(post);
  if (!related.length) return '';

  return `    <!-- RELATED POSTS:START -->
    <section class="related-posts reveal" aria-labelledby="relatedPostsTitle">
        <div class="related-posts-kicker" data-i18n="related_posts_kicker">RELATED</div>
        <h2 id="relatedPostsTitle" data-i18n="related_posts_title">相关文章</h2>
        <div class="related-posts-grid">
${related.map((item) => `            <a href="${item.href}" class="related-post-card" data-hover>
                <span class="related-post-tag" data-i18n="blog_tag_${item.category}">${item.tag}</span>
                <h3 data-i18n="${item.titleKey}">${escapeHtml(item.title)}</h3>
                <p data-i18n="${item.descKey}">${escapeHtml(item.description)}</p>
                <span class="related-post-more" data-i18n="related_posts_more">继续阅读</span>
            </a>`).join('\n')}
        </div>
    </section>
    <!-- RELATED POSTS:END -->`;
}

function injectRelatedPosts(html, post) {
  let out = html.replace(/\n?\s*<!-- RELATED POSTS:START -->[\s\S]*?<!-- RELATED POSTS:END -->/g, '');
  const block = relatedPostsHtml(post);
  if (!block) return out;
  return out.replace(/(\n\s*<\/article>)/, `$1\n\n${block}`);
}

function enhanceBlogIndex(html) {
  let out = replaceFilterChips(html, 'all', '');
  out = out.replace(
    /(<div class="blog-filter-stat-value" id="blogFilterCount">)[^<]*(<\/div>)/,
    `$1${currentPosts.length}$2`
  );
  out = out.replace(
    /(<div class="blog-filter-stat-meta" id="blogFilterMeta">)[^<]*(<\/div>)/,
    `$1${currentPosts.length} / ${currentPosts.length}$2`
  );
  return out;
}

function buildTopicPage(blogIndexHtml, category) {
  const topicPosts = currentPosts.filter((post) => post.category === category.id);
  let html = blogIndexHtml;

  html = injectSeoBlock(html, seoMetaForPage('blog/index.html', 'topic', {
    title: `${category.label} — Eric`,
    description: `Eric 的 ${category.label} 专题归档，收录相关技术文章、工程复盘与观点笔记。`,
    canonical: `${SITE_ORIGIN}/blog/topics/${category.id}.html`,
    posts: topicPosts,
  }));

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${category.label} — Eric</title>`);
  html = html.replace('<body>', `<body data-page-type="topic" data-initial-filter="${category.id}">`);
  html = html.replace(/<h1 data-i18n="blog_list_title">[\s\S]*?<\/h1>/, `<h1>// ${category.label}</h1>`);
  html = html.replace(/<p data-i18n="blog_list_sub">[\s\S]*?<\/p>/, `<p>Topic Archive — ${topicPosts.length} articles</p>`);
  html = html.replace(
    /(<div class="blog-filter-stat-value" id="blogFilterCount">)[^<]*(<\/div>)/,
    `$1${topicPosts.length}$2`
  );
  html = html.replace(
    /(<div class="blog-filter-stat-meta" id="blogFilterMeta">)[^<]*(<\/div>)/,
    `$1${topicPosts.length} / ${topicPosts.length}$2`
  );
  html = replaceFilterChips(html, category.id, '');

  const cards = topicPosts.map((post, index) => normalizeCardBlock(post, index, '../')).join('\n');
  html = html.replace(
    /(<div class="blog-listing-grid" id="blogListingGrid">)[\s\S]*?(?=\n\s*<div class="blog-empty-state")/,
    `$1\n${cards}`
  );

  html = html
    .replace(/\.\.\/css\//g, '../../css/')
    .replace(/\.\.\/js\//g, '../../js/')
    .replace(/\.\.\/index\.html/g, '../../index.html')
    .replace(/href="index\.html"/g, 'href="../index.html"')
    .replace(/href="topics\/([^"]+)"/g, 'href="$1"');

  return html;
}

function generateRobots() {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /blog-drafts/
Disallow: /rag-articles/
Disallow: /tools/
Disallow: /transfer/
Disallow: /BLOG_TOPIC_POOL.md
Disallow: /NEW_BLOG_POST.md
Disallow: /PROJECT_ASSET.md
Disallow: /PROJECT_ASSET_PROMPT.md
Disallow: /QWEN.md
Disallow: /RAG_BLOG_WORKFLOW.md

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}

function generateSitemap(projectPages) {
  const topicEntries = categories.map((category) => ({
    loc: `${SITE_ORIGIN}/blog/topics/${category.id}.html`,
    lastmod: currentPosts.find((post) => post.category === category.id)?.isoDate,
  }));

  const entries = [
    { loc: `${SITE_ORIGIN}/`, lastmod: currentPosts[0]?.isoDate },
    { loc: `${SITE_ORIGIN}/blog/`, lastmod: currentPosts[0]?.isoDate },
    ...topicEntries,
    ...currentPosts.map((post) => ({ loc: post.url, lastmod: post.isoDate })),
    { loc: `${SITE_ORIGIN}/projects/` },
    ...projectPages
      .filter((rel) => rel !== 'projects/index.html')
      .map((rel) => ({ loc: canonicalFor(rel) })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `
    <lastmod>${entry.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;
}

function generateFeed() {
  const items = currentPosts.slice(0, RSS_LIMIT).map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid>${escapeXml(post.url)}</guid>
      <pubDate>${toRssDate(post.date)}</pubDate>
      <category>${escapeXml(post.tag)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Eric Blog</title>
    <link>${SITE_ORIGIN}/blog/</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${toRssDate(currentPosts[0]?.date)}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function listHtmlFiles(dirRel) {
  const dir = path.join(root, dirRel);
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => `${dirRel}/${entry.name}`)
    .sort();
}

let currentPosts = [];

function main() {
  const originalBlogIndex = read('blog/index.html');
  currentPosts = collectBlogPosts(originalBlogIndex);
  if (!currentPosts.length) {
    throw new Error('No blog posts found in blog/index.html');
  }

  write('robots.txt', generateRobots());
  write('assets/og-default.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Eric Blog</title>
  <desc id="desc">AI engineering, vision, agent architecture, and system design notes by Eric Pan.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05070a"/>
      <stop offset="0.55" stop-color="#0b1420"/>
      <stop offset="1" stop-color="#07110d"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00ff88"/>
      <stop offset="1" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <path d="M0 520 C220 450 350 610 560 520 C760 430 900 470 1200 360 L1200 630 L0 630 Z" fill="#00ff88" opacity="0.08"/>
  <g fill="none" stroke="#00ff88" opacity="0.16">
    <path d="M120 130 H1080"/>
    <path d="M120 500 H1080"/>
    <path d="M200 80 V550"/>
    <path d="M1000 80 V550"/>
  </g>
  <text x="120" y="185" fill="#00ff88" font-family="Arial, Helvetica, sans-serif" font-size="34" letter-spacing="4">ERIC PAN</text>
  <text x="120" y="315" fill="#f5f7fb" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="700">AI Engineering Notes</text>
  <text x="120" y="390" fill="#9fb2c7" font-family="Arial, Helvetica, sans-serif" font-size="34">Vision · Agent Architecture · System Design</text>
  <rect x="120" y="455" width="310" height="54" rx="10" fill="url(#accent)" opacity="0.92"/>
  <text x="148" y="491" fill="#03100a" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">erickk.site</text>
</svg>
`);

  let blogIndex = enhanceBlogIndex(originalBlogIndex);
  blogIndex = injectSeoBlock(blogIndex, seoMetaForPage('blog/index.html', 'blog-list'));
  write('blog/index.html', blogIndex);

  for (const category of categories) {
    write(`blog/topics/${category.id}.html`, buildTopicPage(blogIndex, category));
  }

  let home = read('index.html');
  home = injectSeoBlock(home, seoMetaForPage('index.html', 'home', {
    title: 'Eric — Full-Stack & AI Vision Developer',
    description: DEFAULT_DESCRIPTION,
  }));
  write('index.html', home);

  for (const post of currentPosts) {
    let html = read(post.rel);
    html = injectSeoBlock(html, seoMetaForPage(post.rel, 'article', {
      title: `${post.title} — Eric`,
      description: post.description,
      isoDate: post.isoDate,
    }));
    html = ensureBlogListScript(html);
    html = injectRelatedPosts(html, post);
    write(post.rel, html);
  }

  const projectPages = listHtmlFiles('projects');
  for (const rel of projectPages) {
    let html = read(rel);
    html = injectSeoBlock(html, seoMetaForPage(rel, 'project'));
    write(rel, html);
  }

  write('sitemap.xml', generateSitemap(projectPages));
  write('feed.xml', generateFeed());

  if (checkOnly) {
    if (outOfDateFiles.length) {
      console.error('SEO outputs are out of date:');
      for (const rel of outOfDateFiles) console.error(`  - ${rel}`);
      process.exit(1);
    }
    console.log('SEO outputs are up to date.');
    return;
  }

  if (changedFiles.length) {
    console.log('Updated SEO outputs:');
    for (const rel of changedFiles) console.log(`  - ${rel}`);
  } else {
    console.log('SEO outputs already up to date.');
  }
}

main();
