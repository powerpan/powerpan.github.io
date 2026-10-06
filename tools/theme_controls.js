function themeButton($, lang) {
  const english = lang === 'en';
  const button = $('<button type="button" id="themeToggle" class="theme-toggle" hidden aria-pressed="false"></button>');
  button.attr({ 'aria-label': english ? 'Switch to light theme' : '切换到浅色主题',
    title: english ? 'Switch to light theme' : '切换到浅色主题' });
  button.html('<svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>' +
    '<svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.5 14.4A8.7 8.7 0 0 1 9.6 3.5a9 9 0 1 0 10.9 10.9Z"></path></svg>');
  return button;
}

function addThemeRuntime($, lang) {
  $('script[src$="/theme.js"], script[src$="/theme-ribbon.js"], link[href$="/theme.css"]').remove();
  $('head').prepend('<script src="/js/theme.js" blocking="render"></script><script src="/js/theme-ribbon.js" defer></script>');
  $('head').append('<link rel="stylesheet" href="/css/theme.css">');
  // Legacy code examples retain their exact dark colors as variable fallbacks.
  $('.detail-code-body [style]').each((_, element) => {
    const node = $(element);
    node.attr('style', node.attr('style').replace(/(^|;)\s*color\s*:\s*(#[a-f0-9]{6})\b/gi,
      (_, separator, color) => `${separator}color:var(--syntax-${color.slice(1).toLowerCase()},${color})`));
  });
  $('#themeToggle').remove();
  const nav = $('#nav');
  if (!nav.length) return;
  let tools = nav.find('.nav-tools');
  if (!tools.length) {
    tools = $('<div class="nav-tools"></div>');
    if (nav.find('.nav-hamburger').length) nav.find('.nav-hamburger').before(tools);
    else nav.append(tools);
  }
  const language = nav.find('#langToggle'), status = nav.find('.nav-status');
  tools.append(language, themeButton($, lang), status);
}

module.exports = { addThemeRuntime, themeButton };
