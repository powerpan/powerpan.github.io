/* ========================================
   MOTION — Shared clock, visibility, preferences
======================================== */
(() => {
    const root = document.documentElement;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggle = document.getElementById('motionToggle');
    const tasks = [];
    const listeners = new Set();
    let userEnabled = true;
    let frame = 0;
    let lastTime = 0;

    try {
        userEnabled = localStorage.getItem('site-motion') !== 'off';
    } catch (_) { /* Motion still works when storage is unavailable. */ }

    function enabled() {
        return userEnabled && !preference.matches;
    }

    function wake() {
        if (!frame && enabled() && !document.hidden && tasks.some(task => task.visible)) {
            frame = requestAnimationFrame(tick);
        }
    }

    function tick(now) {
        frame = 0;
        const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
        lastTime = now;
        tasks.forEach(task => {
            if (!task.visible) return;
            task.time += delta;
            task.render(task.time, delta);
        });
        wake();
    }

    function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
    }

    function sync() {
        stop();
        root.dataset.motion = enabled() ? 'on' : 'off';
        if (toggle) {
            toggle.hidden = false;
            toggle.setAttribute('aria-pressed', String(enabled()));
            toggle.disabled = preference.matches;
            toggle.dataset.i18nTitle = preference.matches ? 'motion_system' : 'motion_hint';
            toggle.title = getCurrentTranslations()[toggle.dataset.i18nTitle] || '';
        }
        listeners.forEach(listener => listener(enabled()));
        tasks.forEach(task => task.render(task.time, 0));
        wake();
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            tasks.filter(task => task.element === entry.target).forEach(task => {
                task.visible = entry.isIntersecting;
            });
        });
        if (!tasks.some(task => task.visible)) stop();
        wake();
    });

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('motion-outside', !entry.isIntersecting));
    }, { rootMargin: '80px' });
    document.querySelectorAll('section').forEach(section => sectionObserver.observe(section));

    window.SiteMotion = {
        get enabled() { return enabled(); },
        animate(element, render) {
            if (!element) return;
            tasks.push({ element, render, time: 0, visible: false });
            render(0, 0);
            observer.observe(element);
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(enabled());
        }
    };

    toggle?.addEventListener('click', () => {
        userEnabled = !userEnabled;
        try {
            localStorage.setItem('site-motion', userEnabled ? 'on' : 'off');
        } catch (_) { /* The current visit does not require persistence. */ }
        sync();
    });
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', () => {
        stop();
        root.classList.toggle('page-hidden', document.hidden);
        wake();
    });
    sync();
})();
