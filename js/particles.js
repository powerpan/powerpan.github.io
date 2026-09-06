/* ========================================
   HERO FIELD — Parametric fibers in perspective
======================================== */
(() => {
    const canvas = document.getElementById('particleCanvas');
    const hero = document.getElementById('hero');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!ctx || !hero) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const pointer = { x: 0, y: 0 };
    const view = { x: 0, y: 0 };
    const tau = Math.PI * 2;
    let width = 0;
    let height = 0;
    let phase = 0;
    let lastPaint = -1;
    let pixelRatio = 1;

    function resize() {
        width = hero.clientWidth;
        height = hero.clientHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        draw(phase, 0);
    }

    hero.addEventListener('pointermove', event => {
        if (!finePointer.matches || !SiteMotion.enabled || event.pointerType === 'touch') return;
        const rect = hero.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
        pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
    SiteMotion.subscribe(active => {
        if (!active) {
            pointer.x = view.x = 0;
            pointer.y = view.y = 0;
        }
    });

    function draw(time, delta) {
        // Cap this decorative layer at 30fps, including on high-refresh displays.
        if (delta && time - lastPaint < 1 / 30) return;
        lastPaint = phase = time;
        const ease = delta ? 0.075 : 1;
        view.x += (pointer.x - view.x) * ease;
        view.y += (pointer.y - view.y) * ease;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const small = width < 600;
        const radius = Math.min(width * (small ? 0.62 : 0.43), height * 0.53, 570);
        const tilt = 0.9 + view.y * 0.32;
        const turn = -0.32 + view.x * 0.22;
        const cosTilt = Math.cos(tilt), sinTilt = Math.sin(tilt);
        const cosTurn = Math.cos(turn), sinTurn = Math.sin(turn);
        const strands = small ? 32 : 56;
        const steps = small ? 144 : 208;
        ctx.translate(width / 2, height * 0.46);

        function project(u, v) {
            const wave = Math.sin(u * 3 + time * 0.18);
            const tube = 0.17 + 0.055 * Math.cos(u * 2 - time * 0.16);
            const ring = 0.96 + tube * Math.cos(v + u * 2 + time * 0.11);
            const x = ring * Math.cos(u);
            const y = ring * Math.sin(u);
            const z = tube * Math.sin(v + u * 2 + time * 0.11) + wave * 0.13;
            const yTilt = y * cosTilt - z * sinTilt;
            const depth = y * sinTilt + z * cosTilt;
            const perspective = 3.8 / (3.8 - depth);
            return {
                x: (x * cosTurn - yTilt * sinTurn) * radius * perspective,
                y: (x * sinTurn + yTilt * cosTurn) * radius * perspective,
                depth
            };
        }

        const ink = ctx.createLinearGradient(-radius, -radius * 0.6, radius, radius * 0.6);
        ink.addColorStop(0, 'rgba(0, 255, 136, 0.12)');
        ink.addColorStop(0.3, 'rgba(0, 255, 136, 0.8)');
        ink.addColorStop(0.53, 'rgba(188, 255, 230, 0.95)');
        ink.addColorStop(0.76, 'rgba(40, 214, 180, 0.5)');
        ink.addColorStop(1, 'rgba(0, 255, 136, 0.08)');
        ctx.strokeStyle = ink;
        ctx.lineWidth = small ? 0.65 : 0.75;
        for (let strand = 0; strand < strands; strand++) {
            const v = strand / strands * tau;
            ctx.globalAlpha = 0.23 + Math.pow((Math.sin(v) + 1) / 2, 3) * 0.55;
            ctx.beginPath();
            for (let step = 0; step <= steps; step++) {
                const p = project(step / steps * tau, v);
                if (step === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        // Traveling highlights follow the same surface as the fibers.
        for (let i = 0; i < 26; i++) {
            const p = project(i * 2.39996 + time * (i % 2 ? 0.06 : -0.045), i * 0.71);
            ctx.globalAlpha = 0.2 + (p.depth + 1.4) * 0.2;
            ctx.fillStyle = i % 3 ? '#a8ffe0' : '#00ff88';
            ctx.beginPath();
            ctx.arc(p.x, p.y, i % 4 ? 1 : 1.7, 0, tau);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    new ResizeObserver(resize).observe(hero);
    resize();
    SiteMotion.animate(hero, draw);
})();
