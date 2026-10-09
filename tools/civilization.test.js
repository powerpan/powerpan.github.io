const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('cheerio');
const { createLocalizedPages } = require('./localize_site');

const root = path.resolve(__dirname, '..');
const rel = 'projects/civilization-z.html';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const images = ['menu', 'world', 'city', 'research', 'goals', 'combat'];

test('Civilization Z presents six complete screenshots with captions and original-image links', () => {
  const $ = load(read(rel));
  const figures = $('.civ-figure');
  assert.equal(figures.length, images.length);
  figures.each((index, el) => {
    const figure = $(el), image = figure.find('img'), link = figure.find('a');
    const src = `../assets/projects/civilization-z/${images[index]}.webp`;
    assert.equal(image.attr('src'), src);
    assert.equal(link.attr('href'), src);
    assert.equal(link.attr('target'), '_blank');
    assert.equal(link.attr('rel'), 'noopener noreferrer');
    assert.equal(link.attr('data-i18n-title'), 'civ_open_image');
    assert.equal(image.attr('width'), '1920');
    assert.equal(image.attr('height'), '1080');
    assert.equal(image.attr('loading'), index ? 'lazy' : 'eager');
    assert.equal(image.attr('decoding'), 'async');
    assert(image.attr('data-i18n-alt'));
    assert(figure.find('figcaption[data-i18n]').text());
    const bytes = fs.readFileSync(path.resolve(root, 'projects', src));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  });
  assert.match($('style').text(), /\.civ-figure img\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/);
  assert.equal($('.detail-toc-item').length, 7);
  assert($('#detailToc').hasClass('visible'));
  $('.detail-toc-item').each((_, el) => {
    const button = $(el), section = $('#' + button.attr('data-target'));
    assert(button.is('button[type="button"]'));
    assert.equal(button.attr('title'), section.find('h2').text());
    assert(section.find('.detail-text').length >= 2);
  });
  assert.equal($('.civ-pipeline-step').length, 4);
  assert.equal($('a[href*="github.com/powerpan/agent_island"]').length, 0);
});

test('Civilization Z stays featured and the archive retains every project', () => {
  const home = load(read('index.html')), archive = load(read('projects/index.html'));
  assert.equal(home('.project-card').length, 6);
  assert.equal(home('.project-card[href="projects/civilization-z.html"]').length, 1);
  const projectCount = fs.readdirSync(path.join(root, 'projects'))
    .filter(file => file.endsWith('.html') && file !== 'index.html').length;
  assert.equal(archive('.project-list-card').length, projectCount);
  assert.equal(archive('.project-list-card[href="civilization-z.html"]').length, 1);
  assert.equal(archive('.project-list-card[href="yolo26-multimodal.html"]').length, 1);
  assert.deepEqual(archive('.project-list-num').map((_, el) => archive(el).text()).get(),
    Array.from({ length: projectCount }, (_, index) => String(index + 1).padStart(2, '0')));
  assert(archive('[data-i18n="proj_list_sub"]').text().includes(String(projectCount)));
  assert.equal(home('#blog .blog-item').length, 6);
});

test('Civilization Z builds fully translated static pages with honest provenance and shared motion', () => {
  const entries = ['index.html', 'projects/index.html', rel].map(file => ({ rel: file, html: read(file) }));
  const pages = createLocalizedPages(entries);
  for (const lang of ['zh', 'en']) {
    const prefix = lang === 'en' ? 'en/' : '';
    const $ = load(pages.get(prefix + rel).toString());
    assert.equal($('html').attr('lang'), lang === 'en' ? 'en' : 'zh-CN');
    assert.equal($('h1').text(), lang === 'en' ? 'Civilization Z' : '文明Z');
    assert.equal($('#langToggle').length, 1);
    assert.equal($('#langToggle').attr('href'), lang === 'en' ? '/projects/civilization-z' : '/en/projects/civilization-z');
    assert.equal($('link[rel="canonical"]').attr('href'), `https://erichz.site/${prefix}projects/civilization-z`);
    assert.equal($('link[hreflang]').length, 2);
    assert.equal($('[data-page-motion]').length, 1);
    assert.equal($('.detail-back').attr('href'), `/${prefix}projects/`);
    const description = lang === 'en' ? $('.detail-subtitle').text()
      : load(read(rel))('meta[name="description"]').attr('content');
    assert.equal($('meta[name="description"]').attr('content'), description);
    assert.equal(JSON.parse($('script[type="application/ld+json"]').text()).inLanguage, lang === 'en' ? 'en' : 'zh-CN');
    $('.civ-figure').each((index, el) => {
      assert.equal($(el).find('img').attr('src'), `/assets/projects/civilization-z/${images[index]}.webp`);
    });
    const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get();
    assert(scripts.indexOf('/js/motion.js') < scripts.indexOf('/js/cursor.js'));
    assert(scripts.indexOf('/js/cursor.js') < scripts.indexOf('/js/detail.js'));
    const note = $('.civ-provenance').text();
    if (lang === 'en') {
      $('body [data-i18n], body [data-i18n-alt], body [data-i18n-title]').each((_, el) => {
        const node = $(el);
        if (node.attr('data-i18n') === 'nav_lang') return;
        assert(!/[\u3400-\u9fff]/.test(node.text() + (node.attr('alt') || '') + (node.attr('title') || '')));
      });
      assert.match(note, /manually staged/);
      assert.match(note, /not an autonomous AI playthrough/);
      assert.match(note, /original Chinese UI/);
      assert.match($('#overview').text(), /does not call a language model/);
      assert.match($('#status').text(), /I have not opened a public online demo or released the source/);
      assert.match($('.detail-subtitle').text(), /I wanted/);
      assert.doesNotMatch($('#status').text(), /acceptance records|bounded call records/);
    } else {
      assert.match(note, /人工布置/);
      assert.match(note, /并非 AI 自主完成/);
      assert.match($('#overview').text(), /不调用大模型/);
      assert.match($('#status').text(), /暂未开放在线试玩和源码/);
      assert.match($('.detail-subtitle').text(), /我想/);
      assert.doesNotMatch($('#status').text(), /本页依据|验收记录|受限调用记录|系统应显示/);
    }
  }
});
