# Local Visual Upgrade

Status: approved for publication on 2026-09-29. This document records implementation and local validation; deployment completion is verified separately against the public site.

## Scope and Design

- Preserve the existing black/green palette, Syne headings, monospace body text, navigation, bilingual content and page order.
- Hero: a procedural WebGL chrome sculpture with emerald seams, studio reflections, an orbital filament and pointer/scroll response. Natural rotation and traveling shape waves remain visible without input; pointer tilt and displacement use 160 ms exponential damping. The wordmark and controls remain stationary HTML.
- Projects: five screenshot-backed projects lead the six-card selection: Local Knowledge Assistant, BF Badminton, ClassBridge, Trading Simulator and Moyu Night Library. Existing original captures are reused with contained proportions, lazy loading and bilingual alt text; their frames retain corner highlights without tint, scanning light or image zoom. YOLO26 fills the sixth slot with a clearly labeled concept illustration. Unfeatured projects remain in the complete archive.
- Experience: an open alternating timeline ordered from 2022 to the present, with scroll-driven illumination. The axis stops at the final HKUST node. Arrival releases two circular waves, 18 curved particle trails, a heading light sweep and staggered tag highlights, then settles into front-facing circular rings and a rotating dial. Mobile uses one left-hand axis with a smaller effect radius.
- The previous local HKUST experience edit is preserved. Article pages, publishing rules and deployment configuration are unchanged.

## Asset Provenance

The three design studies and the project artwork were generated with the built-in image-generation tool on 2026-09-29. Original PNGs are in the local Codex generated-images directory for this chat.

| Role | Original filename |
| --- | --- |
| Hero concept | `exec-677ef9d2-0200-45ca-b339-61fba7d2e7cb.png` |
| Project concept | `exec-62976324-4844-43f9-8bf8-4e0b5e4b86f2.png` |
| Timeline concept | `exec-f487d21f-e70e-4659-8001-fcf778874bc4.png` |
| Production project atlas | `exec-f1baf537-7c09-4122-84b8-983c91cd7159.png` |

Art direction: obsidian backgrounds, polished silver/chrome, emerald light, cinematic studio lighting. The production atlas is a text-free 3-by-2 arrangement: vision camera, metro gates, glass orb, data conduits, neural chip, software layers. It was converted to `assets/vfx/project-atlas.jpg` (1536 x 1024, approximately 514 KiB). CSS selects each square cell and crops it into the responsive media frame. No concept screenshot is shipped as UI.

## Visual Comparison

| Point | Reference and implementation decision |
| --- | --- |
| Hero shape | Enlarged and thickened the live sculpture after comparison. The shader uses a simpler continuously deforming surface, not the reference image's full photographic microdetail, to keep a bounded render cost. |
| Material | Retained silver highlights, emerald seams and a dark background. Added grazing-angle edge softness for the capped render resolution. |
| Typography and copy | Kept existing site fonts, logo, navigation and real descriptions. Did not copy invented coordinates, status widgets or altered project claims from the generated studies. |
| Project layout | Preserved the two-column desktop layout and open caption panels. More vertical space than the compact study accommodates the original bilingual descriptions; the art label sits on the media instead of next to the title. |
| Timeline | Preserved alternating entries, the silver axis, green active segment and complete experience text. Oldest-first chronology makes downward illumination match the story. Removed the current node's `rotateX` projection so its rings stay circular; arrival now has a brief layered sequence rather than only switching the rings on. |
| Responsive behavior | Single-column cards and timeline on narrow screens. Portrait and landscape layouts retain usable native links and readable copy without horizontal overflow. |

## Runtime and Verification

- No additional runtime dependency. The hero uses the shared `SiteMotion` clock, caps drawing at 30 fps and starts with an approximately 720,000-pixel budget. Sustained slow frames reduce its resolution.
- The existing Canvas 2D field is retained if WebGL is unavailable, shader compilation/linking fails or the context is lost.
- Shared offscreen/background pausing and reduced-motion preferences remain in force. Turning motion off leaves a static hero, hides scanning light and fully illuminates the timeline.
- The current-node sequence uses CSS transforms/opacity with no extra canvas or continuous JavaScript loop. It rearms only after a deliberate scroll retreat, not threshold jitter; resuming motion at the node does not replay the burst. Reduced motion hides waves and sparks and stops the dial.
- `npm run check`: regression coverage includes natural-motion amplitude, pointer damping/release, touch and motion-off guards, chronological ordering, axis endpoints, fallback behavior, URLs and bilingual output. The existing admin-editor untranslated-text warning remains; no missing translation keys.
- Browser QA: Chrome desktop/default and 1536 x 1024, 390 x 844 English portrait, 844 x 390 English landscape, and 320 x 568 narrow portrait. Verified rendering, no horizontal overflow, project navigation, timeline charging, motion toggle, English content and a single language switch. No browser console errors were observed.
- GPU failure and context-loss behavior are covered with simulated unit tests, not hardware fault injection. Real-device battery/thermal behavior, Safari and Firefox have not been verified.

