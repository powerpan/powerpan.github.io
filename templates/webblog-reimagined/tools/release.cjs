#!/usr/bin/env node
// Production packaging stays inside this template. It never runs the main-site build.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {load} = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const readJSON = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const cleanPath = rel => ('/' + rel).replace(/\/index\.html$/, '/').replace(/\.html$/, '');
const xml = value => String(value).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function inventory() {
  const entries = [];
  for (const lang of ['en', 'zh']) {
    const data = readJSON(`content/${lang}.json`);
    const preview = lang === 'zh' ? 'zh/' : '';
    const published = lang === 'en' ? 'en/' : '';
    const add = (input, file, key, kind, item) => entries.push({lang, input:preview+input, file, url:cleanPath(file), key, kind, item});
    add('index.html', lang === 'en' ? 'en/index.html' : 'zh/index.html', 'home', 'home');
    add('work/index.html', published+'projects/index.html', 'projects', 'projects');
    add('journal/index.html', published+'blog/index.html', 'journal', 'journal');
    for (const topic of data.topics) add(`journal/topics/topic-${topic.num}.html`, `${published}blog/topics/${topic.slug}.html`, 'topic:'+topic.slug, 'topic', topic);
    for (const article of data.articles) add('journal/'+article.slug, `${published}blog/${article.source_slug}.html`, 'article:'+article.source_slug, 'article', article);
    for (const project of data.projects) add('work/'+project.slug, `${published}projects/${project.source_slug}.html`, 'project:'+project.source_slug, 'project', project);
  }
  if (new Set(entries.map(e=>e.file)).size !== entries.length) throw new Error('Duplicate production URL');
  return entries;
}

function redirectsFor(entries) {
  const rules = new Map([['/', {to:'/en/', status:302}], ['/index.html', {to:'/en/', status:302}]]);
  const add = (from, to, status=301) => {
    if (!from.startsWith('/') || from === to || rules.has(from)) return;
    rules.set(from, {to, status});
  };
  for (const entry of entries) {
    // Preserve the old canonical URLs, and normalize alternate spellings in one hop.
    const canonicalVariants = entry.url.endsWith('/')
      ? [entry.url.slice(0,-1), entry.url+'index.html']
      : [entry.url+'.html', entry.url+'/', entry.url+'/index.html'];
    for (const alias of canonicalVariants) add(alias, entry.url);
    const previewURL = cleanPath(entry.input);
    for (const alias of ['/'+entry.input, previewURL, previewURL.endsWith('/') ? previewURL.slice(0,-1) : previewURL+'/']) add(alias, entry.url);
    if (entry.lang === 'zh' && entry.kind !== 'home') {
      for (const alias of ['/zh'+entry.url, '/zh/'+entry.file]) add(alias, entry.url);
    }
  }
  if (rules.size > 2000) throw new Error('Pages static redirect limit exceeded');
  return rules;
}

