#!/usr/bin/env node
// Local HTTP model for the package's Pages routes; no deployment or remote writes.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {OUT,cleanPath}=require('./release.cjs');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.woff':'font/woff','.woff2':'font/woff2'};

function createProductionPreview(directory=OUT) {
  const root=fs.realpathSync(directory),redirects=new Map();
  for (const line of fs.readFileSync(path.join(root,'_redirects'),'utf8').split(/\r?\n/)) {
    const [from,to,status]=line.trim().split(/\s+/);
    if (from?.startsWith('/')&&!/[*:]/.test(from)&&to?.startsWith('/')&&['301','302','303','307','308'].includes(status)) redirects.set(from,{to,status:Number(status)});
  }
  const assetHeaders=new Map(); let pattern='';
  for (const line of fs.readFileSync(path.join(root,'_headers'),'utf8').split(/\r?\n/)) {
    if (!line.trim()||line.startsWith('#')) continue;
    if (!/^\s/.test(line)) {pattern=line.trim();continue;}
    const m=/^\s+([^:]+):\s*(.*)$/.exec(line);
    if (m&&pattern.startsWith('/')) {
      if (!assetHeaders.has(pattern)) assetHeaders.set(pattern,{});
      assetHeaders.get(pattern)[m[1]]=m[2];
    }
  }
  const fileExists=file=>{
    if (!fs.existsSync(file)||!fs.statSync(file).isFile()) return false;
    const rel=path.relative(root,fs.realpathSync(file));
    return rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel);
  };
  return http.createServer((req,res)=>{
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    let url,pathname;
    try {url=new URL(req.url,'http://localhost');pathname=decodeURIComponent(url.pathname);} catch {res.writeHead(400).end();return;}
    if (pathname.includes('\0')||pathname.includes('\\')||pathname.split('/').some(x=>x.startsWith('.'))||['/_headers','/_redirects'].includes(pathname)) {res.writeHead(404).end();return;}
    const rule=redirects.get(pathname);
    if (rule) {
      const target=new URL(rule.to,url); if (!target.search) target.search=url.search;
      res.writeHead(rule.status,{Location:target.pathname+target.search+target.hash}).end();return;
    }
    const requested=path.resolve(root,'.'+pathname);
    let file=[requested,requested+'.html',path.join(requested,'index.html')].find(fileExists),status=200;
    if (!file) {
      status=404;
      let dir=path.extname(pathname)?path.dirname(requested):requested;
      while (dir.startsWith(root)) {
        const fallback=path.join(dir,'404.html');
        if (fileExists(fallback)) {file=fallback;break;}
        if (dir===root) break; dir=path.dirname(dir);
      }
      file=file||path.join(root,'404.html');
    } else if (file.endsWith('.html')&&pathname!==cleanPath(path.relative(root,file))) {
      res.writeHead(308,{Location:cleanPath(path.relative(root,file))+url.search}).end();return;
    }
    const size=fs.statSync(file).size;
    const headers={'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Content-Length':size,'Cache-Control':'public, max-age=0, must-revalidate','Accept-Ranges':'bytes',...assetHeaders.get('/*'),...assetHeaders.get(pathname)};
    if (status===404) headers['X-Robots-Tag']='noindex';
    const range=req.method==='GET'&&status===200&&!req.headers['if-range']&&/^bytes=(\d*)-(\d*)$/.exec(req.headers.range||'');
    if (range) {
      const start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2]));
      const end=range[1]&&range[2]?Math.min(Number(range[2]),size-1):size-1;
      if (!size||(!range[1]&&!Number(range[2]))||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start) {res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
      res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`});
      fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);return;
    }
    res.writeHead(status,headers);
    if (req.method==='HEAD') res.end();else fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  });
}
if (require.main===module) {
  const port=Number(process.env.PORT||4192),server=createProductionPreview();
  server.on('error',e=>{console.error(e.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`Production package preview: http://127.0.0.1:${port}/en/ and /zh/`));
}
module.exports={createProductionPreview};
