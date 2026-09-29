/* ========================================
   SHOWCASE - Scroll-charged experience timeline
======================================== */
(() => {
    function chargeAt(top, height, viewport) {
        if (height <= 0 || viewport <= 0) return 0;
        return Math.min(1, Math.max(0, (viewport * 0.68 - top) / height));
    }
    function createArrivalGate() {
        let armed = true;
        return (nodeY, viewport, enabled, hidden = false) => {
            if (!enabled) { armed = false; return 'reset'; }
            if (hidden) return 'idle';
            const threshold = viewport * 0.68;
            // Rearm only after a deliberate retreat, not tiny scroll reversals at the node.
            if (nodeY > threshold + Math.max(96, viewport * 0.14)) {
                armed = true;
                return 'reset';
            }
            if (nodeY < -48) { armed = false; return 'idle'; }
            if (armed && nodeY <= threshold) { armed = false; return 'fire'; }
            return 'idle';
        };
    }
    function milestoneParticles() {
        return Array.from({ length: 18 }, (_, index) => {
            const angle = index * 2.399963;
            const radius = 82 + index % 5 * 13;
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                midX: Math.cos(angle + 0.65) * radius * 0.48,
                midY: Math.sin(angle + 0.65) * radius * 0.48,
                turn: angle * 180 / Math.PI,
                delay: 0.12 + index % 6 * 0.045,
            };
        });
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { chargeAt, createArrivalGate, milestoneParticles };
        return;
    }
    const timeline = document.querySelector('.timeline');
    if (!timeline || !window.SiteMotion) return;
    const items = [...timeline.querySelectorAll('.timeline-item')];
    if (!items.length) return;
    const currentIndex = items.findIndex(item => item.classList.contains('timeline-current'));
    const current = items[currentIndex];
    const arrivalGate = createArrivalGate();
    const particles = current?.querySelector('.milestone-particles');
    if (particles && !particles.children.length) {
        milestoneParticles().forEach(particle => {
            const spark = document.createElement('i');
            spark.className = 'milestone-spark';
            for (const [key, value] of Object.entries(particle)) {
                const property = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                const unit = key === 'delay' ? 's' : key === 'turn' ? 'deg' : 'px';
                spark.style.setProperty(`--spark-${property}`, `${value.toFixed(3)}${unit}`);
            }
            particles.appendChild(spark);
        });
    }
    let frame = 0, inView = false;
    function paint() {
        frame = 0;
        const rect = timeline.getBoundingClientRect();
        // Layout offsets exclude reveal transforms; the axis ends at the present-day node.
        const centers = items.map(item => {
            const dot = item.querySelector('.timeline-center');
            return item.offsetTop + dot.offsetTop + dot.offsetHeight / 2;
        });
        const start = centers[0];
        const span = Math.max(0, centers[centers.length - 1] - start);
        const charge = SiteMotion.enabled ? chargeAt(rect.top + start, span, innerHeight) : 1;
        timeline.style.setProperty('--timeline-charge', `${(charge * 100).toFixed(3)}%`);
        timeline.style.setProperty('--timeline-start', `${start}px`);
        timeline.style.setProperty('--timeline-span', `${span}px`);
        timeline.style.setProperty('--timeline-fill', `${span * charge}px`);
        items.forEach((item, index) => item.classList.toggle('is-charged',
            !SiteMotion.enabled || rect.top + centers[index] <= innerHeight * 0.68));
        if (current) {
            const action = arrivalGate(rect.top + centers[currentIndex], innerHeight, SiteMotion.enabled, document.hidden);
            if (action !== 'idle') current.classList.toggle('has-arrived', action === 'fire');
        }
    }
    function schedule() {
        if (!frame && inView && !document.hidden && SiteMotion.enabled) frame = requestAnimationFrame(paint);
    }
    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView) paint();
    }, { rootMargin: '100px' }).observe(timeline);
    new ResizeObserver(() => { if (inView || !SiteMotion.enabled) paint(); }).observe(timeline);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    SiteMotion.subscribe(() => { cancelAnimationFrame(frame); frame = 0; paint(); });
})();
