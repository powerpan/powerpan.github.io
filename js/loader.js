/* ========================================
   LOADER — Terminal intro, once per browser
======================================== */
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

(() => {
    const root = document.documentElement;
    const key = 'intro-seen';
    let seen = false;
    let motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
        seen = localStorage.getItem(key) === 'yes';
        motion = motion && localStorage.getItem('site-motion') !== 'off';
    } catch (_) { /* Fall back to the current tab when persistent storage is blocked. */ }
    try { seen = seen || sessionStorage.getItem(key) === 'yes'; } catch (_) {}
    if (seen) {
        try { localStorage.setItem(key, 'yes'); } catch (_) {}
    }

    // Decide in the head so returning visitors never see a loading flash.
    let shouldPlay = !seen && !location.hash && motion;
    if (!shouldPlay) return;
    root.classList.add('intro-pending');
    const fallback = setTimeout(() => {
        shouldPlay = false;
        root.classList.remove('intro-pending');
    }, 8000);

    function start() {
        clearTimeout(fallback);
        const loader = document.getElementById('loader');
        const body = document.getElementById('loaderBody');
        if (!shouldPlay || !loader || !body || window.SiteMotion?.enabled === false) {
            root.classList.remove('intro-pending');
            return;
        }
        let finished = false;
        let unsubscribe = () => {};

        function dismiss(remember = true) {
            if (finished) return;
            finished = true;
            unsubscribe();
            loader.classList.add('done');
            loader.classList.remove('active');
            root.classList.remove('intro-pending');
            loader.setAttribute('aria-hidden', 'true');
            if (loader.contains(document.activeElement)) document.activeElement.blur();
            if (remember) {
                try { localStorage.setItem(key, 'yes'); } catch (_) {}
                try { sessionStorage.setItem(key, 'yes'); } catch (_) {}
            }
        }

        document.getElementById('loaderSkip')?.addEventListener('click', () => dismiss());
        window.addEventListener('pagehide', () => dismiss());
        window.addEventListener('storage', event => {
            if (event.key === key && event.newValue === 'yes') dismiss(false);
        });
        loader.classList.add('active');
        loader.setAttribute('aria-hidden', 'false');
        root.classList.remove('intro-pending');
        if (window.SiteMotion) unsubscribe = SiteMotion.subscribe(active => { if (!active) dismiss(); });

        const progress = document.createElement('div');
        progress.className = 'loader-bar-wrap';
        progress.setAttribute('aria-hidden', 'true');
        const track = document.createElement('div');
        track.className = 'loader-bar';
        const fill = document.createElement('div');
        fill.className = 'loader-bar-fill';
        const percent = document.createElement('span');
        percent.className = 'loader-bar-pct';
        percent.textContent = '0%';
        track.appendChild(fill);
        progress.append(track, percent);
        body.appendChild(progress);

        (async () => {
            const lines = ['hello, visitor.', 'code. vision. possibility.', 'welcome to my corner of the web.'];
            await sleep(180);
            for (const [index, text] of lines.entries()) {
                if (finished) return;
                const line = document.createElement('div');
                line.className = 'loader-line done';
                const prompt = document.createElement('span');
                prompt.className = 'prompt';
                prompt.textContent = '>';
                const command = document.createElement('span');
                command.className = 'cmd';
                command.textContent = text;
                line.append(prompt, command);
                body.insertBefore(line, progress);
                const value = Math.round((index + 1) / lines.length * 100);
                fill.style.width = value + '%';
                percent.textContent = value + '%';
                await sleep(600);
            }
            if (finished) return;
            await sleep(620);
            dismiss();
        })();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
