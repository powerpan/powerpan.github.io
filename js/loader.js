/* ========================================
   LOADER — Brief intro, once per session
======================================== */
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

(() => {
    const loader = document.getElementById('loader');
    const body = document.getElementById('loaderBody');
    if (!loader || !body) return;
    let seen = false;
    let finished = false;
    try { seen = sessionStorage.getItem('intro-seen') === 'yes'; } catch (_) {}

    function dismiss() {
        finished = true;
        loader.classList.add('done');
        loader.classList.remove('active');
        loader.setAttribute('aria-hidden', 'true');
        if (loader.contains(document.activeElement)) document.activeElement.blur();
        try { sessionStorage.setItem('intro-seen', 'yes'); } catch (_) {}
    }

    document.getElementById('loaderSkip')?.addEventListener('click', dismiss);
    if (seen || location.hash || !SiteMotion.enabled) {
        dismiss();
        return;
    }

    loader.classList.add('active');
    loader.setAttribute('aria-hidden', 'false');
    SiteMotion.subscribe(active => { if (!active) dismiss(); });

    (async () => {
        const lines = ['hello, visitor.', 'code. vision. possibility.', 'welcome to my corner of the web.'];
        for (const text of lines) {
            if (finished) return;
            const line = document.createElement('div');
            line.className = 'loader-line done';
            line.textContent = '> ' + text;
            body.appendChild(line);
            await sleep(180);
        }
        await sleep(150);
        dismiss();
    })();
})();
