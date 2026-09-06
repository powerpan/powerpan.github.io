/* ========================================
   CURSOR — A quiet, demand-driven pointer halo
======================================== */
(() => {
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursorDot');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
    if (!cursor || !dot) return;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let frame = 0;
    let visible = false;

    function hide() {
        visible = false;
        cancelAnimationFrame(frame);
        frame = 0;
        document.body.classList.remove('custom-cursor-active');
    }

    function tick() {
        x += (targetX - x) * 0.22;
        y += (targetY - y) * 0.22;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.15
            ? requestAnimationFrame(tick) : 0;
    }

    document.addEventListener('pointermove', event => {
        if (!finePointer.matches || !SiteMotion.enabled || event.pointerType === 'touch') return hide();
        // Keep the familiar text caret while editing or selecting form content.
        if (event.target.closest('input, textarea, [contenteditable="true"]')) return hide();
        targetX = event.clientX;
        targetY = event.clientY;
        if (!visible) {
            x = targetX; y = targetY; visible = true;
            document.body.classList.add('custom-cursor-active');
        }
        dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
        cursor.classList.toggle('hovering', !!event.target.closest('a, button, [data-hover], [role="button"]'));
        if (!frame) frame = requestAnimationFrame(tick);
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('keydown', event => { if (event.key === 'Tab') hide(); });
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('blur', hide);
    finePointer.addEventListener('change', hide);
    SiteMotion.subscribe(hide);
})();
