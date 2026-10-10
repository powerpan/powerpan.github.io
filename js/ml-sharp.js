/* A progressively enhanced, opt-in media gallery. No background animation loop. */
(function () {
    'use strict';

    function initSharpGallery(root, doc) {
        if (!root || root.dataset.ready) return;
        const tabs = Array.from(root.querySelectorAll('[data-sharp-tab]'));
        const panels = Array.from(root.querySelectorAll('[data-sharp-scene]'));
        const tablist = root.querySelector('[data-sharp-tabs]');
        const videos = Array.from(root.querySelectorAll('video'));
        if (!tablist || !tabs.length || tabs.length !== panels.length) return;
        root.dataset.ready = 'true';
        tablist.hidden = false;
        tablist.setAttribute('role', 'tablist');

        function pauseAll(except) {
            videos.forEach(video => { if (video !== except) video.pause(); });
        }

        function select(index, focus) {
            pauseAll();
            tabs.forEach((tab, i) => {
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-selected', String(i === index));
                tab.tabIndex = i === index ? 0 : -1;
                panels[i].hidden = i !== index;
                panels[i].setAttribute('role', 'tabpanel');
                panels[i].setAttribute('aria-labelledby', tab.id);
            });
            if (focus) tabs[index].focus();
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => select(index, false));
            tab.addEventListener('keydown', event => {
                const next = { ArrowRight: (index + 1) % tabs.length,
                    ArrowLeft: (index + tabs.length - 1) % tabs.length,
                    Home: 0, End: tabs.length - 1 }[event.key];
                if (next === undefined) return;
                event.preventDefault();
                select(next, true);
            });
        });

        panels.forEach(panel => {
            const video = panel.querySelector('video');
            const button = panel.querySelector('[data-sharp-play]');
            const error = panel.querySelector('.sharp-error');
            button.hidden = false;
            button.addEventListener('click', async () => {
                error.hidden = true;
                try {
                    video.currentTime = 0;
                    await video.play();
                    // A scene switch or tab hide can happen while playback is pending.
                    if (panel.hidden || doc.hidden) video.pause();
                } catch (reason) {
                    if (reason.name !== 'AbortError' && !panel.hidden && !doc.hidden) error.hidden = false;
                }
            });
            video.addEventListener('play', () => {
                if (panel.hidden || doc.hidden) { video.pause(); return; }
                error.hidden = true;
                pauseAll(video);
            });
            video.addEventListener('error', () => { error.hidden = false; });
        });

        doc.addEventListener('visibilitychange', () => { if (doc.hidden) pauseAll(); });
        doc.defaultView.addEventListener('pagehide', () => pauseAll());
        // Pause when a reader leaves the video behind; never resume automatically.
        const Observer = doc.defaultView.IntersectionObserver;
        if (Observer) {
            const observer = new Observer(entries => {
                entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
            });
            videos.forEach(video => observer.observe(video));
        }
        select(0, false);
    }

    if (typeof module === 'object' && module.exports) module.exports = { initSharpGallery };
    if (typeof document !== 'undefined') initSharpGallery(document.getElementById('gallery'), document);
}());
