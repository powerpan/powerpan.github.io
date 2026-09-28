#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { createLocalizedPages } = require('./localize_site');
const { fingerprintAssets } = require('./fingerprint_assets');

const root = path.resolve(__dirname, '..');
const outDirName = '_site';
const outDir = path.join(root, outDirName);
const checkOnly = process.argv.includes('--check');
const skipSeo = process.argv.includes('--skip-seo');

const publicDirs = ['assets', 'blog', 'css', 'js', 'projects'];
const requiredFiles = ['index.html', 'robots.txt', 'sitemap.xml', 'feed.xml'];
const optionalFiles = [
  '90b30d4da25d4c18ddb893132159d3cd.txt',
  '_headers',
  '_redirects',
  'favicon.ico',
  'site.webmanifest',
];

const ignoredNames = new Set(['.DS_Store']);
const forbiddenTopLevel = new Set([
  '.git',
  '.qwen',
  'admin',
  'blog-drafts',
  'rag-articles',
  'tools',
  'transfer',
]);

function relPath(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function ensureWithinRoot(file) {
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to read outside repo root: ${file}`);
  }
}

function assertRegularSource(file) {
  ensureWithinRoot(file);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) {
    throw new Error(`Refusing to copy symlink: ${relPath(file)}`);
  }
  return stat;
}

function walkFiles(dir) {
  assertRegularSource(dir);
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !ignoredNames.has(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Refusing to copy symlink: ${relPath(full)}`);
    }
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
      continue;
    }
    if (entry.isFile()) {
      files.push(full);
    }
  }

  return files;
}

function expectedSourceFiles() {
  const files = [];

  for (const rel of requiredFiles) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) {
      throw new Error(`Required public file is missing: ${rel}`);
    }
    files.push(file);
  }

  for (const rel of optionalFiles) {
    const file = path.join(root, rel);
    if (fs.existsSync(file)) files.push(file);
  }

  for (const rel of publicDirs) {
    const dir = path.join(root, rel);
    if (!fs.existsSync(dir)) {
      throw new Error(`Required public directory is missing: ${rel}`);
    }
    files.push(...walkFiles(dir));
  }

  return files.sort((a, b) => relPath(a).localeCompare(relPath(b)));
}

function runSeoCheckOrUpdate() {
  if (skipSeo) return;
  const args = [path.join('tools', 'update_seo.js')];
  if (checkOnly) args.push('--check');
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`SEO sync ${checkOnly ? 'check' : 'update'} failed.`);
  }
}

function expectedOutput() {
  const entries = [];
  const output = new Map();
  for (const source of expectedSourceFiles()) {
    assertRegularSource(source);
    const rel = relPath(source);
    if (rel.endsWith('.html')) entries.push({ rel, html: fs.readFileSync(source, 'utf8') });
    else output.set(rel, source);
  }
  for (const [rel, content] of createLocalizedPages(entries)) output.set(rel, content);
  return fingerprintAssets(output);
}

function build() {
  const output = expectedOutput();
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const [rel, content] of output) {
    const destination = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (Buffer.isBuffer(content)) fs.writeFileSync(destination, content);
    else fs.copyFileSync(content, destination);
  }

  assertNoForbiddenOutput();
  console.log(`Built ${outDirName}/ with ${output.size} public files.`);
}

function assertNoForbiddenOutput() {
  if (!fs.existsSync(outDir)) return;
  const topLevelEntries = fs.readdirSync(outDir, { withFileTypes: true });
  const leaked = topLevelEntries
    .map((entry) => entry.name)
    .filter((name) => forbiddenTopLevel.has(name));
  if (leaked.length) {
    throw new Error(`Forbidden source-only entries in ${outDirName}/: ${leaked.join(', ')}`);
  }
}

function checkOutput() {
  if (!fs.existsSync(outDir)) {
    throw new Error(`${outDirName}/ does not exist. Run node tools/build_site.js first.`);
  }

  const expected = expectedOutput();

  const actual = walkFiles(outDir).map((file) => path.relative(outDir, file).split(path.sep).join('/'));
  const actualSet = new Set(actual);
  const problems = [];

  for (const [rel, source] of expected.entries()) {
    const built = path.join(outDir, rel);
    if (!fs.existsSync(built)) {
      problems.push(`missing ${rel}`);
      continue;
    }
    const content = Buffer.isBuffer(source) ? source : fs.readFileSync(source);
    if (!content.equals(fs.readFileSync(built))) {
      problems.push(`out of date ${rel}`);
    }
  }

  for (const rel of actual) {
    if (!expected.has(rel)) {
      problems.push(`unexpected ${rel}`);
    }
  }

  for (const forbidden of forbiddenTopLevel) {
    if (actualSet.has(forbidden) || actual.some((rel) => rel.startsWith(`${forbidden}/`))) {
      problems.push(`forbidden ${forbidden}/`);
    }
  }

  if (problems.length) {
    throw new Error(`${outDirName}/ is not in sync:\n- ${problems.join('\n- ')}`);
  }

  assertNoForbiddenOutput();
  console.log(`${outDirName}/ is in sync with the public file allowlist.`);
}

try {
  runSeoCheckOrUpdate();
  if (checkOnly) {
    checkOutput();
  } else {
    build();
  }
  for (const check of ['check_urls.js', 'check_locales.js']) {
    const result = spawnSync(process.execPath, [path.join('tools', check)], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Published validation failed: ${check}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