function transformPage(entry, entries, metadata, origin) {
  const $ = load(fs.readFileSync(path.join(ROOT, entry.input), 'utf8'));
  const sourceRoutes = new Map();
  for (const e of entries) {
    sourceRoutes.set('/'+e.input, e.url);
    sourceRoutes.set(cleanPath(e.input), e.url);
  }
  $('[href],[src],[poster],[data-preview]').each((_, node) => {
    const el = $(node);
    for (const attr of ['href','src','poster','data-preview']) {
      const value = el.attr(attr);
      if (!value || value.startsWith('#') || /^(?:data:|mailto:|tel:|javascript:)/i.test(value)) continue;
      const target = new URL(value, origin+'/'+entry.input);
      if (target.origin !== origin) continue;
      el.attr(attr, (sourceRoutes.get(target.pathname) || target.pathname) + target.search + target.hash);
    }
  });
  if (entry.kind === 'home') {
    $('.hero').attr('id','hero');
    $('.skills').attr('id','skills').css('scroll-margin-top','100px');
    // Keep both the established main-site fragments and the design-preview fragments.
    for (const [selector,id] of [['#work','projects'],['#journal','blog']]) {
      $(selector).prepend(`<span id="${id}" aria-hidden="true" style="position:absolute;top:0;left:0;width:0;height:0;overflow:hidden"></span>`);
    }
  }
  const canonical = origin + entry.url;
  const pair = entries.filter(e=>e.key===entry.key);
  if (pair.length !== 2) throw new Error('Missing language pair: '+entry.input);
  const title = $('title').text();
  const description = $('meta[name="description"]').attr('content');
  if (!description) throw new Error('Missing page description: '+entry.input);
  $('meta[name="robots"],link[rel="canonical"],link[hreflang],meta[property^="og:"],meta[property^="article:"],meta[name^="twitter:"],script[type="application/ld+json"]').remove();
  const meta = (name, value, property=false) => $('head').append($('<meta>').attr(property?'property':'name',name).attr('content',value));
  $('head').append($('<link rel="canonical">').attr('href',canonical));
  for (const other of pair) $('head').append($('<link rel="alternate">').attr('hreflang',other.lang==='zh'?'zh-CN':'en').attr('href',origin+other.url));
  meta('robots','index, follow');
  meta('og:type',entry.kind==='article'?'article':'website',true);
  meta('og:title',title,true); meta('og:description',description,true); meta('og:url',canonical,true);
  meta('og:site_name','Eric',true); meta('og:locale',entry.lang==='en'?'en_US':'zh_CN',true);
  meta('og:locale:alternate',entry.lang==='en'?'zh_CN':'en_US',true);
  meta('og:image',origin+'/assets/og-default.png',true);
  meta('og:image:width','1200',true); meta('og:image:height','630',true);
  meta('og:image:alt','Eric Blog — AI Engineering Notes',true);
  meta('twitter:card','summary_large_image'); meta('twitter:title',title);
  meta('twitter:description',description); meta('twitter:image',origin+'/assets/og-default.png');
  const seo = metadata.pages[entry.url];
  if (!seo?.schemas?.length) throw new Error('Missing original structured metadata: '+entry.url);
  for (const original of seo.schemas) {
    const schema = JSON.parse(JSON.stringify(original).replaceAll(metadata.origin+'/assets/og-default.svg',origin+'/assets/og-default.png'));
    if (schema['@type'] !== 'Person') {
      schema.url = canonical; schema.inLanguage = entry.lang==='zh'?'zh-CN':'en'; schema.description = description;
      if (entry.kind==='article') {
        if (!schema.datePublished) throw new Error('Missing original publication date: '+entry.url);
        schema.headline = entry.item.title; schema.mainEntityOfPage = canonical;
        meta('article:published_time',schema.datePublished,true);
        if (schema.dateModified) meta('article:modified_time',schema.dateModified,true);
      }
    }
    const script = $('<script type="application/ld+json"></script>');
    script.text(JSON.stringify(schema).replace(/</g,'\\u003c')); $('head').append(script);
  }
  if (entry.lang==='zh') $('head').append('<link rel="alternate" type="application/rss+xml" title="Eric Blog RSS" href="/feed.xml">');
  // Cloudflare's email protection otherwise mistakes this model metric for an address.
  // The documented comments affect CDN processing only, preserving text and layout.
  $('.case-facts .meta').each((_,el)=>{
    if ($(el).text()==='mAP@0.5') $(el).html('<!--email_off-->mAP@0.5<!--/email_off-->');
  });
  // A disabled/failed script must not hide the article or trap the pointer.
  $('head').append('<noscript><style>[data-motion="on"] .rise{opacity:1!important;transform:none!important}[data-motion="on"] .split-inner{transform:none!important}.loader,.cursor,.menu-button,[data-theme-toggle],[data-motion-toggle]{display:none!important}.masthead-meta{display:flex!important}.masthead-meta>span{display:none!important}body,a,button{cursor:auto!important}@media(max-width:820px){.masthead-right{display:none!important}}</style></noscript>');
  return $.html();
}

function errorPage(home, lang) {
  const $ = load(home);
  const zh = lang==='zh';
  $('title').text(zh?'页面不存在 — Eric':'Page not found — Eric');
  $('meta[name="robots"]').attr('content','noindex, nofollow');
  $('link[rel="canonical"],link[hreflang],meta[property^="og:"],meta[property^="article:"],meta[name^="twitter:"],script[type="application/ld+json"],link[type="application/rss+xml"]').remove();
  $('meta[name="description"]').attr('content',zh?'请返回首页或浏览文章与项目。':'Return home or browse the journal and projects.');
  $('.loader').next('script').remove(); $('.loader').remove();
  $('main').html(`<div class="page"><header class="page-head"><p class="kicker">404</p><h1>${zh?'页面<em>不存在</em>':'Page <em>not found</em>'}</h1><p>${zh?'请返回首页或浏览文章与项目。':'Return home or browse the journal and projects.'}</p></header><p><a class="link-arrow" href="${zh?'/zh/':'/en/'}">${zh?'返回首页 →':'Return home →'}</a></p></div>`);
  $('[data-language-switch]').attr('href',zh?'/en/':'/zh/');
  $('body').attr('data-ink','quiet');
  return $.html();
}

function fingerprint(files) {
  const names = new Map();
  for (const [rel, bytes] of [...files]) {
    if (!/^(?:css\/.*\.css|js\/.*\.js)$/.test(rel)) continue;
    const versioned = rel.replace(/\.(css|js)$/,'.'+hash(bytes).slice(0,16)+'.$1');
    names.set('/'+rel,'/'+versioned); files.set(versioned,bytes);
  }
  for (const [rel,bytes] of files) {
    if (!rel.endsWith('.html')) continue;
    const $ = load(bytes.toString());
    $('link[rel="stylesheet"],script[src]').each((_,e)=>{
      const attr=e.name==='script'?'src':'href',value=$(e).attr(attr);
      if (names.has(value)) $(e).attr(attr,names.get(value));
    });
    files.set(rel,Buffer.from($.html()));
  }
  return names;
}

