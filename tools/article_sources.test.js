const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('cheerio');
const { createLocalizedPages } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const slugs = ['data-center-grid-protection', 'physics-benchmark-grading', 'encrypted-substring-search'];
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

test('contextual source links and limitations survive static bilingual generation', () => {
  const pages = createLocalizedPages(entries);
  for (const slug of slugs) {
    const zh = load(pages.get(`blog/${slug}.html`).toString());
    const en = load(pages.get(`en/blog/${slug}.html`).toString());
    const links = $ => $('article a[href^="https://"]').toArray().map(node => $(node).attr('href')).sort();
    assert.deepEqual(links(zh), links(en), slug);
    assert(links(zh).length >= 7, slug);
    assert.equal(zh('article h2').length, en('article h2').length);
    assert(!/\p{Script=Han}/u.test(en('article').text()), slug);
    const limitKey = slug === 'data-center-grid-protection' ? 'bdgp_p45' : slug === 'physics-benchmark-grading' ? 'bpbg_p44' : 'bess_p113';
    assert(zh(`article [data-i18n="${limitKey}"]`).text().length > 60, slug);
    assert(en(`article [data-i18n="${limitKey}"]`).text().length > 60, slug);
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
