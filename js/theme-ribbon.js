/* The theme reveal follows the hero's closed, three-lobed ribbon. */
(function (root) {
    const clamp = value => Math.max(0, Math.min(1, value));
    const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

    function contour(radius, phase, cx, cy, count = 144) {
        return Array.from({ length: count }, (_, i) => {
            const angle = i / count * Math.PI * 2;
            const wave = 1 + 0.17 * Math.sin(angle * 3 - phase) + 0.055 * Math.sin(angle * 5 + phase * 0.7);
            const turn = -0.24 + Math.sin(phase * 0.4) * 0.1;
            const x = Math.cos(angle) * radius * wave;
            const y = Math.sin(angle) * radius * wave * 0.86;
            return [cx + x * Math.cos(turn) - y * Math.sin(turn), cy + x * Math.sin(turn) + y * Math.cos(turn)];
        });
    }
    function frame(progress, width, height, phase = 0, center) {
        const p = clamp(progress);
        const cx = center?.[0] ?? width * 0.5, cy = center?.[1] ?? height * 0.51;
        const base = Math.min(width, height) * 0.34;
        const reach = Math.max(Math.hypot(cx, cy), Math.hypot(width - cx, cy),
            Math.hypot(cx, height - cy), Math.hypot(width - cx, height - cy)) * 1.85;
        const outer = base + (reach - base) * ease(p / 0.96);
        const inner = base * (1 - ease(p / 0.8));
        const flow = phase * 0.72 + p * 2.1;
        return { outer: contour(outer, flow, cx, cy), inner: contour(inner, flow, cx, cy),
            outerRadius: outer, innerRadius: inner, cx, cy, phase: flow };
    }
    function path(points) {
        return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + ' Z';
    }
    function clip(frame) { return `path(evenodd, "${path(frame.outer)} ${path(frame.inner)}")`; }
    function keyframes(width, height, phase, center) {
        return Array.from({ length: 41 }, (_, i) => ({
            offset: i / 40, clipPath: clip(frame(i / 40, width, height, phase, center)),
        }));
    }
    const api = { clamp, ease, contour, frame, clip, keyframes };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.ThemeRibbon = api;
})(typeof window !== 'undefined' ? window : globalThis);
