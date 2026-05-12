# QWEN.md — Eric's Portfolio Website

## Project Overview

Personal portfolio website for Eric (潘世聪), a full-stack & AI vision developer from Guangzhou, China. Currently studying Software Engineering at 华南理工大学 (South China University of Technology, 2022–2026). The site showcases projects, blog posts, and skills with a **dark hacker/terminal aesthetic**.

- **Type:** Pure static website — HTML / CSS / JavaScript, no framework or bundler; deployment uses a small Node allowlist copy step
- **Hosting:** GitHub Pages via `powerpan.github.io`, with Cloudflare Pages deployment on custom domain `erickk.site`
- **Repo:** `https://github.com/powerpan/powerpan.github.io`
- **Branch:** `main`

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#050508` | Main background |
| `--accent` | `#00ff88` | Primary accent (green) |
| `--purple` | `#a855f7` | Secondary accent |
| `--pink` | `#ff3366` | Tertiary accent |
| `--text` | `#c8d6e5` | Body text |
| `--text-dim` | `#5a6a7a` | Muted text |
| `--card` | `rgba(10,14,20,0.8)` | Card backgrounds |
| `--border` | `rgba(0,255,136,0.08)` | Subtle borders |

### Fonts
- **Display:** Syne (weights 400/600/700/800) — headings, nav, hero
- **Body/Code:** JetBrains Mono (weights 300/400/500/700) — all body text, stats, code blocks

### Z-Index Layers
| Layer | z-index | Element |
|-------|---------|---------|
| Noise overlay | `9998` | `.noise-overlay` |
| Loader | `100000` | `#loader` |
| Custom cursor | `100001` | `#cursor`, `#cursorDot` |

## Architecture & File Structure

```
webblog/
├── index.html              # Main portfolio page (single-page, 673 lines)
├── css/
│   ├── base.css            # Reset, variables, typography, layout grid
│   ├── components.css      # Cards, buttons, badges, nav, loader
│   ├── sections.css        # Hero, about, projects, blog, contact sections
│   ├── effects.css         # Animations, glow effects, noise overlay
│   ├── new-sections.css    # Timeline, skills matrix, code showcase, GitHub stats, testimonials
│   ├── responsive.css      # Main page breakpoints (900px)
│   └── detail.css          # Shared styles for all detail pages + responsive (768px)
├── js/
│   ├── i18n.js             # Internationalization — must load FIRST. Defines `I18N` object with `zh`/`en` dicts
│   ├── loader.js           # Terminal boot animation. Defines global `sleep(ms)` helper
│   ├── particles.js        # Canvas particle background
│   ├── cursor.js           # Custom cursor with glow trail
│   ├── interactions.js     # Main page interactivity: marquee, terminal JSON, orbit rings, typing, command palette
│   ├── features.js         # Main page features: section reveals, 3D cards, counters, TOC dots, scroll handlers
│   └── detail.js           # Shared detail page logic (cursor, particles, scroll, TOC, back-to-top, reveals, code copy)
├── projects/               # Project detail pages (4 files)
│   ├── neural-vision.html  # YOLO+SAM industrial inspection
│   ├── dataflow.html       # Flink+Kafka streaming pipeline
│   ├── pixelmind.html      # Lightweight vision model inference engine
│   └── stackforge.html     # Vue+PHP scaffolding tool
├── blog/                   # Blog detail pages (5 files)
│   ├── transformer-detection.html  # DETR → YOLOv8 演进
│   ├── turborepo-trpc.html         # Flink+Kafka 流式计算（文件名保留旧名）
│   ├── webgpu-dl.html              # WebGPU 浏览器端深度学习
│   ├── image-pipeline.html         # 图像处理流水线设计
│   └── sam2-inspection.html        # SAM2 工业质检
├── .gitignore              # Ignores .DS_Store, *.swp, .qwen/
└── QWEN.md                 # This file
```

## JavaScript Loading Order (Main Page)

Order matters — `i18n.js` defines the runtime first, then page-specific i18n data chunks are loaded before interactive scripts:

```html
<script src="js/i18n.js"></script>           <!-- 1. runtime, currentLang, setLang(), toggleLang() -->
<script src="js/i18n/core.js"></script>      <!-- 2. shared nav/category/detail keys -->
<script src="js/i18n/home.js"></script>      <!-- 3. homepage-only keys -->
<script src="js/i18n/projects.js"></script>  <!-- 4. project card/detail keys -->
<script src="js/i18n/blog-list.js"></script> <!-- 5. homepage/archive blog cards and filters -->
<script src="js/loader.js"></script>         <!-- 6. sleep() global, runLoader(), loader dismiss -->
<script src="js/particles.js"></script>
<script src="js/cursor.js"></script>
<script src="js/interactions.js"></script>
<script src="js/features.js"></script>
```

