/* ==========================================================================
   CHROMATIC INK — page choreography.
   Motion preference: html[data-motion]; theme: html[data-theme]. Both are
   restored by the inline head script before first paint.
   ========================================================================== */
(() => {
    const root = document.documentElement;
    const chinese = root.lang.startsWith('zh');
    const text = (en, zh) => chinese ? zh : en;
    // Chinese has no spaces between words. Keep its glyphs wrappable inside the
    // same reveal masks and quotation animation used by the original design.
    const textTokens = value => chinese
        ? (value.match(/\p{Script=Han}|[^\p{Script=Han}\s]+|\s+/gu) || [])
        : value.split(/(\s+)/);
    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const motion = () => root.dataset.motion !== 'off' && !reduced.matches;
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    };
    const ink = () => window.Ink;

    /* ---------- One shared frame loop for scroll-linked work ---------- */
    const tasks = new Set();
    let frame = 0, lastNow = 0;
    function tick(now) {
        frame = 0;
        const dt = Math.min(0.05, (now - (lastNow || now)) / 1000);
        lastNow = now;
        let again = false;
        tasks.forEach(task => { if (task(dt, now / 1000) === true) again = true; });
        if (again) wake();
    }
    function wake() { if (!frame) frame = requestAnimationFrame(tick); }
    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', wake, { passive: true });

    /* ---------- Theme & motion ---------- */
    function paperRGB() {
        const v = getComputedStyle(root).getPropertyValue('--paper-rgb').split(',').map(n => parseFloat(n) / 255);
        return v.length === 3 && v.every(n => !Number.isNaN(n)) ? v : [0.93, 0.91, 0.87];
    }
    function syncInk() { ink()?.setTheme(paperRGB(), root.dataset.theme === 'night'); }
    function syncSwatches() {
        $$('.swatch').forEach(s => s.setAttribute('aria-pressed', String(s.dataset.ink === ink()?.colorName)));
    }
    function nextInkColor() {
        const color = ink()?.nextColor();
        syncSwatches();
        return color;
    }
    function setTheme(next, origin) {
        root.dataset.theme = next;
        store.set('ink-theme', next);
        syncInk();
        $$('[data-theme-toggle]').forEach(b => {
            b.setAttribute('aria-pressed', String(next === 'night'));
            const label = b.querySelector('.theme-switch-label');
            if (label) label.textContent = next === 'night' ? text('Day', '日间') : text('Night', '夜间');
            b.setAttribute('aria-label', next === 'night' ? text('Switch to day paper', '切换为日间纸色') : text('Switch to night paper', '切换为夜间纸色'));
        });
        if (origin && motion()) ink()?.burst(origin.x, origin.y, nextInkColor());
        syncSwatches();
        dispatchEvent(new CustomEvent('ink-theme', { detail: next }));
    }
    $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', e => {
        const r = b.getBoundingClientRect();
        setTheme(root.dataset.theme === 'night' ? 'day' : 'night', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        e.stopPropagation();
    }));
    function setMotion(on, remember = true) {
        const active = Boolean(on) && !reduced.matches;
        root.dataset.motion = active ? 'on' : 'off';
        if (remember) store.set('ink-motion', active ? 'on' : 'off');
        ink()?.setMotion(active);
        $$('[data-motion-toggle]').forEach(b => {
            b.setAttribute('aria-pressed', String(active));
            b.disabled = reduced.matches;
            b.title = reduced.matches ? text('Paused by the system’s reduced-motion setting', '已按系统的减少动态效果设置暂停') : '';
            b.textContent = reduced.matches ? text('Motion: reduced by system', '动效：跟随系统暂停') : active ? text('Motion: on', '动效：开启') : text('Motion: off', '动效：关闭');
        });
        root.dispatchEvent(new CustomEvent('ink:motionchange', { detail: { enabled: active } }));
        wake();
    }
    $$('[data-motion-toggle]').forEach(b => b.addEventListener('click', () => setMotion(!motion())));
    setTheme(root.dataset.theme === 'night' ? 'night' : 'day');
    setMotion(root.dataset.motion !== 'off', false);
    reduced.addEventListener('change', () => setMotion(!reduced.matches && store.get('ink-motion') !== 'off', false));

    /* ---------- Painting with the pointer ---------- */
    (() => {
        let lx = 0, ly = 0, lt = 0;
        addEventListener('pointermove', e => {
            if (!ink() || !motion()) return;
            const now = performance.now(), dt = Math.max(8, now - lt) / 1000;
            if (lt && now - lt < 120) {
                const vx = (e.clientX - lx) / dt, vy = (e.clientY - ly) / dt;
                const speed = Math.hypot(vx, vy);
                if (speed > 20) ink().splat(e.clientX, e.clientY, vx, vy, ink().color, 0.05 + Math.min(speed / 5000, 0.13), e.pointerType === 'touch' ? 0.6 : 0.32);
            }
            lx = e.clientX; ly = e.clientY; lt = now;
        }, { passive: true });
        addEventListener('pointerdown', e => {
            if (!ink() || !motion() || e.target.closest('a, button, input, textarea, select, label, summary, [data-sphere]')) return;
            ink().burst(e.clientX, e.clientY, nextInkColor());
        });
        const swatches = $$('.swatch');
        swatches.forEach(s => s.addEventListener('click', () => {
            if (!ink()) return;
            ink().setColor(s.dataset.ink);
            const r = s.getBoundingClientRect();
            if (motion()) ink().burst(r.left - 40, r.top + r.height / 2);
            syncSwatches();
        }));
        syncSwatches();
        // The hero and the contact act as open windows onto the paper; elsewhere the brushes rest.
        const open = $$('[data-ink-open]');
        if (open.length && ink()) {
            const seen = new Map();
            const io = new IntersectionObserver(entries => {
                entries.forEach(en => seen.set(en.target, en.intersectionRatio));
                const best = Math.max(0, ...seen.values());
                ink()?.setAmbient(0.12 + best * 0.88);
            }, { threshold: [0, .25, .5, .75, 1] });
            open.forEach(el => io.observe(el));
        } else ink()?.setAmbient(0.15);
    })();

    /* ---------- Cursor ---------- */
    (() => {
        const cursor = $('.cursor');
        if (!cursor || !fine.matches) return;
        const label = $('.cursor-label', cursor);
        let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, on = false;
        root.classList.add('has-cursor');
        function inspect(target) {
            const t = target?.closest?.('[data-cursor]');
            cursor.classList.toggle('has-label', !!t);
            if (t) label.textContent = t.dataset.cursor;
            cursor.classList.toggle('is-hover', !t && !!target?.closest?.('a, button, summary, label, .swatch'));
        }
        addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            tx = e.clientX; ty = e.clientY;
            if (!on) { x = tx; y = ty; on = true; cursor.classList.add('is-on'); }
            inspect(e.target);
            wake();
        }, { passive: true });
        // Content moves under a resting pointer while scrolling; re-read what is beneath it.
        addEventListener('scroll', () => { if (on) inspect(document.elementFromPoint(tx, ty)); }, { passive: true });
        document.addEventListener('pointerleave', () => { on = false; cursor.classList.remove('is-on'); });
        tasks.add(dt => {
            if (!on) return false;
            const k = motion() ? 1 - Math.exp(-dt / 0.07) : 1;
            x = lerp(x, tx, k); y = lerp(y, ty, k);
            cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            return Math.abs(tx - x) + Math.abs(ty - y) > 0.3;
        });
    })();

    /* ---------- Split text & reveals ---------- */
    function split(el) {
        const mode = el.dataset.split || 'words';
        let n = 0;
        (function walk(node) {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === 1) { if (child.tagName !== 'BR') walk(child); return; }
                if (child.nodeType !== 3 || !child.textContent.trim()) return;
                const frag = document.createDocumentFragment();
                textTokens(child.textContent).forEach(token => {
                    if (!token) return;
                    if (/^\s+$/.test(token)) { frag.append(token); return; }
                    const pieces = mode === 'chars' ? [...token] : [token];
                    const wordBox = document.createElement('span');
                    wordBox.style.whiteSpace = 'nowrap';
                    pieces.forEach(piece => {
                        const unit = document.createElement('span');
                        unit.className = 'split-unit';
                        const inner = document.createElement('span');
                        inner.className = 'split-inner';
                        inner.style.setProperty('--n', n++);
                        inner.textContent = piece;
                        unit.append(inner);
                        wordBox.append(unit);
                    });
                    frag.append(mode === 'chars' ? wordBox : wordBox.firstChild);
                });
                child.replaceWith(frag);
            });
        })(el);
        if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
        $$('.split-unit', el).forEach(u => u.setAttribute('aria-hidden', 'true'));
    }
    $$('[data-split]').forEach(split);
    const revealer = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        revealer.unobserve(en.target);
    }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    const holdHero = !!$('.loader:not([hidden])');
    $$('[data-split], .rise, .skill').forEach(el => {
        if (holdHero && el.closest('.hero')) return;
        revealer.observe(el);
    });
    function releaseHero() { $$('.hero [data-split], .hero .rise').forEach(el => el.classList.add('is-in')); }

    /* ---------- Loader (homepage, once per session) ---------- */
    (() => {
        const loader = $('.loader');
        if (!loader || loader.hidden) return;
        const count = $('.loader-count', loader);
        const stroke = $('.loader-stroke', loader);
        const finish = () => {
            loader.classList.add('is-done');
            try { sessionStorage.setItem('ink-intro', 'seen'); } catch { /* fine */ }
            setTimeout(releaseHero, 250);
            setTimeout(() => { loader.hidden = true; }, 1300);
            if (ink() && motion()) setTimeout(() => {
                if (motion()) ink()?.burst(innerWidth * 0.32, innerHeight * 0.62, nextInkColor());
            }, 350);
        };
        if (!motion()) { finish(); return; }
        const start = performance.now(), duration = 1700;
        (function step(now) {
            const p = clamp((now - start) / duration);
            const e = 1 - Math.pow(1 - p, 3);
            count.textContent = String(Math.round(e * 100)).padStart(3, '0');
            stroke.style.setProperty('--p', e.toFixed(3));
            if (p < 1) requestAnimationFrame(step); else setTimeout(finish, 220);
        })(start);
    })();

    /* ---------- Rotating roles ---------- */
    $$('.roller[data-roles]').forEach(roller => {
        const roles = roller.dataset.roles.split('|');
        let i = 0;
        setInterval(() => {
            if (!motion() || document.hidden) return;
            const old = roller.firstElementChild;
            i = (i + 1) % roles.length;
            const next = document.createElement('span');
            next.textContent = roles[i];
            next.className = 'is-in';
            old.classList.add('is-out');
            roller.append(next);
            setTimeout(() => old.remove(), 900);
        }, 2600);
    });

    /* ---------- Clocks ---------- */
    const clocks = $$('[data-clock]');
    if (clocks.length) {
        const fmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const paint = () => clocks.forEach(c => { c.textContent = fmt.format(new Date()); });
        paint(); setInterval(paint, 1000);
    }

    /* ---------- Scroll-scrubbed manifesto ---------- */
    $$('[data-scrub]').forEach(el => {
        (function wrap(node) {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === 1) { wrap(child); return; }
                if (child.nodeType !== 3) return;
                const frag = document.createDocumentFragment();
                textTokens(child.textContent).forEach(t => {
                    if (!t) return;
                    if (/^\s+$/.test(t)) { frag.append(t); return; }
                    const w = document.createElement('span'); w.className = 'w'; w.textContent = t; frag.append(w);
                });
                child.replaceWith(frag);
            });
        })(el);
        const words = $$('.w', el);
        tasks.add(() => {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) return false;
            const p = motion() ? clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)) : 1;
            const lit = p * words.length * 1.15;
            words.forEach((w, i) => w.style.setProperty('--o', (0.14 + 0.86 * clamp(lit - i)).toFixed(3)));
            return false;
        });
    });

    /* ---------- Velocity band ---------- */
    $$('.band-track').forEach(track => {
        track.innerHTML += track.innerHTML;
        let x = 0, v = 0, dir = -1, lastY = scrollY;
        tasks.add(dt => {
            const r = track.getBoundingClientRect();
            if (r.bottom < -50 || r.top > innerHeight + 50 || !motion()) { lastY = scrollY; return false; }
            const dy = scrollY - lastY; lastY = scrollY;
            v = lerp(v, dy / Math.max(dt, 0.008), 0.12);
            if (Math.abs(v) > 30) dir = v > 0 ? -1 : 1;
            const half = track.scrollWidth / 2;
            x += dir * (70 + Math.min(Math.abs(v) * 0.6, 1600)) * dt;
            if (x <= -half) x += half; if (x > 0) x -= half;
            track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${clamp(-v * 0.004, -10, 10).toFixed(2)}deg)`;
            return true;
        });
    });

    /* ---------- Stacked experience plates ---------- */
    (() => {
        const cards = $$('.stack-card');
        if (!cards.length) return;
        let measureFrame = 0;
        function measure() {
            measureFrame = 0;
            // Read the original sticky insets before applying the short-screen
            // fallback. Both positioning modes retain the same natural height.
            cards.forEach(card => card.removeAttribute('data-stack-static'));
            const oversized = cards.map(card =>
                card.offsetHeight > innerHeight - parseFloat(getComputedStyle(card).top) - 16
            );
            cards.forEach((card, i) => card.toggleAttribute('data-stack-static', oversized[i]));
            wake();
        }
        function queueMeasure() {
            if (!measureFrame) measureFrame = requestAnimationFrame(measure);
        }
        const sizes = new ResizeObserver(queueMeasure);
        cards.forEach(card => sizes.observe(card));
        addEventListener('resize', queueMeasure, { passive: true });
        document.fonts.ready.then(queueMeasure);
        measure();
        tasks.add(() => {
            cards.forEach((card, i) => {
                const next = cards[i + 1];
                if (card.hasAttribute('data-stack-static') || !next || !motion()) {
                    card.style.removeProperty('--s'); card.style.removeProperty('--b'); return;
                }
                const a = card.getBoundingClientRect(), b = next.getBoundingClientRect();
                const cover = clamp((a.bottom - b.top) / a.height);
                card.style.setProperty('--s', (1 - cover * 0.07).toFixed(4));
                card.style.setProperty('--b', (1 - cover * 0.28).toFixed(3));
            });
            return false;
        });
    })();

    /* ---------- Work list: floating preview ---------- */
    (() => {
        const preview = $('.work-preview');
        if (!preview || !fine.matches) return;
        const img = $('img', preview), tag = $('.work-preview-label', preview);
        let x = 0, y = 0, tx = 0, ty = 0, vx = 0, active = false;
        $$('.work-row').forEach(row => {
            row.addEventListener('pointerenter', e => {
                img.src = row.dataset.preview; tag.textContent = row.querySelector('.work-title').textContent;
                if (!active) { x = tx = e.clientX; y = ty = e.clientY; }
                active = true; preview.classList.add('is-on'); wake();
            });
            row.addEventListener('pointerleave', () => { active = false; preview.classList.remove('is-on'); });
        });
        addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
        tasks.add(dt => {
            if (!preview.classList.contains('is-on') && !active) return false;
            const k = motion() ? 1 - Math.exp(-dt / 0.12) : 1;
            const nx = lerp(x, tx, k);
            vx = lerp(vx, (nx - x) / Math.max(dt, 0.008), 0.2);
            x = nx; y = lerp(y, ty, k);
            const w = preview.offsetWidth, h = preview.offsetHeight;
            preview.style.transform = `translate3d(${(x - w * 0.5).toFixed(1)}px, ${(y - h * 0.62).toFixed(1)}px, 0) rotate(${clamp(vx * 0.012, -12, 12).toFixed(2)}deg)`;
            return true;
        });
    })();

    /* ---------- Typographic sphere ---------- */
    $$('[data-sphere]').forEach(sphere => {
        const items = $$('.sphere-item', sphere);
        const n = items.length;
        const pts = items.map((_, i) => {
            const y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5));
            return [Math.cos(phi) * r, y, Math.sin(phi) * r];
        });
        let ax = -0.25, ay = 0, vx = 0.0, vy = 0.18, drag = null, visible = false;
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; wake(); }).observe(sphere);
        sphere.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; sphere.setPointerCapture(e.pointerId); });
        sphere.addEventListener('pointermove', e => {
            if (drag) { vy = (e.clientX - drag.x) * 0.9; vx = -(e.clientY - drag.y) * 0.9; drag = { x: e.clientX, y: e.clientY }; wake(); }
        });
        const end = () => { drag = null; };
        sphere.addEventListener('pointerup', end); sphere.addEventListener('pointercancel', end);
        tasks.add(dt => {
            if (!visible) return false;
            if (motion()) {
                ax += vx * dt; ay += vy * dt;
                vx = lerp(vx, 0, 1 - Math.exp(-dt / 0.8));
                vy = lerp(vy, drag ? vy : 0.18, 1 - Math.exp(-dt / 1.2));
                ax = lerp(ax, -0.25, 1 - Math.exp(-dt / 3));
            }
            const R = sphere.clientWidth * 0.4;
            const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
            pts.forEach(([x0, y0, z0], i) => {
                const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy;
                const y2 = y0 * cx - z1 * sx, z2 = y0 * sx + z1 * cx;
                const depth = (z2 + 1) / 2;
                const el = items[i];
                el.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${(0.55 + depth * 0.75).toFixed(3)})`;
                el.style.opacity = (0.18 + depth * 0.82).toFixed(3);
                el.style.zIndex = String(Math.round(depth * 100));
                el.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 5).toFixed(1)}px)` : '';
            });
            return motion();
        });
    });

    /* ---------- Featured code typewriter ---------- */
    $$('[data-typewriter]').forEach(box => {
        const html = box.innerHTML;
        if (!motion()) return;
        // Reserve the final code height before clearing it for the animation.
        box.style.minHeight = `${box.getBoundingClientRect().height}px`;
        box.innerHTML = '';
        let complete = false;
        const finish = () => { complete = true; box.innerHTML = html; };
        root.addEventListener('ink:motionchange', e => { if (!e.detail.enabled && !complete) finish(); });
        const io = new IntersectionObserver(([en]) => {
            if (!en.isIntersecting) return;
            io.disconnect();
            if (complete) return;
            if (!motion()) { finish(); return; }
            const tmp = document.createElement('div'); tmp.innerHTML = html;
            const out = document.createElement('span'); box.append(out);
            const caret = document.createElement('span'); caret.className = 'caret'; box.append(caret);
            const nodes = [...tmp.childNodes];
            let ni = 0, ci = 0, current = null;
            (function type() {
                if (complete) return;
                if (!motion()) { finish(); return; }
                if (ni >= nodes.length) { complete = true; return; }
                const node = nodes[ni];
                const text = node.textContent;
                if (!current) { current = node.nodeType === 1 ? node.cloneNode(false) : document.createTextNode(''); out.append(current); }
                current.textContent = text.slice(0, ++ci);
                if (ci >= text.length) { ni++; ci = 0; current = null; }
                setTimeout(type, text[ci - 1] === '\n' ? 90 : 14 + Math.random() * 26);
            })();
        }, { threshold: 0.4 });
        io.observe(box);
    });

    /* ---------- Activity dot field ---------- */
    $$('[data-dots]').forEach(field => {
        const cols = innerWidth < 820 ? 26 : 52, rows = 7;
        const dots = [];
        for (let i = 0; i < cols * rows; i++) {
            const d = document.createElement('i');
            const s = Math.sin(i * 12.9898) * 43758.5453;
            const level = Math.pow(s - Math.floor(s), 2.2);
            d.style.setProperty('--a', (0.08 + level * 0.8).toFixed(2));
            dots.push({ el: d, c: i % cols, r: Math.floor(i / cols), level });
            field.append(d);
        }
        let px = -99, py = -99, visible = false;
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; wake(); }).observe(field);
        field.addEventListener('pointermove', e => {
            const rect = field.getBoundingClientRect();
            px = (e.clientX - rect.left) / rect.width * cols; py = (e.clientY - rect.top) / rect.height * rows; wake();
        });
        field.addEventListener('pointerleave', () => { px = py = -99; });
        tasks.add((dt, t) => {
            if (!visible) return false;
            dots.forEach(d => {
                const wave = motion() ? (Math.sin(d.c * 0.35 - t * 2.2 + d.r * 0.6) + 1) / 2 : 0.5;
                const near = Math.exp(-((d.c - px) ** 2 + ((d.r - py) * 1.4) ** 2) / 6);
                d.el.style.setProperty('--z', (0.45 + d.level * 0.35 + wave * 0.18 + near * 0.7).toFixed(3));
            });
            return motion();
        });
    });

    /* ---------- Testimonials ---------- */
    $$('[data-quotes]').forEach(box => {
        const items = $$('template', box).map(t => t.content);
        const quote = $('.quote', box), name = $('.quote-name', box), role = $('.quote-role', box), dots = $('.quote-dots', box);
        let i = 0, timer = 0;
        const buttons = items.map((_, k) => {
            const b = document.createElement('button');
            b.type = 'button'; b.setAttribute('aria-label', text(`Show testimonial ${k + 1}`, `显示第 ${k + 1} 条评价`));
            b.addEventListener('click', () => show(k));
            dots.append(b); return b;
        });
        function chars(text) {
            quote.textContent = '';
            let n = 0;
            // Characters animate individually but words never break across lines.
            textTokens(text).forEach(token => {
                if (/^\s+$/.test(token)) { quote.append(' '); return; }
                const word = document.createElement('span');
                word.style.whiteSpace = 'nowrap';
                [...token].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--n', n++); s.textContent = ch; word.append(s); });
                quote.append(word);
            });
        }
        function show(k) {
            clearTimeout(timer);
            const item = items[k]; i = k;
            buttons.forEach((b, j) => b.setAttribute('aria-current', String(j === k)));
            const apply = () => {
                quote.classList.add('is-entering');
                chars(item.querySelector('.q').textContent);
                name.textContent = item.querySelector('.n').textContent;
                role.textContent = item.querySelector('.r').textContent;
                requestAnimationFrame(() => requestAnimationFrame(() => quote.classList.remove('is-entering')));
            };
            if (motion() && quote.childNodes.length) { quote.classList.add('is-leaving'); setTimeout(() => { quote.classList.remove('is-leaving'); apply(); }, 450); }
            else apply();
            const advance = () => {
                if (motion() && !document.hidden && !box.matches(':hover,:focus-within')) show((i + 1) % items.length);
                else timer = setTimeout(advance, 1000);
            };
            timer = setTimeout(advance, 6000);
        }
        show(0);
    });

    /* ---------- Next chapter line ---------- */
    $$('.chapter-line').forEach(line => {
        tasks.add(() => {
            const r = line.getBoundingClientRect();
            line.style.setProperty('--draw', motion() ? clamp((innerHeight * 0.9 - r.top) / (innerHeight * 0.6)).toFixed(3) : '1');
            return false;
        });
    });

    /* ---------- Magnetic elements ---------- */
    $$('[data-magnetic]').forEach(el => {
        el.addEventListener('pointermove', e => {
            if (!motion() || e.pointerType !== 'mouse') return;
            const r = el.getBoundingClientRect();
            el.style.translate = `${((e.clientX - r.left) / r.width - 0.5) * 30}px ${((e.clientY - r.top) / r.height - 0.5) * 30}px`;
        });
        el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });

    /* ---------- Fit-to-width type ---------- */
    function fit() {
        $$('[data-fit]').forEach(el => {
            el.style.fontSize = '';
            const cs = getComputedStyle(el.parentElement);
            const room = el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            const w = el.getBoundingClientRect().width;
            if (w > 0) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * room / w * 0.995}px`;
        });
    }
    fit(); document.fonts?.ready.then(fit); addEventListener('resize', fit, { passive: true });

    /* ---------- Contact: same endpoint as the existing personal site ---------- */
    $$('form[data-contact]').forEach(form => form.addEventListener('submit', async e => {
        e.preventDefault();
        const status = $('.form-status', form);
        const button = $('.send', form), original = button.textContent;
        if (button.disabled) return;
        button.disabled = true;
        button.textContent = text('Sending…', '发送中…');
        status.textContent = '';
        try {
            const payload = Object.fromEntries(new FormData(form));
            payload.subject = text('Portfolio message', '个人网站留言');
            const response = await fetch(form.action, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
            });
            if (!response.ok) throw new Error('Contact request failed');
            status.textContent = text('Message sent. I’ll get back to you soon.', '消息已发送，我会尽快回复你。');
            form.reset();
            const btn = button.getBoundingClientRect();
            if (motion()) ink()?.burst(btn.left + btn.width / 2, btn.top + btn.height / 2, nextInkColor());
        } catch {
            status.textContent = text('Could not send. Please try again later.', '发送失败，请稍后重试。');
        } finally {
            button.disabled = false;
            button.textContent = original;
        }
    }));

    /* ---------- Preserve section/filter context when changing language ---------- */
    function syncLanguageLinks() {
        $$('[data-language-switch]').forEach(link => {
            const destination = new URL(link.href, location.href);
            destination.hash = location.hash;
            if ($('[data-archive]')) {
                const topic = $('.filter[aria-pressed="true"]')?.dataset.filter || 'all';
                const query = $('.search')?.value.trim() || '';
                if (topic === 'all') destination.searchParams.delete('topic'); else destination.searchParams.set('topic', topic);
                if (query) destination.searchParams.set('q', query); else destination.searchParams.delete('q');
            } else destination.search = location.search;
            link.href = destination.href;
        });
    }
    syncLanguageLinks();
    addEventListener('hashchange', syncLanguageLinks);

    /* ---------- Menu ---------- */
    (() => {
        const button = $('.menu-button'), menu = $('#menu');
        if (!button || !menu) return;
        const background = [$('main'), $('.colophon')].filter(Boolean);
        let savedOverflow = '';
        const set = (open, restoreFocus = false) => {
            const wasOpen = menu.classList.contains('is-open');
            if (open && !wasOpen) savedOverflow = document.body.style.overflow;
            menu.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', String(open));
            button.textContent = open ? text('Close', '关闭') : text('Menu', '菜单');
            button.setAttribute('aria-label', button.textContent);
            background.forEach(el => { el.inert = open; });
            document.body.style.overflow = open ? 'hidden' : savedOverflow;
            if (open) menu.querySelector('a')?.focus({ preventScroll: true });
            else if (restoreFocus) (button.getClientRects().length ? button : $('.brand'))?.focus({ preventScroll: true });
        };
        button.addEventListener('click', () => set(!menu.classList.contains('is-open')));
        menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
        addEventListener('keydown', e => {
            if (!menu.classList.contains('is-open')) return;
            if (e.key === 'Escape') { e.preventDefault(); set(false, true); return; }
            if (e.key !== 'Tab') return;
            const controls = $$('.masthead a, .masthead button, #menu a, #menu button').filter(el => !el.disabled && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
            const first = controls[0], last = controls[controls.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        });
        matchMedia('(min-width: 821px)').addEventListener('change', e => {
            if (e.matches && menu.classList.contains('is-open')) set(false, true);
        });
    })();

    /* ---------- Back to top ---------- */
    $$('[data-top]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: motion() ? 'smooth' : 'auto' }); }));

    /* ---------- Ink-bleed page transitions start where you clicked ---------- */
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (!a || a.target || a.origin !== location.origin || a.hash && a.pathname === location.pathname) return;
        try { sessionStorage.setItem('ink-origin', JSON.stringify({ x: e.clientX / innerWidth * 100, y: e.clientY / innerHeight * 100 })); } catch { /* fine */ }
    });
    // A skipped transition (slow fonts, rapid clicks) is normal; never surface it as an error.
    const quiet = vt => ['ready', 'finished', 'updateCallbackDone'].forEach(k => vt[k]?.catch?.(() => {}));
    addEventListener('pagereveal', e => {
        if (!e.viewTransition) return;
        quiet(e.viewTransition);
        if (!motion()) { e.viewTransition.skipTransition(); return; }
        try {
            const o = JSON.parse(sessionStorage.getItem('ink-origin') || 'null');
            if (o) { root.style.setProperty('--vx', `${o.x}%`); root.style.setProperty('--vy', `${o.y}%`); }
        } catch { /* fine */ }
        e.viewTransition.finished.catch(() => {});
    });
    addEventListener('pageswap', e => { if (!e.viewTransition) return; quiet(e.viewTransition); if (!motion()) e.viewTransition.skipTransition(); });

    /* ---------- Journal archive: topics + search ---------- */
    (() => {
        const list = $('[data-archive]');
        if (!list) return;
        const rows = $$('.journal-row', list).map(row => ({ row, li: row.closest('li') }));
        const search = $('.search'), count = $('.archive-count'), filters = $$('.filter');
        const params = new URLSearchParams(location.search);
        const requestedTopic = params.get('topic') || 'all';
        let topic = filters.some(f => f.dataset.filter === requestedTopic) ? requestedTopic : 'all';
        if (search) search.value = params.get('q') || '';
        function apply() {
            const q = (search?.value || '').trim().toLowerCase();
            let shown = 0;
            rows.forEach(({ row, li }) => {
                const ok = (topic === 'all' || row.dataset.topic === topic) && (!q || row.textContent.toLowerCase().includes(q));
                li.hidden = !ok; if (ok) shown++;
            });
            filters.forEach(f => f.setAttribute('aria-pressed', String(f.dataset.filter === topic)));
            if (count) count.textContent = text(`Showing ${shown} of ${rows.length}`, `显示 ${shown} / ${rows.length} 篇`);
            syncLanguageLinks();
        }
        filters.forEach(f => f.addEventListener('click', () => { topic = f.dataset.filter; apply(); }));
        search?.addEventListener('input', apply);
        apply();
    })();

    /* ---------- Reading progress & table of contents ---------- */
    (() => {
        const bar = $('.progress i');
        const toc = $$('.toc a');
        const body = $('.prose');
        if (!bar && !toc.length) return;
        const targets = toc.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
        tasks.add(() => {
            if (bar && body) {
                const r = body.getBoundingClientRect();
                bar.parentElement.style.setProperty('--p', clamp(-r.top / Math.max(1, r.height - innerHeight)).toFixed(4));
                bar.style.setProperty('--p', clamp(-r.top / Math.max(1, r.height - innerHeight)).toFixed(4));
            }
            let active = 0;
            targets.forEach((t, i) => { if (t.getBoundingClientRect().top < innerHeight * 0.35) active = i; });
            toc.forEach((a, i) => a.classList.toggle('is-active', i === active));
            return false;
        });
    })();

    /* ---------- Case-study media parallax ---------- */
    $$('.case-media img').forEach(img => {
        tasks.add(() => {
            const r = img.parentElement.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) return false;
            img.style.setProperty('--py', motion() ? `${(-(1 - (r.bottom / (innerHeight + r.height))) * 16).toFixed(2)}%` : '0%');
            return false;
        });
    });

    wake();
})();
