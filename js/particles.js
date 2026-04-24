/* ========================================
   PARTICLE CANVAS — Neural Network Viz
======================================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let cMouse = { x: -9999, y: -9999 };
let cW, cH;

function resizeCanvas() {
    cW = canvas.width = window.innerWidth;
    cH = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', e => {
    cMouse.x = e.clientX;
    cMouse.y = e.clientY;
});

function initParticles() {
    particles = [];
    const count = Math.min(90, Math.floor(cW * cH / 12000));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * cW,
            y: Math.random() * cH,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.5 + 0.5,
            pulse: Math.random() * Math.PI * 2
        });
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, cW, cH);

    particles.forEach(p => {
        /* Mouse repulsion */
        const dx = cMouse.x - p.x;
        const dy = cMouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
            const force = (180 - dist) / 180 * 0.008;
            p.vx -= dx * force;
            p.vy -= dy * force;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.pulse += 0.02;

        if (p.x < -20) p.x = cW + 20;
        if (p.x > cW + 20) p.x = -20;
        if (p.y < -20) p.y = cH + 20;
        if (p.y > cH + 20) p.y = -20;

        /* Draw particle with subtle pulse */
        const alpha = 0.3 + Math.sin(p.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx.fill();
    });

    /* Draw connections */
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
                const opacity = (1 - dist / 130) * 0.12;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }

    /* Draw mouse connections */
    particles.forEach(p => {
        const dx = cMouse.x - p.x;
        const dy = cMouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            const opacity = (1 - dist / 200) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(cMouse.x, cMouse.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    });

    requestAnimationFrame(animateParticles);
}
animateParticles();