Blog detail pages load `i18n.js`, `i18n/core.js`, their own `i18n/articles/{slug}.js`, then `detail.js`.
Project pages load `i18n.js`, `i18n/core.js`, `i18n/projects.js`, then `detail.js`.

## Internationalization (i18n)

- **Scope:** Main page, project pages, blog archive, and blog detail pages.
- **System:** Custom runtime in `js/i18n.js`; translation data is split under `js/i18n/`.
- **Data files:** `core.js`, `home.js`, `projects.js`, `blog-list.js`, and one file per article in `js/i18n/articles/{slug}.js`.
- **Data attributes used:**
  - `data-i18n="key"` → sets `textContent`
  - `data-i18n-html="key"` → sets `innerHTML` (for formatted text with `<span class="outline">` etc.)
  - `data-i18n-placeholder="key"` → sets `placeholder`
  - `data-i18n-title="key"` → sets `title`
- **Language toggle:** `<button id="langToggle">` in nav, persists to `localStorage` key `'lang'`, defaults to `'zh'`.
- **Validation:** run `node tools/check_i18n.js` after i18n or page changes.

## Key Technical Details

### Global Helpers
- `sleep(ms)` — defined in `js/loader.js`, returns a Promise. **Do NOT redefine** in other JS files.
- `I18N` — initialized by `js/i18n.js`, then populated by `window.registerI18nChunk()` from split data files.
- `currentLang`, `setLang()`, `toggleLang()` — defined by `js/i18n.js`.

### Responsive Breakpoints
- **Main page:** `max-width: 900px` (defined in `css/responsive.css`)
- **Detail pages:** `max-width: 768px` (defined in `css/detail.css`)

### Detail Page Shared Structure
All detail pages (`projects/*.html`, `blog/*.html`) share:
- Same nav structure (without language toggle)
- Same cursor + particle canvas
- Scroll progress bar + TOC dots + back-to-top button
- `js/detail.js` — single self-contained IIFE
- `css/detail.css` — shared card, code block, stat card styles
- Meta tags: Open Graph, theme-color, viewport

### Performance Stats Card Fix
`.detail-stat-num` uses `font-size: clamp(1.2rem, 2.5vw, 1.8rem)` and `word-break: break-word` to prevent overflow on small screens. Previously was a fixed `2rem`.

## Building & Running

This is a **static site** — no framework and no bundler. Deployment uses `tools/build_site.js` to copy only public files into `_site/`, so source-only folders are not published.

### Local Development
```bash
node tools/build_site.js
python3 -m http.server 8080 -d _site
# Then open http://localhost:8080

# For source-level local editing, serving the repo root is also OK:
python3 -m http.server 8080
```

### Deployment
- **Platform:** Cloudflare Pages (auto-deploys on push to `main`)
- **GitHub repo:** `https://github.com/powerpan/powerpan.github.io`
- **Custom domain:** `erickk.site`
- **Build command:** `node tools/build_site.js`
- **Output directory:** `_site`
- **Do not publish:** `tools/`, `admin/`, `transfer/`, `rag-articles/`, `blog-drafts/`, root Markdown docs

### Git Workflow
```bash
node tools/update_seo.js --check
node tools/check_i18n.js
node tools/build_site.js
node tools/build_site.js --check
git add -A
git commit -m "message"
git push origin main    # Triggers Cloudflare Pages auto-deploy
```

## Development Conventions

### CSS
- All styles use CSS custom properties (`:root` variables) defined in `base.css`
- Component styles are split by concern across 7 CSS files — do not merge
- Mobile responsiveness via `@media (max-width: ...)` at the bottom of each relevant CSS file
- Animations use `@keyframes` defined in `effects.css` and `new-sections.css`
- Card glass effect: `backdrop-filter: blur(20px)` with semi-transparent backgrounds

### JavaScript
- No transpilation, no modules — all scripts use global scope or IIFEs
- `detail.js` is an IIFE `(function() { ... })()` — self-contained, no global pollution
- Event listeners use `DOMContentLoaded` wrapper in detail pages
- Animations use `requestAnimationFrame` for cursor/particle smoothness
- Intersection Observer for scroll-triggered reveals

### HTML
- Semantic HTML5 sections with `id` attributes for anchor navigation
- Main page sections: `#hero`, `#about`, `#timeline`, `#tech`, `#skills`, `#projects`, `#blog`, `#github`, `#testimonials`, `#contact`
- All interactive elements have `data-hover` attribute for cursor effects
- i18n-enabled elements use `data-i18n` / `data-i18n-html` attributes

### Content
- All content reflects Eric's real background: 华南理工大学, Guangzhou, Python/PyTorch/YOLO/SAM/Vue/Flink/Kafka stack
- Stats: 12 projects, 4 years, 6 repos, 480 stars
- Blog posts are technical articles about CV, streaming architecture, and ML deployment
