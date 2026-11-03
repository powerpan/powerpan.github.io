#!/usr/bin/env node
// Read the existing site's built bilingual pages. Only this template receives writes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');
const { generalizeSchools } = require('./content-privacy.cjs');
const { sanitizeProjectAsset } = require('./image-privacy.cjs');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const articlesOnly = args.includes('--articles-only');
if (args.some(arg => arg.startsWith('--') && arg !== '--articles-only')) throw new Error('Unknown import option');
const SOURCE = path.resolve(args.find(arg => !arg.startsWith('--')) || path.join(ROOT, '../..', '_site'));
const repo = path.dirname(SOURCE);
const topics = ['ai', 'agent', 'vision', 'architecture', 'observation', 'essay'];
const publicMetadata = {origin: 'https://erichz.site', pages: {}};
const read = (rel) => {
  const file = path.join(SOURCE, rel);
  const doc = load(fs.readFileSync(fs.existsSync(file) ? file : path.join(SOURCE, rel.replace(/^zh\//, '')), 'utf8'));
  const canonical = doc('link[rel="canonical"]').attr('href');
  if (canonical) {
    const url = new URL(canonical);
    if (url.origin !== publicMetadata.origin) throw new Error('Unexpected source origin: ' + canonical);
    publicMetadata.pages[url.pathname] = {
      schemas: doc('script[type="application/ld+json"]').map((_, e) => JSON.parse(doc(e).text())).get(),
    };
  }
  return doc;
};
const text = (scope, sel) => (typeof scope === 'function' ? scope(sel) : scope.find(sel)).first().text().replace(/\s+/g, ' ').trim();
const write = (rel, data) => {
  const target = path.join(ROOT, rel);
  if (articlesOnly) {
    if (rel.startsWith('public/') && rel !== 'public/feed.xml') return;
    if (rel.startsWith('content/')) {
      const current = JSON.parse(fs.readFileSync(target, 'utf8'));
      const incoming = JSON.parse(data);
      if (/^content\/(en|zh)\.json$/.test(rel)) {
        data = JSON.stringify({...current, articles:incoming.articles, topics:incoming.topics}, null, 2) + '\n';
      } else if (rel === 'content/seo.json') {
        const isJournal = url => /^\/(?:en\/)?blog(?:\/|$)/.test(url);
        const pages = Object.fromEntries(Object.entries(current.pages).filter(([url]) => !isJournal(url)));
        for (const [url, page] of Object.entries(incoming.pages)) if (isJournal(url)) pages[url] = page;
        data = JSON.stringify({...current, pages}, null, 2) + '\n';
      } else if (rel === 'content/source.json') {
        data = JSON.stringify({...current, articles:incoming.articles, assets:[...new Set([...current.assets, ...incoming.assets])].sort()}, null, 2) + '\n';
      }
    }
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
};
const first = read('en/index.html');
const projectList = read('en/projects/index.html');
const articleList = read('en/blog/index.html');
const projectSlugs = projectList('.project-list-card').map((_, e) => path.posix.basename(projectList(e).attr('href'))).get();
const articleSlugs = articleList('.blog-list-card').map((_, e) => path.posix.basename(articleList(e).attr('href'))).get();
const aliases = new Map();
const assetPaths = new Set();
function alias(from, to) {
  for (const p of [from, from + '.html', from + '/', from + '/index.html']) aliases.set(p, to);
}
for (const lang of ['en', 'zh']) {
  const pref = lang === 'en' ? '/en' : '';
  alias(pref || '', 'index.html');
  aliases.set(pref + '/', 'index.html');
  alias(pref + '/projects', 'work/index.html');
  alias(pref + '/blog', 'journal/index.html');
  projectSlugs.forEach((slug, i) => alias(pref + '/projects/' + slug, `work/project-${String(i + 1).padStart(2, '0')}.html`));
  articleSlugs.forEach((slug, i) => alias(pref + '/blog/' + slug, `journal/article-${String(i + 1).padStart(2, '0')}.html`));
  topics.forEach((slug, i) => alias(pref + '/blog/topics/' + slug, `journal/topics/topic-${i + 1}.html`));
}
// Chinese routes also exist below /zh in the built snapshot.
for (const [key, value] of [...aliases]) if (!key.startsWith('/en')) aliases.set('/zh' + key, value);
function pageLink(url, from) {
  if (!url || url.startsWith('#')) return url;
  const parsed = new URL(url, 'https://erichz.site' + from);
  if (parsed.origin !== 'https://erichz.site') return url;
  const target = aliases.get(parsed.pathname);
  if (target) return '@page/' + target + parsed.search + parsed.hash;
  if (parsed.pathname.startsWith('/assets/')) {
    assetPaths.add(parsed.pathname.slice(1));
    return '@asset/' + parsed.pathname.slice(1) + parsed.hash;
  }
  return parsed.href;
}
function mediaPath(url) {
  if (!url) return '';
  const p = new URL(url, 'https://erichz.site/').pathname.slice(1);
  if (!p.startsWith('assets/')) throw new Error('Unexpected media path: ' + url);
  if (!fs.existsSync(path.join(SOURCE, p))) throw new Error('Missing original media: ' + p);
  assetPaths.add(p);
  return '@asset/' + p;
}
const dimensions = new Map();
function mediaSize(url) {
  const rel = new URL(url, 'https://erichz.site/').pathname.slice(1);
  if (dimensions.has(rel)) return dimensions.get(rel);
  const data = fs.readFileSync(path.join(SOURCE, rel));
  let size;
  if (data.subarray(1, 4).toString() === 'PNG') size = [data.readUInt32BE(16), data.readUInt32BE(20)];
  else if (data[0] === 0xff && data[1] === 0xd8) {
    for (let pos = 2; pos + 8 < data.length;) {
      while (data[pos] === 0xff) pos++;
      const marker = data[pos++];
      if (marker === 0xd9 || marker === 0xda) break;
      const length = data.readUInt16BE(pos);
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        size = [data.readUInt16BE(pos + 5), data.readUInt16BE(pos + 3)]; break;
      }
      if (length < 2) break;
      pos += length;
    }
  } else if (data.subarray(8, 12).toString() === 'WEBP') {
    const kind = data.subarray(12, 16).toString();
    if (kind === 'VP8X') size = [1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3)];
    else if (kind === 'VP8 ') size = [data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff];
    else if (kind === 'VP8L') { const bits = data.readUInt32LE(21); size = [1 + (bits & 0x3fff), 1 + ((bits >>> 14) & 0x3fff)]; }
  } else if (/\.mp4$/i.test(rel)) {
    function boxSize(start, end) {
      for (let pos = start; pos + 8 <= end;) {
        let length = data.readUInt32BE(pos), header = 8;
        const kind = data.subarray(pos + 4, pos + 8).toString();
        if (length === 1) { length = Number(data.readBigUInt64BE(pos + 8)); header = 16; }
        if (!length) length = end - pos;
        if (length < header || pos + length > end) break;
        if (kind === 'tkhd' && length >= 16) {
          const w = data.readUInt32BE(pos + length - 8) / 65536;
          const h = data.readUInt32BE(pos + length - 4) / 65536;
          if (w > 0 && h > 0) return [w, h];
        }
        if (kind === 'moov' || kind === 'trak') { const found = boxSize(pos + header, pos + length); if (found) return found; }
        pos += length;
      }
    }
    size = boxSize(0, data.length);
  }
  if (!size || size.some(x => !Number.isFinite(x) || x <= 0)) throw new Error('Unable to read media dimensions: ' + rel);
  size = size.map(x => String(Math.round(x)));
  dimensions.set(rel, size);
  return size;
}
function cleanFragment(raw, from, { removeMedia = false, removeHeading = false } = {}) {
  const $ = load('<div id="content-root">' + raw + '</div>');
  $('script,style,noscript,canvas,button').remove();
  if (removeHeading) $('#content-root > h2,#content-root > .detail-section-title').first().remove();
  if (removeMedia) $('figure, picture, img, video, .sharp-map-scroll, .sharp-map-grid, .detail-tech-grid').remove();
  $('#content-root *').each((_, e) => {
    const el = $(e);
    if (el.attr('data-count')) el.text(el.attr('data-count'));
    for (const key of Object.keys(e.attribs || {})) {
      if (key.startsWith('data-') || key.startsWith('on') || key === 'style') el.removeAttr(key);
    }
    const cls = (el.attr('class') || '').split(/\s+/).filter(x => !/^reveal/.test(x));
    if (cls.length) el.attr('class', cls.join(' ')); else el.removeAttr('class');
    if (el.hasClass('detail-section')) e.name = 'section';
    if (el.attr('href')) el.attr('href', pageLink(el.attr('href'), from));
    for (const attr of ['src', 'poster']) if (el.attr(attr)) el.attr(attr, mediaPath(el.attr(attr)));
  });
  // Keep the semantic prose, code and tables; the new design supplies their appearance.
  $('#content-root .detail-code-body').each((_, e) => {
    if (!$(e).find('pre').length) {
      $(e).find('.ln,.line-num').remove();
      // Some older posts contain raw code between/after .line elements.
      // Read every child, rather than silently dropping those trailing lines.
      const code = $(e).contents().map((_, child) => {
        if ($(child).hasClass('line')) return $(child).text() + '\n';
        if (child.type === 'text') return child.data.trim() ? child.data : '';
        return $(child).text();
      }).get().join('').trimEnd();
      if (code) $(e).replaceWith($('<pre class="detail-code-body"></pre>').text(code));
    }
  });
  if (removeMedia) $('#content-root .detail-stats').each((_, e) => {
    const facts = $('<dl class="case-facts"></dl>');
    $(e).find('.detail-stat').each((_, stat) => {
      const item = $('<div></div>');
      item.append($('<dt class="meta"></dt>').text($(stat).find('.detail-stat-label').text()));
      item.append($('<dd></dd>').text($(stat).find('.detail-stat-num').text()));
      facts.append(item);
    });
    $(e).replaceWith(facts);
  });
  return $('#content-root').html().trim();
}
let dictionaries = {};
vm.runInNewContext(fs.readFileSync(path.join(repo, 'js/i18n/home.js'), 'utf8'), {
  window: { registerI18nChunk(value) { dictionaries = value; } }
});
const marquee = ['Vue', 'C++', 'Python', 'Java', 'JavaScript', 'PyTorch', 'YOLO', 'SAM', 'MySQL', 'Redis', 'Docker', 'Flink', 'Kafka', 'RESTful API', 'MyBatis-Plus'];
const toolkit = ['Vue', 'JavaScript', 'HTML/CSS', 'WXML', 'Python', 'Java', 'PHP', 'MySQL', 'PyTorch', 'YOLO', 'SAM', 'DETR', 'ONNX', 'C++', 'NLP', 'LLM', 'Stable Diffusion', 'Docker', 'Flink', 'Kafka', 'Redis', 'Spring Boot', 'FastAPI', 'Linux', 'Git', 'RESTful API', 'MyBatis-Plus'];
for (const lang of ['en', 'zh']) {
  const $ = read(`${lang}/index.html`), dict = dictionaries[lang];
  read(`${lang}/projects/index.html`);
  const sourcePrefix = lang === 'en' ? '/en/' : '/';
  const index = read(`${lang}/blog/index.html`);
  const articleCards = new Map(index('.blog-list-card').map((_, e) => [e]).get().map(e => [path.posix.basename(index(e).attr('href')), index(e)]));
  const articles = articleSlugs.map((slug, i) => {
    const doc = read(`${lang}/blog/${slug}.html`), card = articleCards.get(slug);
    const category = card.attr('data-category');
    const sections = doc('.blog-article-body .detail-section').map((j, s) => ({id:doc(s).attr('id') || '', title:text(doc(s), 'h2') || (lang === 'zh' ? '引言' : 'Introduction')})).get();
    return {
      num: i + 1, source_slug: slug, slug: `article-${String(i + 1).padStart(2, '0')}.html`,
      title: text(doc, 'h1'), title_html: doc('h1').html().replace(/<span class="hl">([\s\S]*?)<\/span>/g, '<em>$1</em>'),
      topic: topics.indexOf(category) + 1,
      lede: text(doc, '.detail-subtitle'), date: text(card, '.blog-list-date'),
      readtime: text(card, '.blog-list-readtime').replace(/ min\b/, lang === 'zh' ? ' 分钟' : ' min'), author: 'Eric Pan',
      body: cleanFragment(doc('.blog-article-body').html(), sourcePrefix + 'blog/' + slug),
      sections,
      related: doc('.related-post-card').map((_, a) => articleSlugs.indexOf(path.posix.basename(doc(a).attr('href'))) + 1).get().filter(n => n > 0)
    };
  });
  const projects = projectSlugs.map((slug, i) => {
    const doc = read(`${lang}/projects/${slug}.html`);
    const from = sourcePrefix + 'projects/' + slug;
    const images = [], videos = [];
    doc('img').each((_, e) => {
      const el = doc(e), src = el.attr('src');
      if (!src || images.some(x => x[0] === mediaPath(src))) return;
      const cap = el.closest('figure').find('figcaption').text().trim() || el.attr('alt') || '';
      const [width, height] = mediaSize(src);
      images.push([mediaPath(src), el.attr('alt') || '', width, height, cap]);
    });
    doc('video').each((_, e) => {
      const el = doc(e), src = el.attr('src') || el.find('source').attr('src');
      if (src) videos.push([mediaPath(src), mediaPath(el.attr('poster') || ''), el.closest('figure').find('figcaption').text().trim(), ...mediaSize(src)]);
    });
    if (!images.length) images.push([mediaPath('/assets/vfx/project-atlas.jpg'), lang === 'zh' ? '原站概念可视化' : 'Concept visualization from the original site', ...mediaSize('/assets/vfx/project-atlas.jpg'), lang === 'zh' ? '概念可视化' : 'Concept visualization']);
    const sectionNodes = doc('.detail-section');
    const sections = sectionNodes.map((j, e) => {
      const title = text(doc(e), 'h2,.detail-section-title');
      const body = cleanFragment(doc(e).html(), from, { removeMedia: true, removeHeading: true });
      return {title, body};
    }).get();
    // Source notes outside sections carry provenance/limitations and must survive the move.
    const notes = doc('.detail-content').children().filter((_, e) => !doc(e).hasClass('detail-section') && !doc(e).is('script,style,a')).map((_, e) => cleanFragment(doc.html(e), from, {removeMedia:true})).get().join('\n');
    if (notes && sections.length) sections[0].body = notes + '\n' + sections[0].body;
    const ctas = doc('a[href^="http"]').filter((_, e) => !doc(e).closest('.detail-section,footer,nav').length).map((_, e) => ({label:doc(e).text().trim(),href:doc(e).attr('href')})).get();
    if (ctas.length && sections.length) sections[0].body += '<p>' + ctas.map(a => '<a class="link-arrow" href="' + a.href + '" target="_blank" rel="noopener">' + a.label + '</a>').join(' ') + '</p>';
    return {
      num: i + 1, source_slug: slug, slug: `project-${String(i + 1).padStart(2, '0')}.html`,
      title: text(doc, 'h1'), tag: text(doc, '.detail-tag'), lede: text(doc, '.detail-subtitle'),
      meta: doc('.detail-meta-item').map((_, e) => [[text(doc(e), '.detail-meta-label'), text(doc(e), '.detail-meta-value')]]).get(),
      images, videos, sections,
      badges: doc('.detail-tech-badge').map((_, e) => doc(e).text().trim()).get(),
      year: text(doc, '[data-project-year]') || '—'
    };
  });
  const education = $('.next-card-status').map((_, e) => ({
    status: text($(e), '.next-status-badge'), title: text($(e), '.next-status-title'),
    degree: text($(e), '.next-status-sub'), desc: text($(e), '.next-status-desc'),
    tags: $(e).find('.next-status-tags span').map((_, e) => $(e).text()).get()
  })).get();
  const home = {
    name: text($, '.hero-title,.hero-name').replace(/\.$/, '') || 'Eric',
    role: lang === 'zh' ? '全栈开发与 AI 视觉' : text($, '.hero-badge'), roles: dict.typing_roles,
    about_heading: cleanFragment($('.about-heading').html().replace(/<br\s*\/?\s*>/g, ' '), sourcePrefix).replace(/<span class="hl">([\s\S]*?)<\/span>/g, '<em>$1</em>'),
    bio: text($, '.about-text').replace(/^Studying Software Engineering at South China University of Technology\./, 'Pursuing an MSc in Artificial Intelligence at HKUST, with a background in Software Engineering from South China University of Technology.').replace(/^华南理工大学软件工程专业在读，/, '华南理工大学软件工程本科毕业，现于香港科技大学攻读人工智能硕士，'),
    stats: $('.stat').map((_, e) => ({value: $(e).find('[data-count]').attr('data-count'), label:text($(e), '.stat-label')})).get(),
    timeline_subtitle: text($, '.timeline-subtitle'),
    experiences: $('.timeline-item').map((_, e) => ({date:text($(e), '.timeline-year'), title:text($(e), '.timeline-role'), org:text($(e), '.timeline-company'), desc:text($(e), '.timeline-desc'), tags:$(e).find('.timeline-tag').map((_, t) => $(t).text()).get()})).get(),
    featured: $('.project-card').map((_, e) => projectSlugs.indexOf(path.posix.basename($(e).attr('href'))) + 1).get().filter(n => n > 0),
    tech_subtitle: text($, '.tech-subtitle'), toolkit, marquee,
    fields: $('.atlas-panel').map((_, e) => ({title:text($(e), 'h3'), tools:$(e).find('.atlas-tools,dd').map((_, x) => $(x).text()).get().join(' · '), desc:text($(e), 'p:not(.atlas-tools)'), links:$(e).find('a').map((_, a)=>({label:$(a).text().trim(), href:pageLink($(a).attr('href'), sourcePrefix)})).get()})).get(),
    skill_groups: $('.skill-category').map((_, e) => ({title:text($(e), '.skill-cat-title > span'), skills:$(e).find('.skill-bar-item').map((_, s) => ({name:text($(s), '.skill-bar-name'), value:$(s).find('.skill-bar-fill').attr('data-width')})).get()})).get(),
    code: {title:cleanFragment($('#code h3').html(), sourcePrefix).replace(/<span class="hl">([\s\S]*?)<\/span>/g,'<em>$1</em>'), desc:text($, '#code p'), tags:$('.featured-code-tags span').map((_, e)=>$(e).text()).get(), file:text($, '.code-window-title'), html:$('.code-line').map((_, e)=>$(e).html()).get().join('\n').replaceAll('code-kw','k').replaceAll('code-cm','c').replaceAll('code-num','s').replace(/ data-i18n="[^"]*"/g,'')},
    activity: {subtitle:text($, '.github-subtitle'), stats:$('.gh-stat').slice(0,3).map((_, e)=>({value:$(e).find('[data-count]').attr('data-count'), label:text($(e), '.gh-stat-label')})).get()},
    quotes: $('.testimonial-card').map((_, e)=>({text:text($(e), '.testimonial-text'), name:text($(e), '.testimonial-name'), role:text($(e), '.testimonial-role')})).get(),
    education, next_subtitle:text($, '.next-subtitle'), milestones:$('.progress-milestones .milestone').map((_, e)=>({text:$(e).text().trim().replace(/^[✓◉]\s*/,''), done:$(e).hasClass('done')})).get(),
    contact:{heading:lang === 'zh' ? '有想法？让我们一起<em>实现它。</em>' : 'Got an idea? Let’s <em>build it together.</em>', desc:text($, '.contact-subtitle')},
    social:[{label:'GitHub',href:'https://github.com/powerpan'}, {label:lang === 'zh' ? '项目' : 'Work',href:'@page/work/index.html'}, {label:lang === 'zh' ? '文章' : 'Journal',href:'@page/journal/index.html'}, {label:lang === 'zh' ? '联系' : 'Contact',href:'@page/index.html#contact'}]
  };
  // The archive is the current project inventory; the old homepage counter lagged behind it.
  home.stats[0].value = String(projects.length);
  const topicInfo = topics.map((slug, i) => {
    const doc = read(`${lang}/blog/topics/${slug}.html`);
    const count = articles.filter(article => article.topic === i + 1).length;
    return {num:i+1, slug, label: text(index, `[data-filter="${slug}"]`).replace(/\d+\s*$/, '').trim() || dict['blog_tag_'+slug], desc:lang === 'zh' ? `专题归档 · ${count} 篇文章` : text(doc, '.blog-listing-header > p')};
  });
  write(`content/${lang}.json`, JSON.stringify({lang, name:home.name, home:generalizeSchools(home, lang), topics:topicInfo, projects, articles},null,2)+'\n');
  console.log(`${lang}: ${projects.length} projects, ${articles.length} articles, ${home.experiences.length} experiences`);
}
let copiedAssets = 0;
for (const p of assetPaths) {
  const target = path.join(ROOT, p);
  if (articlesOnly && fs.existsSync(target)) continue;
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, sanitizeProjectAsset(p, fs.readFileSync(path.join(SOURCE, p))));
  copiedAssets++;
}
write('content/source.json', JSON.stringify({source:'Existing bilingual site build', locales:['en','zh'], projects:projectSlugs, articles:articleSlugs, assets:[...assetPaths].sort(), note:'Content copied from the existing site. No new personal claims or testimonials generated. Main-site files are read only.'},null,2)+'\n');
const sitemap = load(fs.readFileSync(path.join(SOURCE, 'sitemap.xml'), 'utf8'), {xmlMode:true});
sitemap('url').each((_, e) => {
  const pathname = new URL(sitemap(e).find('loc').text()).pathname;
  const lastmod = sitemap(e).find('lastmod').text();
  if (lastmod && publicMetadata.pages[pathname]) publicMetadata.pages[pathname].lastmod = lastmod;
});
write('content/seo.json', JSON.stringify(publicMetadata,null,2)+'\n');
for (const rel of ['feed.xml', 'assets/og-default.svg', '90b30d4da25d4c18ddb893132159d3cd.txt']) {
  const file = path.join(SOURCE, rel);
  if (fs.existsSync(file)) write('public/' + rel, fs.readFileSync(file));
}
console.log(`Copied ${copiedAssets} original media files into the template${articlesOnly ? '; kept existing personal/project content and media' : ''}.`);
