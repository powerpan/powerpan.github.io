/* ========================================
   CUSTOM CURSOR + TRAIL
======================================== */
const cursorEl = document.getElementById('cursor');
const dotEl = document.getElementById('cursorDot');
let mx = -100, my = -100, cx = -100, cy = -100;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dotEl.style.left = mx + 'px';
    dotEl.style.top = my + 'px';
});

/* Cursor lerp */
(function loop() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursorEl.style.left = cx + 'px';
    cursorEl.style.top = cy + 'px';
    requestAnimationFrame(loop);
})();

/* Hover state */
document.querySelectorAll('[data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
});

/* Trail dots */
const TRAIL_N = 6;
const trailDots = [];
for (let i = 0; i < TRAIL_N; i++) {
    const d = document.createElement('div');
    d.className = 'cursor-trail';
    const size = Math.max(2, 5 - i * 0.6);
    d.style.width = size + 'px';
    d.style.height = size + 'px';
    d.style.opacity = (1 - i / TRAIL_N) * 0.35;
    document.body.appendChild(d);
    trailDots.push({ el: d, x: -100, y: -100 });
}

(function trailLoop() {
    trailDots.forEach((d, i) => {
        const target = i === 0 ? { x: mx, y: my } : trailDots[i - 1];
        d.x += (target.x - d.x) * (0.35 - i * 0.03);
        d.y += (target.y - d.y) * (0.35 - i * 0.03);
        d.el.style.left = d.x + 'px';
        d.el.style.top = d.y + 'px';
    });
    requestAnimationFrame(trailLoop);
})();
