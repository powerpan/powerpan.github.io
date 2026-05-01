#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const blogCategories = ['ai', 'agent', 'vision', 'architecture', 'observation', 'essay'];
const filterCategories = ['all', ...blogCategories];
const i18nAttrs = ['data-i18n', 'data-i18n-html', 'data-i18n-placeholder', 'data-i18n-title'];

function loadI18n() {
  const noop = () => {};
  const sandbox = {
    localStorage: { getItem: () => null, setItem: () => {} },
    document: {
      addEventListener: noop,
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => null,
      createElement: () => ({ addEventListener: noop }),
      documentElement: {},
    },
    window: { addEventListener: noop },
    console,
  };

  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');
  vm.runInContext(`${code}\nthis.__I18N__ = I18N;`, sandbox);
  return sandbox.__I18N__;
}

function walkHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name.startsWith('.') ? [] : walkHtml(file);
    return entry.isFile() && file.endsWith('.html') ? [file] : [];
  });
}

function stripScripts(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function stripI18nManagedVisibleText(html) {
  let out = html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<canvas[\s\S]*?<\/canvas>/gi, '');

  let previous;
  const managedBlock = /<([a-zA-Z0-9-]+)\b[^>]*data-i18n(?:-[a-zA-Z0-9-]+)?="[^"]+"[^>]*>[\s\S]*?<\/\1>/g;
  do {
    previous = out;
    out = out.replace(managedBlock, '');
  } while (out !== previous);

  return out
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addIssue(issues, title, text) {
  if (!issues[title]) issues[title] = [];
  issues[title].push(text);
}

function printGroup(title, items) {
  console.log(`${title}: ${items.length}`);
  for (const item of items.slice(0, 20)) console.log(`  - ${item}`);
  if (items.length > 20) console.log(`  ... ${items.length - 20} more`);
}

function main() {
  const I18N = loadI18n();
  const issues = {};
  const warnings = {};
  const htmlFiles = walkHtml(root);

  for (const file of htmlFiles) {
    const rel = path.relative(root, file);
    const raw = fs.readFileSync(file, 'utf8');
    const html = stripScripts(raw);

    if (rel !== 'admin/editor.html' && raw.includes('<\\/script>')) {
      addIssue(issues, 'Escaped script closer issues', `${rel}: escaped script closer`);
    }

    for (const attr of i18nAttrs) {
      const attrRe = new RegExp(`${attr}="([^"]+)"`, 'g');
      let match;
      while ((match = attrRe.exec(html))) {
        const key = match[1];
        for (const lang of ['zh', 'en']) {
          if (!Object.prototype.hasOwnProperty.call(I18N[lang], key)) {
            addIssue(issues, 'Missing translation keys', `${rel}: ${attr}="${key}" missing ${lang}`);
          }
        }

        if (attr === 'data-i18n') {
          for (const lang of ['zh', 'en']) {
            const value = I18N[lang][key];
            if (typeof value === 'string' && /<[^>]+>/.test(value)) {
              addIssue(issues, 'data-i18n with HTML translation', `${rel}: data-i18n="${key}" has HTML in ${lang}`);
            }
          }
        }
      }
    }

    const backTopRe = /<button[^>]*class="[^"]*back-to-top[^"]*"[^>]*>/g;
    let backTop;
    while ((backTop = backTopRe.exec(html))) {
      if (!/data-i18n-title="back_to_top"/.test(backTop[0])) {
        addIssue(issues, 'Back-to-top title issues', `${rel}: back-to-top lacks data-i18n-title`);
      }
    }

    if (rel.startsWith('blog/') && rel !== 'blog/index.html') {
      const backLink = html.match(/<a[^>]*class="[^"]*detail-back[^"]*"[\s\S]*?<\/a>/);
      if (!backLink || !/data-i18n="detail_back_blog"/.test(backLink[0])) {
        addIssue(issues, 'Detail back link issues', `${rel}: detail back link lacks detail_back_blog`);
      }

      const tocRe = /<div class="detail-toc-item"[^>]*data-target="([^"]+)"[^>]*>/g;
      let toc;
      while ((toc = tocRe.exec(html))) {
        const target = toc[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sectionRe = new RegExp(`<section[^>]*id="${target}"[\\s\\S]*?<h2[^>]*data-i18n(?:-html)?="([^"]+)"`, 'm');
        if (!sectionRe.test(html)) {
          addIssue(issues, 'TOC i18n derivation issues', `${rel}: toc target "${toc[1]}" cannot derive an i18n h2 label`);
        }
      }
    }

    const cardCatRe = /class="blog-list-card[^"]*"[^>]*data-category="([^"]+)"/g;
    let cardCat;
    while ((cardCat = cardCatRe.exec(html))) {
      if (!blogCategories.includes(cardCat[1])) {
        addIssue(issues, 'Category/filter issues', `${rel}: unknown card category ${cardCat[1]}`);
      }
    }

    const visibleText = stripI18nManagedVisibleText(raw);
    const staticChinese = visibleText.match(/[\u4e00-\u9fff][\u4e00-\u9fff\s，。！？、：“”‘’（）《》·—\-A-Za-z0-9+/.]{0,80}/g) || [];
    if (staticChinese.length) {
      addIssue(
        warnings,
        'Static visible Chinese outside i18n-managed elements',
        `${rel}: ${staticChinese.length} segment(s)`
      );
    }
  }

  const archive = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
  const filterMapBlock = archive.match(/const filterKeyMap = \{([\s\S]*?)\};/);
  if (filterMapBlock) {
    for (const category of filterCategories) {
      const expectedKey = `blog_filter_${category}`;
      if (!new RegExp(`${category}:\\s*'${expectedKey}'`).test(filterMapBlock[1])) {
        addIssue(issues, 'Category/filter issues', `blog/index.html: filterKeyMap missing ${category}`);
      }
    }
  } else {
    addIssue(issues, 'Category/filter issues', 'blog/index.html: filterKeyMap not found');
  }

  const chips = Array.from(archive.matchAll(/data-filter="([^"]+)"/g)).map((match) => match[1]);
  for (const category of filterCategories) {
    if (!chips.includes(category)) {
      addIssue(issues, 'Category/filter issues', `blog/index.html: filter chip missing ${category}`);
    }
  }

  const strictGroups = [
    'Missing translation keys',
    'data-i18n with HTML translation',
    'Back-to-top title issues',
    'Detail back link issues',
    'TOC i18n derivation issues',
    'Category/filter issues',
    'Escaped script closer issues',
  ];

  let failed = false;
  for (const group of strictGroups) {
    const items = issues[group] || [];
    printGroup(group, items);
    if (items.length) failed = true;
  }

  const staticWarnings = warnings['Static visible Chinese outside i18n-managed elements'] || [];
  printGroup('Static visible Chinese outside i18n-managed elements (warning)', staticWarnings);

  process.exit(failed ? 1 : 0);
}

main();
