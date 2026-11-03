const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { load } = require('cheerio');
const { createLocalizedPages } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const slugs = ['data-center-grid-protection', 'physics-benchmark-grading', 'encrypted-substring-search', 'gaac-kv-cache-bandwidth', 'agent-goals-permission-boundaries', 'kimi-claude-distillation-rights'];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const entries = slugs.map(slug => ({ rel: `blog/${slug}.html`, html: read(`blog/${slug}.html`) }));

test('edited articles have no end bibliography or dangling source anchors in either language', () => {
  for (const [rel, content] of createLocalizedPages(entries)) {
    const $ = load(content.toString());
    assert.equal($('article #references, .detail-toc-item[data-target="references"]').length, 0, rel);
    assert.equal($('article a[href^="#ref-"]').length, 0, rel);
    assert.equal($('article sup').length, 0, rel);
    const ids = new Set($('[id]').toArray().map(node => $(node).attr('id')));
    $('a[href^="#"]').each((i, node) => {
      const target = $(node).attr('href').slice(1);
      if (target) assert(ids.has(decodeURIComponent(target)), `${rel}: missing #${target}`);
    });
    $('.detail-toc-item').each((i, node) => assert(ids.has($(node).attr('data-target')), rel));
  }
});

test('contextual source links and complete bilingual prose survive static generation', () => {
  const pages = createLocalizedPages(entries);
  for (const slug of slugs) {
    const zh = load(pages.get(`blog/${slug}.html`).toString());
    const en = load(pages.get(`en/blog/${slug}.html`).toString());
    const links = $ => $('article a[href^="https://"]').toArray().map(node => $(node).attr('href')).sort();
    assert.deepEqual(links(zh), links(en), slug);
    assert(links(zh).length >= (slug === 'kimi-claude-distillation-rights' ? 5 : 7), slug);
    assert.equal(zh('article h2').length, en('article h2').length);
    assert(!/\p{Script=Han}/u.test(en('article').text()), slug);
    assert(zh('article').text().length > 1500, slug);
    assert(en('article').text().length > 3000, slug);
  }
});

test('recent articles present their argument without author disclaimers or empty note wrappers', () => {
  const defensive = /我没有|我避免|没有声称|不代表|这不是我编造|我并不是|资料核验截至|本文依据截至|不构成针对|尚未自行复现|I have not reproduced|not legal advice|not an accusation|This is not an example I invented/;
  for (const [rel, content] of createLocalizedPages(entries)) {
    const $ = load(content.toString());
    assert(!defensive.test($('article').text()), rel);
    $('article p, article blockquote').each((_, node) => assert($(node).text().trim().length > 0, rel));
  }
});

test('editorial rewrites preserve the original code and table contents in both languages', () => {
  const empty = '8243e7978eeacdb1a681342142af52d434500716d9482c962266022a725d85a0';
  const expected = {
    'gaac-kv-cache-bandwidth': {zh:'b33d7d35ce0dd4947bc701da02085456f42373e29a42974b6c28e0bee324cc66', en:'c5ef8be07a2c7a8d25a1e9d2964d76982c2cd94a1145fd921b1302580df336e4'},
    'physics-benchmark-grading': {zh:'43b4a8f93c14529f83b0231cfad9f3a31ee0a241a9c409c2b4d5c1acab1ec8d2', en:'bb69aa97f58381ba219c9e2e121d90fe12c54ea57416fa4f0f421aded5ecb27d'},
    'data-center-grid-protection': {zh:empty,en:empty},
    'encrypted-substring-search': {zh:'cb13d8b6c56e426bbcb87d862f6fdcfc79b335fd860c1e564baa59382c319636', en:'9dd5e7c4532c43c39dd934909ddf1802f0d6da098ee808c3dd0a39bdd10cd246'},
    'agent-goals-permission-boundaries': {zh:empty,en:empty},
    'kimi-claude-distillation-rights': {zh:'6e25d08101cf3b2acc6c3ede88bd66252dbbf310ee9722b7198604da79536212', en:'470d3a6864389d4ab8e01d014eb74e0bed0ca60c0e12bb1f7147d89cebd8f310'},
  };
  const pages = createLocalizedPages(entries);
  for (const slug of slugs) for (const lang of ['zh', 'en']) {
    const $ = load(pages.get(`${lang === 'en' ? 'en/' : ''}blog/${slug}.html`).toString());
    const value = JSON.stringify({pre:$('article pre').map((_,e)=>$(e).text()).get(),tables:$('article table').map((_,e)=>$(e).text().replace(/\s/g,'')).get()});
    assert.equal(createHash('sha256').update(value).digest('hex'),expected[slug][lang],`${slug} ${lang}`);
  }
});

test('experiment conditions and reported outcomes remain in the argument', () => {
  const facts = {
    'gaac-kv-cache-bandwidth':{both:['1.405–1.407','26%','1.04–1.15','1114.2','19.0','22.8','1.31','1.27','1.25']},
    'physics-benchmark-grading':{both:['mean@4','pass@4','87.24%','97.96%','59.4%','250','196','2.04']},
    'data-center-grid-protection':{both:['60.092','1260','82','0.9','1.1','90%']},
    'encrypted-substring-search':{both:['01380','11111','HMAC','AAD','HKDF']},
    'agent-goals-permission-boundaries':{both:['9:50','10:02','12:34','1200'],zh:['4.81亿','7万'],en:['481million','70000']},
    'kimi-claude-distillation-rights':{zh:['30万','2300万'],en:['300000','23million']},
  };
  const pages=createLocalizedPages(entries);
  for(const slug of slugs)for(const lang of ['zh','en']){
    const $=load(pages.get(`${lang==='en'?'en/':''}blog/${slug}.html`).toString());
    const text=$('article').text().replace(/[\s,]/g,'');
    for(const fact of [...(facts[slug].both||[]),...(facts[slug][lang]||[])])assert(text.includes(fact),`${slug} ${lang}: ${fact}`);
  }
});

test('blog drafts omit bibliography while RAG articles retain complete reference records', () => {
  for (const slug of slugs) {
    const draft = read(`blog-drafts/${slug}.md`);
    assert(!/^## (?:参考资料|资料与边界)/m.test(draft), slug);
    assert(!draft.includes('[^'), slug);
    const rag = read(`rag-articles/${slug}.md`);
    assert(rag.startsWith(`---\ntype: article\nsource: blog\noriginal_file: ${slug}.html\n---\n`), slug);
    assert(rag.includes('https://'), slug);
    assert(rag.length > draft.length, slug);
  }
});
