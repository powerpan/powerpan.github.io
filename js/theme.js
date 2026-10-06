/* Theme is restored in the head; only an explicit switch starts the finite ribbon. */
(() => {
    const root = document.documentElement;
    const key = 'site-theme';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let theme = 'dark';
    function storedTheme() {
        try { return localStorage.getItem(key) === 'light' ? 'light' : 'dark'; }
        catch (_) { return theme; }
    }
    theme = storedTheme();
    root.dataset.theme = theme;
    let running = false, revision = 0, frameId = 0, transition, animation;
    let button, canvas, ctx, announcement;

    function english() { return root.lang.startsWith('en'); }
    function label(name) {
        const translations = typeof getCurrentTranslations === 'function' ? getCurrentTranslations() : {};
        const fallback = english() ? {
            theme_to_light: 'Switch to light theme', theme_to_dark: 'Switch to dark theme',
            theme_status_light: 'Light theme enabled', theme_status_dark: 'Dark theme enabled',
        } : {
            theme_to_light: '切换到浅色主题', theme_to_dark: '切换到深色主题',
            theme_status_light: '已切换到浅色主题', theme_status_dark: '已切换到深色主题',
        };
        return translations[name] || fallback[name];
    }
    function sync(announce = false) {
        if (!button) return;
        const next = theme === 'dark' ? 'light' : 'dark';
        button.hidden = false;
        button.setAttribute('aria-pressed', String(theme === 'light'));
        button.setAttribute('aria-label', label('theme_to_' + next));
        button.title = label('theme_to_' + next);
        if (announce && announcement) announcement.textContent = label('theme_status_' + theme);
    }
    function commit(next, persist = true, announce = true) {
        theme = next;
        root.dataset.theme = theme;
        window.SiteTheme.amount = theme === 'light' ? 1 : 0;
        window.dispatchEvent(new Event('site-theme-change'));
        if (persist) {
            try { localStorage.setItem(key, theme); } catch (_) { /* The current visit remains usable. */ }
        }
        sync(announce);
    }
    function cleanup() {
        cancelAnimationFrame(frameId);
        frameId = 0;
        animation?.cancel();
        // Release the full-viewport bitmap when the decorative pass is finished.
        if (canvas) canvas.width = canvas.height = 1;
        delete root.dataset.themeTransition;
        running = false;
        if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
        transition = animation = undefined;
    }
    function stop() {
        if (!running) return;
        revision++;
        transition?.skipTransition();
        cleanup();
    }
    function motionEnabled() {
        if (reduced.matches || document.hidden) return false;
        if (window.SiteMotion) return window.SiteMotion.enabled;
        return root.dataset.motion !== 'off';
    }
    function stroke(points) {
        ctx.beginPath();
        points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath();
        ctx.stroke();
    }
    function paint(p, width, height, phase, center, light) {
        const f = ThemeRibbon.frame(p, width, height, phase, center);
        const envelope = Math.sin(Math.PI * p) * (1 - ThemeRibbon.ease((p - 0.78) / 0.22));
        const gradient = ctx.createLinearGradient(0, height, width, 0);
        gradient.addColorStop(0, light ? '#08734f' : '#00f68c');
        gradient.addColorStop(0.32, light ? '#324d47' : '#b7f5db');
        gradient.addColorStop(0.48, light ? '#e6eee9' : '#ffffff');
        gradient.addColorStop(0.63, light ? '#537268' : '#629f89');
        gradient.addColorStop(1, light ? '#137b61' : '#00ff88');
        ctx.strokeStyle = gradient;
        for (const [lineWidth, alpha] of [[22, 0.08], [9, 0.2], [2.8, 0.94]]) {
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = envelope * alpha;
            stroke(f.outer);
            if (f.innerRadius > 0.5) stroke(f.inner);
        }
        for (let i = 1; i <= 3; i++) {
            ctx.lineWidth = 0.7;
            ctx.globalAlpha = envelope * (0.38 - i * 0.07);
            stroke(ThemeRibbon.contour(f.outerRadius * (1 - i * 0.034), f.phase - i * 0.15, f.cx, f.cy));
        }
    }
    async function toggle() {
        if (running) return;
        const next = theme === 'dark' ? 'light' : 'dark';
        if (!button || !motionEnabled() || !document.startViewTransition || !window.ThemeRibbon ||
            !CSS.supports('clip-path', ThemeRibbon.clip(ThemeRibbon.frame(0, innerWidth, innerHeight)))) {
            commit(next);
            return;
        }
        running = true;
        const ticket = ++revision;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        const width = innerWidth, height = innerHeight;
        const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(800000 / Math.max(1, width * height)));
        canvas.width = Math.max(1, Math.floor(width * ratio));
        canvas.height = Math.max(1, Math.floor(height * ratio));
        ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
        const hero = document.getElementById('hero')?.getBoundingClientRect();
        const center = hero && hero.bottom > height * 0.6 && hero.top < height * 0.5 ?
            [width * 0.5, Math.max(height * 0.25, Math.min(height * 0.75, hero.top + hero.height * 0.51))] : [width * 0.5, height * 0.48];
        const phase = window.SiteTheme.phase;
        const duration = width < 600 || height < 520 ? 1200 : 1600;
        root.dataset.themeTransition = 'wave';
        try {
            transition = document.startViewTransition(() => {
                // A resize/second visit can supersede a callback not yet run by the browser.
                if (ticket === revision) commit(next);
            });
            await transition.ready;
            if (!running || ticket !== revision) return;
            animation = root.animate(ThemeRibbon.keyframes(width, height, phase, center), {
                duration, easing: 'linear', fill: 'both', pseudoElement: '::view-transition-new(root)',
            });
            const start = performance.now();
            let lastPaint = -100;
            function tick(now) {
                if (!running || ticket !== revision) return;
                const p = Math.min(1, (now - start) / duration);
                if (ctx && now - lastPaint >= 1000 / 30) {
                    ctx.clearRect(0, 0, width, height);
                    paint(p, width, height, phase, center, next === 'light');
                    lastPaint = now;
                }
                if (p < 1) frameId = requestAnimationFrame(tick);
            }
            frameId = requestAnimationFrame(tick);
            await animation.finished;
            await transition.finished;
        } catch (_) {
            if (ticket === revision) { transition?.skipTransition(); commit(next); }
        } finally { if (ticket === revision) cleanup(); }
    }
    window.SiteTheme = { amount: theme === 'light' ? 1 : 0, phase: 0, get theme() { return theme; }, toggle };

    document.addEventListener('DOMContentLoaded', () => {
        button = document.getElementById('themeToggle');
        if (!button) return;
        canvas = document.createElement('canvas');
        canvas.className = 'theme-wave-front';
        canvas.width = canvas.height = 1;
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        announcement = document.createElement('span');
        announcement.className = 'theme-announcement';
        announcement.setAttribute('role', 'status');
        document.body.appendChild(announcement);
        button.addEventListener('click', event => { event.stopPropagation(); toggle(); });
        window.SiteMotion?.subscribe(active => { if (!active) stop(); });
        new MutationObserver(() => sync()).observe(root, { attributes: true, attributeFilter: ['lang'] });
        sync();
    }, { once: true });
    window.addEventListener('resize', stop, { passive: true });
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageswap', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    reduced.addEventListener('change', event => { if (event.matches) stop(); });
    window.addEventListener('storage', event => {
        if (event.key !== key && event.key !== null) return;
        stop();
        commit(event.newValue === 'light' ? 'light' : 'dark', false, false);
    });
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        stop();
        commit(storedTheme(), false, false);
    });
})();