Preview using `npm run preview` at `http://127.0.0.1:4173/`. Rebuild with `npm run build` after source changes. This document is source-only and is excluded from the public build.

## Second Pass: Constellation and Continuity

- Replace the old orbit's 14 moving labels with four fixed constellations and native category buttons. The AI expansion retains those tools and adds DETR, LLM, NLP, Stable Diffusion and ONNX, for 19 labels in total. SVG paths and up to nine light packets follow the shared visibility clock at no more than 30 fps; no raster UI or additional WebGL/canvas is used. Keyboard arrows, Home and End also select a field.
- Below 900 px, or on coarse touch devices, show just the selected cluster as a stationary diamond, pair, or spaced nine-node AI grid. Hide the star field and continuous packets. All descriptions and real project links remain native, statically translated HTML; the no-JavaScript fallback exposes all four descriptions. AI copy groups the existing skills into vision modeling, language/generation and inference/deployment, linking to NeuralVision Pro and PixelMind SDK.
- Two decorative SVG threads connect experience to tech and skills to projects. Scroll position draws each thread and advances its light; no scroll capture, snapping, pinned viewport or extra continuous loop.
- The bilingual build adds the shared `page-transitions.js` head bootstrap and stylesheet to public pages. Cross-document navigation remains native: desktop uses an aperture on the home page and a shared card-to-detail title where possible; reading pages use a short body fade with no ongoing new background effects. Mobile uses a short crossfade. Unsupported browsers simply navigate normally.
- The homepage keeps its existing motion toggle; other public pages receive one compact control at bottom left, separate from the existing back-to-top button. Stored preferences, reduced motion, storage failures and back/forward restoration are covered. The source-only direct-file preview does not receive build-injected page transitions; use the built `_site` preview.

### Design References and Review

Preview-only concepts in the chat's generated-images folder:

- `/Users/ericpan/.codex/generated_images/019dc94b-a068-7cc0-aa27-3751f457742e/exec-2411854a-51e0-4796-bf61-c7dfff4077e7.png`: desktop constellation.
- `/Users/ericpan/.codex/generated_images/019dc94b-a068-7cc0-aa27-3751f457742e/exec-cb900b3a-7e7d-4085-990a-89d5e93cf14c.png`: mobile, chapter seam and navigation storyboard.

| Comparison | Implementation / intentional difference |
| --- | --- |
| Composition | Open constellation on the left, thin separator and native project description on the right; no new card grid. |
| Typography | Keep existing Syne and JetBrains Mono. Keep the real bilingual Tech Stack title instead of renaming it to the generated concept's heading. |
| Color and material | Retain the site's black, silver and emerald palette; active clusters brighten without dimming the real description. |
| Graph | Native SVG geometry, sparse stars, curved packets and fixed readable labels replace the concept bitmap. Mobile shows only one cluster and large controls. |
| Content | Retain real experience, real project names and all original tools. Omit the storyboard's fabricated timeline entries and placeholder article. No hero or navigation copy changes. |
| Motion | Short shared-title handoff replaces a decorative full-screen edge; avoids an overlay blocking links. The body settles immediately for reading. |
| Refinements | Corrected label anchors to meet line endpoints, avoided title reveal conflicts, shortened overlapping title fades, and separated motion/back-to-top controls. |

Reference for native transition lifecycle and snapshot cleanup: [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).

Verification: 35 tests pass; 114 generated pages, 2,016 internal links and 57 bilingual pairs pass. Compared both concept images with Chrome captures using `view_image`; checked the native 1586 x 992 desktop reference viewport, default desktop, 390 x 844, 844 x 390 and 320 x 568. Verified category clicks, keyboard selection, actual project navigation, native title handoff, reading-page isolation, motion toggles and back navigation. The hero/nav copy is unchanged. Fixed an early-paint opt-in cancellation by loading transition CSS before the bootstrap and waiting for the first heading to be parsed; repeat navigation produced no new console errors. Safari/Firefox and physical mobile devices remain untested. The pre-existing source-only admin translation warning remains.
