const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { load } = require('cheerio');
const { createLocalizedPages } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const slug = 'weight-space-programming';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const entries = [{ rel: `blog/${slug}.html`, html: read(`blog/${slug}.html`) }];

test('weight-space article preserves the archived handoff and standard RAG provenance', () => {
  const raw = Buffer.from(read('transfer/2026-11-03/模型出错为什么总想着重新训练.md'));
  const blob = createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex');
  assert.equal(blob, 'db7d8d2210cbcafbc65830c64da104749186e8fb');
  const rag = read(`rag-articles/${slug}.md`);
  const draft = read(`blog-drafts/${slug}.md`);
  assert(rag.startsWith(`---\ntype: article\nsource: blog\noriginal_file: ${slug}.html\n---\n`));
  assert(rag.includes('63d3db21d43253cbd3e691f9decc3596ead2ffb6'));
  assert(rag.includes('当前 Qwen 官方模型卡正文未检得'));
  assert(rag.length > draft.length);
  assert(!/主要参考资料|编辑核验记录/.test(draft));
});

test('weight-space bilingual pages retain the mechanisms, failed control, budget and costs', () => {
  const pages = createLocalizedPages(entries);
  const facts = ['7.9%', '48.1%', '0.016%', '131,072', '93.0%', '33.1%', '32,768', '6.8%', '7.0%', '8,192', '1,024', '3.5%', '17,253', '517.4', '15.8', '25.3', '20.3', '4.7', '512', 'ROME', 'Gemma', 'down_proj'];
  let expectedLinks;
  for (const [rel, content] of pages) {
    const $ = load(content.toString());
    const text = $('article').text();
    for (const fact of facts) assert(text.includes(fact), `${rel}: ${fact}`);
    assert.equal($('article h2').length, 7);
    assert.equal($('article p').length, 38);
    assert.equal($('article table tbody tr').length, 4);
    assert.deepEqual($('article table tbody tr').toArray().map(row => $(row).find('td').map((_, cell) => $(cell).text()).get()), [
      ['7.9%', '13.8%', '21.0%', '93.0%'],
      ['12.3%', '25.7%', '49.0%', '87.2%'],
      ['14.1%', '25.1%', '39.9%', '86.4%'],
      ['48.1%', '67.1%', '62.3%', '33.1%'],
    ]);
    const links = $('article a[href^="https://"]').map((_, node) => $(node).attr('href')).get().sort();
    assert(links.length >= 9);
    if (expectedLinks) assert.deepEqual(links, expectedLinks);
    expectedLinks = links;
    assert(!/我没有|我避免|不代表|免责声明|not legal advice|I have not reproduced/.test(text));
    assert.equal($('article #references, article a[href^="#ref-"]').length, 0);
    if (rel.startsWith('en/')) assert(!/\p{Script=Han}/u.test(text));
  }
});

test('weight-space source TOC follows section titles and body readtime matches the final draft', () => {
  const $ = load(entries[0].html);
  $('.detail-toc-item').each((_, node) => {
    const target = $(node).attr('data-target');
    assert.equal($(node).attr('data-label'), $(`#${target} h2`).text());
  });
  const han = ($('article').text().match(/\p{Script=Han}/gu) || []).length;
  assert(han >= 3000);
  assert.equal(Math.ceil(han / 250), 13);
  assert($('.blog-article-meta').text().includes('13 min'));
});

test('weight-space entry stays archived and homepage follows the latest six as the site grows', () => {
  const home = load(read('index.html'));
  const archive = load(read('blog/index.html'));
  const cards = archive('.blog-list-card');
  assert(cards.length >= 42);
  const hrefs = cards.map((_, node) => archive(node).attr('href')).get();
  const details = fs.readdirSync(path.join(root, 'blog')).filter(file => file.endsWith('.html') && load(read(`blog/${file}`))('article.blog-article-body').length);
  assert.equal(new Set(hrefs).size, cards.length);
  assert.deepEqual([...hrefs].sort(), details.sort());
  assert(hrefs.includes(`${slug}.html`));
  assert(hrefs.includes('kimi-claude-distillation-rights.html'));
  cards.each((index, node) => assert.equal(archive(node).find('.blog-list-num').text(), String(index + 1).padStart(2, '0')));
  const dates = cards.map((_, node) => archive(node).find('.blog-list-date').text()).get();
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.equal(archive('[data-filter="ai"] .blog-filter-chip-count').text(), String(cards.filter('[data-category="ai"]').length));
  assert.equal(archive('#blogFilterCount').text(), String(cards.length));
  assert.deepEqual(home('.blog-list .blog-item').map((_, node) => home(node).attr('href')).get(), hrefs.slice(0, 6).map(href => `blog/${href}`));
  home('.blog-list .blog-item').each((index, node) => assert.equal(home(node).attr('class'), `blog-item reveal${index ? ` reveal-d${index}` : ''}`));
});
