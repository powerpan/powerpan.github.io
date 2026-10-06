#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const { publicPathFor } = require('./site_urls');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

function createPreviewServer(directory) {
  const root = fs.realpathSync(directory);
  return http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let url;
    let pathname;
    try {
      url = new URL(req.url, 'http://localhost');
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some((part) => part.startsWith('.'))) {
      res.writeHead(404).end();
      return;
    }
    const source = path.resolve(root, '.' + pathname);
    const candidates = [source, source + '.html', path.join(source, 'index.html')];
    const file = candidates.find((candidate) => {
      if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return false;
      const relative = path.relative(root, fs.realpathSync(candidate));
      return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
    });
    if (!file) {
      res.writeHead(404).end('Not found');
      return;
    }
    const extension = path.extname(file);
    if (extension === '.html') {
      const canonicalPath = publicPathFor(path.relative(root, file));
      if (pathname !== canonicalPath) {
        res.writeHead(308, { Location: encodeURI(canonicalPath) + url.search }).end();
        return;
      }
    }
    const size = fs.statSync(file).size;
    const headers = {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Content-Length': size,
      'Cache-Control': 'no-store',
      'Accept-Ranges': 'bytes',
    };
    // Media backends need byte-range responses to seek while loading an MP3.
    const range = req.method === 'GET' && !req.headers['if-range'] &&
      /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (!size || (!range[1] && !Number(range[2])) || !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end) || start >= size || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' }).end();
        return;
      }
      res.writeHead(206, { ...headers, 'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${size}` });
      fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
      return;
    }
    res.writeHead(200, headers);
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  });
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..', '_site');
  if (!fs.existsSync(root)) {
    console.error('Run npm run build before previewing.');
    process.exit(1);
  }
  const port = Number(process.env.PORT || 4173);
  const server = createPreviewServer(root);
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}/`));
}

module.exports = { createPreviewServer };
