/* ========================================
   SCENE FLOW - Scroll position, never scroll capture
======================================== */
(() => {
    function sceneProgress(top, height, viewport) {
        if (viewport <= 0 || height < 0) return 0;
        return Math.min(1, Math.max(0, (viewport * 0.85 - top) / (viewport * 0.65 + height)));
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { sceneProgress };
        return;
    }
    if (!window.SiteMotion) return;
    const scenes = [...document.querySelectorAll('.scene-bridge')].map(element => {
        const path = element.querySelector('.scene-trace');
        return { element, path, length: path.getTotalLength(), dots: [...element.querySelectorAll('circle')], visible: false };
    });
    let frame = 0;
    function paint() {
        frame = 0;
        scenes.forEach(scene => {
            if (!scene.visible && SiteMotion.enabled) return;
            const rect = scene.element.getBoundingClientRect();
            const progress = SiteMotion.enabled ? sceneProgress(rect.top, rect.height, innerHeight) : 1;
            scene.path.style.strokeDashoffset = String(1 - progress);
            scene.element.style.setProperty('--scene-light', String(Math.sin(progress * Math.PI)));
            scene.dots.forEach((dot, i) => {
                const phase = Math.max(0, progress - i * 0.1);
                const point = scene.path.getPointAtLength(phase * scene.length);
                dot.setAttribute('cx', point.x); dot.setAttribute('cy', point.y);
                dot.style.opacity = String(phase > 0 && phase < 1 ? 1 - i * 0.25 : 0);
            });
        });
    }
    function schedule() {
        if (!frame && SiteMotion.enabled && !document.hidden && scenes.some(scene => scene.visible)) frame = requestAnimationFrame(paint);
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { scenes.find(scene => scene.element === entry.target).visible = entry.isIntersecting; });
        schedule();
    }, { rootMargin: '80px' });
    scenes.forEach(scene => observer.observe(scene.element));
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    SiteMotion.subscribe(() => { cancelAnimationFrame(frame); frame = 0; paint(); });
})();
