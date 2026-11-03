const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { walkHtml } = require('./check_i18n');

test('source i18n checks include content pages but not separate templates or generated previews', () => {
  const cache = path.join(__dirname, '../node_modules/.cache');
  fs.mkdirSync(cache, {recursive:true});
  const root = fs.mkdtempSync(path.join(cache, 'i18n-scope-'));
  try {
    const included = ['index.html','blog/new-article.html','blog/topics/ai.html','projects/project.html','admin/editor.html'];
    const excluded = ['templates/design/blog/old-article.html','previews/theme/index.html','_site/en/blog/article.html','node_modules/example/index.html'];
    for (const rel of [...included,...excluded]) {
      const file = path.join(root,rel);
      fs.mkdirSync(path.dirname(file), {recursive:true});
      fs.writeFileSync(file,'<html></html>');
    }
    assert.deepEqual(walkHtml(root).map(file=>path.relative(root,file)).sort(),included.sort());
  } finally {
    fs.rmSync(root, {recursive:true,force:true});
  }
});
