const SITE_ORIGIN = 'https://erichz.site';

function publicPathFor(rel) {
  const pathname = '/' + rel.replace(/\\/g, '/').replace(/^\/+/, '');
  return pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
}

function canonicalFor(rel) {
  return SITE_ORIGIN + publicPathFor(rel);
}

function rewritePublicLinks(html, rel, publicHtmlFiles) {
  // Keep source-file links for file:// previews; normalize only published HTML.
  return html.replace(/<!--[^]*?-->|<(?:a|area|link)\b[^>]*>/gi, (tag) => {
    if (tag.startsWith('<!--') || /\sdownload(?:\s|=|>)/i.test(tag)) return tag;
    return tag.replace(/(\shref\s*=\s*)(["'])([^"']*)\2/i, (attr, prefix, quote, href) => {
      if (!href || href.startsWith('#') || href.startsWith('?')) return attr;
      let url;
      try {
        url = new URL(href, `${SITE_ORIGIN}/${rel}`);
      } catch {
        return attr;
      }
      if (url.origin !== SITE_ORIGIN || !publicHtmlFiles.has(url.pathname.slice(1))) return attr;
      const boundary = href.search(/[?#]/);
      const pathname = boundary < 0 ? href : href.slice(0, boundary);
      const tail = boundary < 0 ? '' : href.slice(boundary);
      const clean = pathname.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '') || './';
      return `${prefix}${quote}${clean}${tail}${quote}`;
    });
  });
}

module.exports = { SITE_ORIGIN, publicPathFor, canonicalFor, rewritePublicLinks };
