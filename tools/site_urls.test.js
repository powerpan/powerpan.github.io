const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { canonicalFor, publicPathFor, rewritePublicLinks } = require('./site_urls');
const { createPreviewServer } = require('./preview_site');

test('canonical paths match Pages routes without renaming source files', () => {
  for (const [source, expected] of [
    ['index.html', '/'], ['blog/index.html', '/blog/'],
    ['projects/index.html', '/projects/'], ['blog/topics/agent.html', '/blog/topics/agent'],
    ['blog/example.html', '/blog/example'], ['projects/example.html', '/projects/example'],
    ['blog\\example.html', '/blog/example'], ['feed.xml', '/feed.xml'],
  ]) {
    assert.equal(publicPathFor(source), expected);
    assert.equal(canonicalFor(source), 'https://erichz.site' + expected);
  }
});

test('published links retain relative paths, queries and fragments', () => {
  const files = new Set(['index.html', 'blog/index.html', 'blog/example.html', 'blog/topics/agent.html']);
  for (const [href, expected] of [
    ['../index.html#blog', '../#blog'], ['index.html', './'],
    ['example.html?q=1&amp;x=2#section', 'example?q=1&amp;x=2#section'],
    ['topics/agent.html', 'topics/agent'], ['/blog/index.html', '/blog/'],
    ['https://erichz.site/blog/example.html?x=1#part', 'https://erichz.site/blog/example?x=1#part'],
    ['//erichz.site/blog/example.html', '//erichz.site/blog/example'],
    ['#local', '#local'], ['?next=example.html', '?next=example.html'],
    ['missing.html', 'missing.html'], ['../tools/example.html', '../tools/example.html'],
    ['https://example.org/blog/example.html', 'https://example.org/blog/example.html'],
    ['mailto:eric@example.org', 'mailto:eric@example.org'],
  ]) {
    const input = `<a href="${href}">Article</a>`;
    const output = rewritePublicLinks(input, 'blog/index.html', files);
    assert.equal(output, `<a href="${expected}">Article</a>`);
    assert.equal(rewritePublicLinks(output, 'blog/index.html', files), output);
  }
  const unchanged = '<!-- <a href="example.html">draft</a> --><a download href="example.html">Download</a><code>&lt;a href="example.html"&gt;</code>';
  assert.equal(rewritePublicLinks(unchanged, 'blog/index.html', files), unchanged);
  assert.equal(rewritePublicLinks("<a HREF='example.html'>Article</a>", 'blog/index.html', files), "<a HREF='example'>Article</a>");
});

test('editor templates emit clean URLs for new articles and projects', () => {
  const editor = fs.readFileSync(path.join(__dirname, '..', 'admin/editor.html'), 'utf8');
  const functions = editor.slice(editor.indexOf('    function buildSeoSchema('), editor.indexOf('    /* ===== Rich Text Formatting'));
  const context = { SEO_SITE_ORIGIN: 'https://erichz.site', SEO_DEFAULT_IMAGE: 'https://erichz.site/assets/og-default.svg',
    escapeAttr: (value) => value, toSeoDate: () => '2026-09-29' };
  vm.createContext(context);
  vm.runInContext(functions, context);
  for (const type of ['blog', 'project']) {
    const rel = type === 'blog' ? 'blog/example.html' : 'projects/example.html';
    const head = context.generateSeoHead({ slug: 'example', titleZh: 'Test' }, type);
    assert(head.includes(`rel="canonical" href="${canonicalFor(rel)}"`));
    assert(!head.includes('.html'));
  }
});

test('preview supports final URLs, legacy redirects, assets, HEAD and safe 404s', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'webblog-preview-'));
  fs.mkdirSync(path.join(root, 'blog'));
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Home</h1>');
  fs.writeFileSync(path.join(root, 'blog', 'index.html'), '<h1>Blog</h1>');
  fs.writeFileSync(path.join(root, 'blog', 'example.html'), '<h1>Article</h1>');
  fs.writeFileSync(path.join(root, 'test.css'), 'body{}');
  fs.symlinkSync(path.join(__dirname, 'site_urls.js'), path.join(root, 'outside.js'));
  const server = createPreviewServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const url of ['/', '/blog/', '/blog/example']) {
    const response = await fetch(origin + url, { redirect: 'manual' });
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get('content-type'), /text\/html/);
  }
  for (const [legacy, expected] of [['/index.html', '/'], ['/blog', '/blog/'], ['/blog/index.html', '/blog/'], ['/blog/example.html?x=1&y=2', '/blog/example?x=1&y=2']]) {
    const response = await fetch(origin + legacy, { redirect: 'manual' });
    assert.equal(response.status, 308, legacy);
    assert.equal(response.headers.get('location'), expected);
  }
  for (const missing of ['/missing', '/blog/missing', '/.git/config', '/outside.js', '/%2e%2e%2ftools/site_urls.js']) {
    assert.equal((await fetch(origin + missing)).status, 404, missing);
  }
  assert.match((await fetch(origin + '/test.css')).headers.get('content-type'), /text\/css/);
  const head = await fetch(origin + '/blog/example', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await fetch(origin + '/', { method: 'POST' })).status, 405);
});