function buildRelease({rebuild=true}={}) {
  if (rebuild) {
    const run=spawnSync('python3',[path.join(__dirname,'build.py')],{cwd:ROOT,stdio:'inherit'});
    if (run.status!==0) throw new Error('Template page build failed');
  }
  const entries=inventory(),metadata=readJSON('content/seo.json'),origin=metadata.origin;
  if (origin!=='https://erichz.site') throw new Error('Review the production origin before changing it');
  const files=new Map();
  const add=(rel,value)=>{
    if (rel.startsWith('/')||rel.split('/').includes('..')||files.has(rel)) throw new Error('Invalid or duplicate output: '+rel);
    files.set(rel,Buffer.isBuffer(value)?value:Buffer.from(value));
  };
  for (const entry of entries) add(entry.file,transformPage(entry,entries,metadata,origin));
  add('index.html',files.get('en/index.html'));
  add('404.html',errorPage(files.get('en/index.html').toString(),'en'));
  for (const file of ['zh/404.html','blog/404.html','projects/404.html']) add(file,errorPage(files.get('zh/index.html').toString(),'zh'));
  const copy=rel=>add(rel,fs.readFileSync(path.join(ROOT,rel)));
  for (const rel of ['css/ink.css','css/languages.css','css/sound.css','js/ink.js','js/ink-fluid.js','js/ink-sound.js','assets/audio/paper-drift.mp3','assets/audio/diffusing-ink.mp3',...readJSON('content/source.json').assets]) copy(rel);
  for (const font of fs.readdirSync(path.join(ROOT,'assets/fonts')).sort()) {
    if (/\.(?:woff2?|txt)$/.test(font)) copy('assets/fonts/'+font);
  }
  for (const rel of ['feed.xml','assets/og-default.svg','assets/og-default.png','90b30d4da25d4c18ddb893132159d3cd.txt']) {
    add(rel,fs.readFileSync(path.join(ROOT,'public',rel)));
  }
  const rules=redirectsFor(entries);
  add('_redirects','# Existing canonical URLs stay in place. English remains the default entry.\n'+[...rules].map(([from,{to,status}])=>`${from} ${to} ${status}`).join('\n')+'\n');
  add('robots.txt',`User-agent: *\nAllow: /\nDisallow: /tools/\nDisallow: /content/\nDisallow: /admin/\nDisallow: /blog-drafts/\nDisallow: /rag-articles/\nDisallow: /transfer/\n\nSitemap: ${origin}/sitemap.xml\n`);
  add('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.map(e=>`  <url><loc>${xml(origin+e.url)}</loc>${metadata.pages[e.url]?.lastmod?'<lastmod>'+xml(metadata.pages[e.url].lastmod)+'</lastmod>':''}</url>`).join('\n')+'\n</urlset>\n');
  const versioned=fingerprint(files);
  add('_headers','/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n\n'+
    'https://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\nhttps://:version.:project.pages.dev/*\n  X-Robots-Tag: noindex\n\n'+
    [...versioned.values()].map(url=>`${url}\n  Cache-Control: public, max-age=31536000, immutable\n`).join('\n'));
  const staging=path.join(ROOT,'.dist-next');
  for (const directory of [staging,OUT]) {
    if (fs.existsSync(directory)&&fs.lstatSync(directory).isSymbolicLink()) throw new Error('Output directory must not be a symlink');
  }
  fs.rmSync(staging,{recursive:true,force:true}); fs.mkdirSync(staging);
  for (const [rel,bytes] of [...files].sort(([a],[b])=>a.localeCompare(b))) {
    const file=path.join(staging,rel); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,bytes);
  }
  fs.rmSync(OUT,{recursive:true,force:true}); fs.renameSync(staging,OUT);
  const manifest={origin,canonicalPages:entries.map(({lang,input,file,url,kind,key})=>({lang,input,file,url,kind,key})),redirects:[...rules].map(([from,r])=>({from,...r})),files:Object.fromEntries([...files].sort(([a],[b])=>a.localeCompare(b)).map(([f,b])=>[f,{bytes:b.length,sha256:hash(b)}]))};
  fs.writeFileSync(path.join(ROOT,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Production package: ${entries.length} canonical pages, ${rules.size} redirects, ${files.size} public files in ${OUT}`);
  return manifest;
}

if (require.main===module) buildRelease();
module.exports={ROOT,OUT,inventory,redirectsFor,buildRelease,cleanPath};
