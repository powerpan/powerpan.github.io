const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {test,before,after}=require('node:test');
const {load}=require('cheerio');
const {ROOT,OUT,inventory}=require('./release.cjs');
const {createProductionPreview}=require('./preview-production.cjs');
const manifestFile=path.join(ROOT,'release-manifest.json');
test('Production package exists',()=>assert.ok(fs.existsSync(manifestFile),'Run node tools/release.cjs'));
if (fs.existsSync(manifestFile)) {
 const manifest=JSON.parse(fs.readFileSync(manifestFile)),entries=inventory(),origin=manifest.origin;
 const metadata=JSON.parse(fs.readFileSync(path.join(ROOT,'content/seo.json')));
 const docs=new Map(entries.map(e=>[e.url,load(fs.readFileSync(path.join(OUT,e.file),'utf8'))]));
 const redirects=new Map(manifest.redirects.map(r=>[r.from,r]));
 const normalize=s=>s.replace(/\s/g,'');
 let server,base;
 before(async()=>{server=createProductionPreview();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;});
 after(async()=>{await new Promise(resolve=>server.close(resolve));});

 test('Every existing canonical URL remains present, in the same language',()=>{
  assert.ok(entries.length>0);assert.deepEqual(new Set(entries.map(e=>e.url)),new Set(Object.keys(metadata.pages)));
  for(const e of entries){assert.equal(docs.get(e.url)('html').attr('lang'),e.lang==='en'?'en':'zh-CN');if(e.kind!=='home')assert.equal(e.url.startsWith('/en/'),e.lang==='en');}
 });
 test('Canonical, two absolute reciprocal language links, share metadata and indexable pages',()=>{
  for(const e of entries){const $=docs.get(e.url);assert.equal($('link[rel=canonical]').attr('href'),origin+e.url);assert.equal($('link[rel=canonical]').length,1);assert.equal($('meta[name=robots]').attr('content'),'index, follow');
   const pair=entries.filter(x=>x.key===e.key);assert.equal($('head link[hreflang]').length,2);
   for(const other of pair)assert.equal($(`head link[hreflang="${other.lang==='zh'?'zh-CN':'en'}"]`).attr('href'),origin+other.url);
   assert.equal($('meta[property="og:url"]').attr('content'),origin+e.url);assert.equal($('meta[property="og:title"]').attr('content'),$('title').text());
   assert.equal($('meta[name="twitter:image"]').attr('content'),origin+'/assets/og-default.png');
  }
 });
 test('Published article dates and complete page text survive production packaging',()=>{
  for(const e of entries){const $=docs.get(e.url),preview=load(fs.readFileSync(path.join(ROOT,e.input),'utf8'));assert.equal(normalize($('main').text()),normalize(preview('main').text()),e.input);
   if(e.kind==='article'){
    const schema=$('script[type="application/ld+json"]').toArray().map(x=>JSON.parse($(x).text())).find(x=>x['@type']==='BlogPosting');
    const old=metadata.pages[e.url].schemas.find(x=>x['@type']==='BlogPosting');assert.equal(schema.datePublished,old.datePublished);assert.equal(schema.dateModified,old.dateModified);assert.equal(schema.inLanguage,e.lang==='en'?'en':'zh-CN');
   }
  }
 });
 test('All page references, media, fonts and section fragments resolve inside the public package',()=>{
  for(const e of entries){const $=docs.get(e.url);$('[href],[src],[poster],[data-preview]').each((_,node)=>{
   for(const attr of ['href','src','poster','data-preview']){const value=$(node).attr(attr);if(!value)continue;const target=new URL(value,origin+e.url);if(target.origin!==origin)continue;
    const pathname=decodeURIComponent(target.pathname);assert.ok(docs.has(pathname)||Object.hasOwn(manifest.files,pathname.slice(1))||redirects.has(pathname),`${e.url} -> ${value}`);
    if(attr==='href'&&target.hash.length>1&&docs.has(pathname)){const id=decodeURIComponent(target.hash.slice(1));const dest=docs.get(pathname);assert.ok(dest('[id]').toArray().some(x=>dest(x).attr('id')===id),`${e.url} missing #${id}`);}
   }
  });}
  for(const [rel] of Object.entries(manifest.files)){if(!rel.endsWith('.css'))continue;const css=fs.readFileSync(path.join(OUT,rel),'utf8');for(const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/g)){const value=m[1]??m[2]??m[3];if(/^(data:|#)/.test(value))continue;const target=new URL(value,origin+'/'+rel);assert.ok(Object.hasOwn(manifest.files,target.pathname.slice(1)),`${rel} missing ${value}`);}}
 });
 test('Homepage bookmarks still reach the same sections',()=>{
  for(const url of ['/en/','/zh/'])for(const id of ['hero','about','experience','tech','skills','projects','work','code','blog','journal','github','testimonials','next','contact'])assert.equal(docs.get(url)(`[id="${id}"]`).length,1,url+' #'+id);
 });
 test('Journal counts, latest six, topics and article order match both content snapshots',()=>{
  for(const lang of ['en','zh']){
   const data=JSON.parse(fs.readFileSync(path.join(ROOT,`content/${lang}.json`)));
   const prefix=lang==='en'?'/en':'';
   const archive=docs.get(prefix+'/blog/');
   const expected=data.articles.map(a=>`${prefix}/blog/${a.source_slug}`);
   assert.equal(new Set(expected).size,data.articles.length);
   assert.deepEqual(archive('.journal-list .journal-row').map((_,e)=>archive(e).attr('href')).get(),expected);
   assert.equal(archive('[data-filter="all"] sup').text(),String(expected.length));
   assert.match(archive('.page-head p.rise').text(),new RegExp(`^${expected.length} ${lang==='zh'?'篇文章':'articles'}`));
   const home=docs.get(lang==='en'?'/en/':'/zh/');
   assert.deepEqual(home('#journal .journal-row').map((_,e)=>home(e).attr('href')).get(),expected.slice(0,6));
   data.articles.forEach((a,i)=>{
    assert.equal(a.num,i+1);if(i)assert.ok(data.articles[i-1].date>=a.date);
    assert.equal(docs.get(expected[i])('.article-head h1').text(),a.title);
    const languageLink=docs.get(expected[i])('[data-language-switch]').first().attr('href');
    assert.equal(languageLink,`${lang==='en'?'':'/en'}/blog/${a.source_slug}`);
   });
   for(const topic of data.topics){
    const count=data.articles.filter(a=>a.topic===topic.num).length;
    assert.equal(archive(`[data-filter="${topic.num}"] sup`).text(),String(count));
    assert.equal(docs.get(`${prefix}/blog/topics/${topic.slug}`)('.journal-row').length,count);
   }
  }
 });
 test('Only public files are packaged; previews remain excluded from search',()=>{
  const forbidden=/^(?:content|tools|public|node_modules|\.git)\/|(?:^|\/)(?:README\.md|release-manifest\.json|package(?:-lock)?\.json)$/;
  for(const rel of Object.keys(manifest.files))assert.ok(!forbidden.test(rel),rel);
  for(const e of entries){const $=load(fs.readFileSync(path.join(ROOT,e.input),'utf8'));assert.match($('meta[name=robots]').attr('content'),/noindex/);}
  assert.match(fs.readFileSync(path.join(OUT,'_headers'),'utf8'),/https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/);
 });
 test('Package and redirect declarations fit the Pages upload limits',()=>{
  assert.ok(Object.keys(manifest.files).length<=20000);
  for(const [file,{bytes}] of Object.entries(manifest.files))assert.ok(bytes<=25*1024*1024,file);
  const lines=fs.readFileSync(path.join(OUT,'_redirects'),'utf8').split(/\r?\n/).filter(s=>s&&!s.startsWith('#'));
  assert.ok(lines.length<=2000);for(const line of lines){assert.ok(line.length<=1000);assert.match(line,/^\/\S* \/\S* (?:301|302|303|307|308)$/);}
 });
 test('Sitemap contains exactly the preserved canonical pages; RSS identities are unchanged',()=>{
  const $=load(fs.readFileSync(path.join(OUT,'sitemap.xml'),'utf8'),{xmlMode:true});assert.deepEqual(new Set($('loc').map((_,e)=>$(e).text()).get()),new Set(entries.map(e=>origin+e.url)));
  assert.deepEqual(fs.readFileSync(path.join(OUT,'feed.xml')),fs.readFileSync(path.join(ROOT,'public/feed.xml')));
  const rss=load(fs.readFileSync(path.join(OUT,'feed.xml'),'utf8'),{xmlMode:true});assert.equal(rss('item').length,20);rss('item>link').each((_,e)=>assert.ok(docs.has(new URL(rss(e).text()).pathname)));
  const png=fs.readFileSync(path.join(OUT,'assets/og-default.png'));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 });
 test('All canonical routes return their localized HTML with 200',async()=>{
  for(const e of entries){const response=await fetch(base+e.url,{redirect:'manual'});assert.equal(response.status,200,e.url);const $=load(await response.text());assert.equal($('html').attr('lang'),e.lang==='en'?'en':'zh-CN');assert.ok($('main').text().trim().length>50);}
 });
 test('Every legacy spelling/preview alias redirects once to a real canonical page, preserving query',async()=>{
  for(const rule of manifest.redirects){assert.ok(rule.from.startsWith('/'));const response=await fetch(base+rule.from+'?ref=release&q=token',{redirect:'manual'});assert.equal(response.status,rule.status,rule.from);assert.equal(response.headers.get('location'),rule.to+'?ref=release&q=token',rule.from);assert.ok(docs.has(rule.to));assert.ok(!redirects.has(rule.to));await response.body?.cancel();}
 });
 test('Missing pages return genuine localized 404s; source files never fall back to the homepage',async()=>{
  for(const [url,lang] of [['/unknown-page','en'],['/blog/unknown-article','zh-CN'],['/projects/unknown-project','zh-CN'],['/zh/missing','zh-CN']]){const r=await fetch(base+url);assert.equal(r.status,404);const $=load(await r.text());assert.equal($('html').attr('lang'),lang);assert.match($('meta[name=robots]').attr('content'),/noindex/);}
  for(const url of ['/tools/release.cjs','/content/en.json','/README.md','/_redirects','/_headers','/release-manifest.json']){const r=await fetch(base+url);assert.equal(r.status,404,url);await r.body?.cancel();}
 });
 test('Versioned CSS/JS use immutable caching; media seeking supports byte ranges locally',async()=>{
  const asset=Object.keys(manifest.files).find(x=>/^css\/ink\.[a-f0-9]{16}\.css$/.test(x));assert.ok(asset);
  const css=await fetch(base+'/'+asset,{method:'HEAD'});assert.match(css.headers.get('cache-control'),/immutable/);assert.match(css.headers.get('content-type'),/text\/css/);
  const video=Object.keys(manifest.files).find(x=>x.endsWith('.mp4'));const r=await fetch(base+'/'+video,{headers:{Range:'bytes=0-31'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,32);
  const head=await fetch(base+'/en/',{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.text()).length,0);
  const post=await fetch(base+'/en/',{method:'POST'});assert.equal(post.status,405);
 });
}
