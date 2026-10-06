# Shared Theme System

The default is dark. The navigation theme button sits directly after the language
link as a 44px icon-only control on desktop and mobile. Localized tooltips and
accessible labels remain available. No comparison dock is published.

## Files

- `js/theme.js` restores `site-theme` before paint and owns the finite transition.
- `js/theme-ribbon.js` provides the undulating annular path and matching contours.
- `css/theme.css` supplies the alabaster/graphite/emerald palette and transition layers.
- `tools/theme_controls.js` injects one runtime and control into every built locale.
- `js/hero-core.js` and `js/particles.js` redraw their palette on `site-theme-change`.

New articles and projects inherit the controls at build time. Source `.html` URLs,
content, screenshots and SEO metadata remain unchanged. Legacy inline syntax colors
inside `.detail-code-body` become CSS variables with their exact dark-color fallbacks.

## Motion And Navigation

Only an explicit theme switch starts the loop reveal. Saved choices, language
navigation, reloads and cross-tab updates do not replay it. Shared motion-off and
system reduced motion use an immediate switch; unsupported browsers do the same.
Without JavaScript the control stays hidden and the dark content remains readable.

The canvas is capped at 800,000 pixels and painted at at most 30fps during the
transition. Completion, resize, navigation, hidden tabs and motion changes cancel
decorative work and release the bitmap. Reading titles temporarily leave their
page-navigation transition group so they cannot bypass the theme mask.

Validate with `npm run build` and `npm run check`, then inspect desktop, portrait,
landscape, both locales, article code blocks and motion-off in the local preview.
