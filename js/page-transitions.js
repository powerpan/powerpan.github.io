/* Native cross-document transitions. Links, history and downloads stay native. */
(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let transientEnabled = null;
    function enabled() {
        if (window.SiteMotion) return window.SiteMotion.enabled;
        if (reduced.matches) return false;
        if (transientEnabled !== null) return transientEnabled;
        try { return localStorage.getItem('site-motion') !== 'off'; }
        catch { return !reduced.matches; }
    }
    function sync() {
        root.dataset.motion = enabled() ? 'on' : 'off';
        document.querySelectorAll('[data-page-motion]').forEach(button => {
            button.setAttribute('aria-pressed', String(enabled()));
            button.disabled = reduced.matches;
        });
    }
    sync();
    function respectPreference(event) {
        sync();
        // Cancellation is normal on rapid navigation, resizing or a changed motion preference.
        event.viewTransition?.ready?.catch(() => {});
        event.viewTransition?.finished?.catch(() => {});
        if (!enabled()) event.viewTransition?.skipTransition();
    }
    addEventListener('pageswap', event => {
        respectPreference(event);
        if (!event.viewTransition || !enabled() || !event.activation?.entry?.url ||
            !matchMedia('(min-width: 901px) and (pointer: fine)').matches) return;
        if (document.querySelector('h1.detail-title, h1.blog-article-title')) return;
        // Match only a visible destination card; do not intercept links or name offscreen duplicates.
        const anchor = [...document.querySelectorAll('a[href]')].find(link => {
            if (link.href !== event.activation.entry.url) return false;
            const rect = link.getBoundingClientRect();
            return rect.top < innerHeight && rect.bottom > 0 && rect.width > 0;
        });
        const title = anchor?.querySelector('.project-title, .blog-item-title, .blog-list-title') ||
            (anchor?.closest('.atlas-panel') ? anchor : null);
        if (!title) return;
        title.style.viewTransitionName = 'story-title';
        const clear = () => title.style.removeProperty('view-transition-name');
        event.viewTransition.finished.then(clear, clear);
    });
    addEventListener('pagereveal', respectPreference);
    addEventListener('pageshow', sync);
    addEventListener('storage', event => { if (event.key === 'site-motion') sync(); });
    reduced.addEventListener('change', sync);
    document.addEventListener('DOMContentLoaded', sync, { once: true });
    document.addEventListener('click', event => {
        const button = event.target.closest?.('[data-page-motion]');
        if (!button || reduced.matches) return;
        const next = !enabled();
        try { localStorage.setItem('site-motion', next ? 'on' : 'off'); }
        catch {
            // In private/blocked storage the current page still honors the switch.
            transientEnabled = next;
            root.dataset.motion = next ? 'on' : 'off';
            button.setAttribute('aria-pressed', String(next));
            return;
        }
        sync();
    });
})();
