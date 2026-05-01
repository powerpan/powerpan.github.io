/* ================================================================
   i18n runtime - data lives in js/i18n/*.js
   ================================================================ */

var I18N = window.I18N || { zh: {}, en: {} };
window.I18N = I18N;

function registerI18nChunk(chunk) {
  if (!chunk) return;
  ['zh', 'en'].forEach((lang) => {
    if (!I18N[lang]) I18N[lang] = {};
    if (chunk[lang]) Object.assign(I18N[lang], chunk[lang]);
  });
}
window.registerI18nChunk = registerI18nChunk;

/* ---------- State ---------- */
var currentLang = localStorage.getItem('lang') || 'zh';

function getCurrentTranslations() {
  return I18N[currentLang] || I18N.zh || {};
}

/* ---------- Core switch ---------- */
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  const t = getCurrentTranslations();

  // Simple text replacements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // HTML replacements (for elements with <br>, <span> etc.)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Placeholder replacements
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Title attribute replacements
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key] !== undefined) el.title = t[key];
  });

  // Article pages derive head metadata from the translated on-page content.
  const articleTitle = document.querySelector('.blog-article-title');
  if (articleTitle) {
    const titleText = articleTitle.textContent.trim().replace(/\s+/g, ' ');
    if (titleText) document.title = titleText + ' — Eric';
  }
  const articleDescription = document.querySelector('meta[name="description"]');
  const firstArticleParagraph = document.querySelector('.blog-article-body p');
  if (articleDescription && firstArticleParagraph) {
    const descText = firstArticleParagraph.textContent.trim().replace(/\s+/g, ' ');
    if (descText) articleDescription.setAttribute('content', descText.slice(0, 180));
  }

  if (typeof window.updateDetailTocLabels === 'function') {
    window.updateDetailTocLabels();
  }

  // Update lang toggle button text
  const nextLangLabel = t.nav_lang || (currentLang === 'zh' ? 'EN' : '中');
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = nextLangLabel;
  const mobileLangBtn = document.getElementById('mobileLangBtn');
  if (mobileLangBtn) mobileLangBtn.textContent = nextLangLabel;

  // Re-render command palette if open
  if (typeof renderCommands === 'function') renderCommands('');

  // Re-start typing with current language
  if (typeof restartTyping === 'function') restartTyping();
}
window.setLang = setLang;

function toggleLang() {
  setLang(currentLang === 'zh' ? 'en' : 'zh');
}
window.toggleLang = toggleLang;

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Create lang toggle button in nav
  const nav = document.getElementById('nav');
  if (nav) {
    const langBtn = document.createElement('button');
    langBtn.id = 'langToggle';
    langBtn.className = 'lang-toggle magnetic';
    langBtn.setAttribute('data-hover', '');
    langBtn.textContent = getCurrentTranslations().nav_lang || (currentLang === 'zh' ? 'EN' : '中');
    langBtn.addEventListener('click', toggleLang);
    // Insert before nav-status
    const navStatus = nav.querySelector('.nav-status');
    if (navStatus) {
      nav.insertBefore(langBtn, navStatus);
    } else {
      nav.appendChild(langBtn);
    }
  }

  // Apply initial language
  setLang(currentLang);
});
