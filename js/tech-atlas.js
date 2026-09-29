/* ========================================
   TECH ATLAS - Native labels, SVG signal paths
======================================== */
(() => {
    const clusters = {
        frontend: [['Vue', 165, 80], ['JavaScript', 78, 160], ['HTML/CSS', 148, 243], ['WXML', 275, 170]],
        backend: [['Python', 170, 360], ['Java', 78, 427], ['PHP', 205, 476], ['MySQL', 296, 399]],
        ai: [['PyTorch', 465, 60], ['YOLO', 595, 60], ['SAM', 725, 60],
            ['DETR', 725, 158], ['ONNX', 725, 256], ['C++', 595, 256],
            ['NLP', 465, 256], ['LLM', 465, 158], ['Stable Diffusion', 595, 158]],
        data: [['Docker', 580, 386], ['Flink', 716, 456]],
    };
    function layoutFor(group, compact) {
        const tools = clusters[group] || [];
        const diamond = tools.length === 2 ? [[90, 150], [270, 150]]
            : [[180, 58], [68, 155], [290, 155], [180, 246]];
        return tools.map(([name, x, y], i) => {
            // Larger clusters use a spaced grid rather than squeezing into the four-node diamond.
            const point = tools.length > 4 ? [72 + (i % 3) * 108, 50 + Math.floor(i / 3) * 100] : diamond[i];
            return { name, x: compact ? point[0] : x, y: compact ? point[1] : y };
        });
    }
    function curvePoint(start, end, t) {
        const u = 1 - t;
        const bend = { x: start.x + (end.x - start.x) * 0.8, y: start.y };
        return { x: u * u * start.x + 2 * u * t * bend.x + t * t * end.x,
            y: u * u * start.y + 2 * u * t * bend.y + t * t * end.y };
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { clusters, layoutFor, curvePoint };
        return;
    }
    const atlas = document.getElementById('techAtlas');
    if (!atlas || !window.SiteMotion) return;
    const map = atlas.querySelector('.atlas-map');
    const svg = atlas.querySelector('.atlas-lines');
    const links = atlas.querySelector('.atlas-links');
    const packets = atlas.querySelector('.atlas-packets');
    const nodes = atlas.querySelector('.atlas-nodes');
    const buttons = [...atlas.querySelectorAll('.atlas-selector button')];
    const panels = [...atlas.querySelectorAll('.atlas-panel')];
    const compact = matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let selected = 'ai', routes = [], lastPaint = -1;
    function shape(type, attributes, parent) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', type);
        for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
        parent.appendChild(el);
        return el;
    }
    // Deterministic stars avoid layout flicker on selection or language navigation.
    for (let i = 0; i < 44; i++) shape('circle', {
        cx: (i * 137.5 + 37) % 780 + 10, cy: (i * 83.7 + 21) % 500 + 10,
        r: i % 7 ? 0.7 : 1.4, opacity: i % 3 ? 0.35 : 0.7,
    }, atlas.querySelector('.atlas-stars'));
    function redraw() {
        const mobile = compact.matches;
        const width = mobile ? 360 : 800, height = mobile ? 340 : 540;
        const center = mobile ? { x: 180, y: 307 } : { x: 410, y: 314 };
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        links.replaceChildren(); packets.replaceChildren(); nodes.replaceChildren(); routes = [];
        map.style.setProperty('--nucleus-x', `${center.x / width * 100}%`);
        map.style.setProperty('--nucleus-y', `${center.y / height * 100}%`);
        for (const group of Object.keys(clusters)) {
            if (mobile && group !== selected) continue;
            const points = layoutFor(group, mobile);
            const active = group === selected;
            const layer = shape('g', { class: active ? 'atlas-cluster is-active' : 'atlas-cluster' }, links);
            const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ') + ' Z';
            shape('path', { d: path, class: 'atlas-network' }, layer);
            if (points.length > 2) shape('path', { d: `M${points[0].x} ${points[0].y} L${points[2].x} ${points[2].y}`, class: 'atlas-network' }, layer);
            points.forEach((point, index) => {
                const node = document.createElement('span');
                node.className = `atlas-node${active ? ' is-active' : ''}`;
                node.textContent = point.name;
                node.style.left = `${point.x / width * 100}%`;
                node.style.top = `${point.y / height * 100}%`;
                nodes.appendChild(node);
                if (!active && index) return;
                const bendX = center.x + (point.x - center.x) * 0.8;
                shape('path', { d: `M${center.x} ${center.y} Q${bendX} ${center.y} ${point.x} ${point.y}`, class: 'atlas-signal' }, layer);
                if (active) routes.push({ start: center, end: point, dot: shape('circle', { r: 2.2, cx: center.x, cy: center.y }, packets) });
            });
        }
        lastPaint = -1;
        render(0, 0);
    }
    function select(group) {
        if (!clusters[group]) return;
        selected = group;
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cluster === group)));
        panels.forEach(panel => { panel.hidden = panel.dataset.cluster !== group; });
        redraw();
    }
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => select(button.dataset.cluster));
        button.addEventListener('keydown', event => {
            const keys = { ArrowRight: (index + 1) % buttons.length, ArrowLeft: (index + buttons.length - 1) % buttons.length,
                Home: 0, End: buttons.length - 1 };
            if (!(event.key in keys)) return;
            event.preventDefault();
            const next = buttons[keys[event.key]];
            next.focus(); select(next.dataset.cluster);
        });
    });
    function render(time, delta) {
        if (compact.matches || !SiteMotion.enabled) return;
        if (delta && time - lastPaint < 1 / 30) return;
        lastPaint = time;
        routes.forEach((route, index) => {
            const phase = (time * 0.22 + index * 0.23) % 1;
            const point = curvePoint(route.start, route.end, phase);
            route.dot.setAttribute('cx', point.x.toFixed(2));
            route.dot.setAttribute('cy', point.y.toFixed(2));
            route.dot.style.opacity = (Math.sin(phase * Math.PI) * 0.9).toFixed(3);
        });
    }
    function resetTilt() {
        map.style.removeProperty('--atlas-x'); map.style.removeProperty('--atlas-y');
    }
    map.addEventListener('pointermove', event => {
        if (!SiteMotion.enabled || compact.matches || !fine.matches || event.pointerType === 'touch') return;
        const rect = map.getBoundingClientRect();
        map.style.setProperty('--atlas-x', `${((event.clientY - rect.top) / rect.height - 0.5) * -5}deg`);
        map.style.setProperty('--atlas-y', `${((event.clientX - rect.left) / rect.width - 0.5) * 7}deg`);
    });
    map.addEventListener('pointerleave', resetTilt);
    compact.addEventListener('change', () => { resetTilt(); redraw(); });
    fine.addEventListener('change', resetTilt);
    atlas.classList.add('atlas-ready');
    select(selected);
    SiteMotion.subscribe(() => { resetTilt(); render(0, 0); });
    // Hidden on mobile: the shared visibility clock never runs this desktop-only task there.
    SiteMotion.animate(packets, render);
})();
