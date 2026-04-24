/* ========================================
   INTERACTIONS — Typing, Marquee, Terminal, Orbit, Cards, Reveal, Counters, Magnetic, Nav, Float/Morph
======================================== */

        /* ========================================
           TYPING EFFECT (Hero) — i18n aware
        ======================================== */
        const typingEl = document.getElementById('typingText');
        let roleIdx = 0, charIdx = 0, deleting = false;

        function getRoles() {
            return (typeof I18N !== 'undefined' && I18N[currentLang])
                ? I18N[currentLang].typing_roles
                : ['Full-Stack Developer', 'AI Vision Engineer', 'System Architect'];
        }

        function typeLoop() {
            const roles = getRoles();
            const current = roles[roleIdx % roles.length];
            if (!deleting) {
                typingEl.textContent = current.substring(0, charIdx + 1);
                charIdx++;
                if (charIdx === current.length) {
                    setTimeout(() => { deleting = true; typeLoop(); }, 2000);
                    return;
                }
                setTimeout(typeLoop, 60 + Math.random() * 40);
            } else {
                typingEl.textContent = current.substring(0, charIdx - 1);
                charIdx--;
                if (charIdx === 0) {
                    deleting = false;
                    roleIdx = (roleIdx + 1) % roles.length;
                    setTimeout(typeLoop, 400);
                    return;
                }
                setTimeout(typeLoop, 30);
            }
        }

        // Allow i18n.js to restart typing on language change
        window.restartTyping = function () {
            roleIdx = 0;
            charIdx = 0;
            deleting = false;
        };
        setTimeout(typeLoop, 1800);

        /* ========================================
           MARQUEE
        ======================================== */
        const marqueeTrack = document.getElementById('marqueeTrack');
        const marqueeItems = [
            'React', 'Next.js', 'TypeScript', 'Node.js', 'Python',
            'PyTorch', 'OpenCV', 'PostgreSQL', 'Docker', 'Kubernetes',
            'GraphQL', 'Rust', 'WebGL', 'Three.js', 'TensorRT',
        ];
        const sep = '<span class="marquee-sep">◆</span>';
        let marqueeHTML = '';
        for (let r = 0; r < 2; r++) {
            marqueeItems.forEach(item => {
                marqueeHTML += `<span class="marquee-item" data-hover>${item}</span>${sep}`;
            });
        }
        marqueeTrack.innerHTML = marqueeHTML;

        /* Text scramble on hover */
        const scrambleChars = 'アイウエオカキクケコ0123456789ABCDEF<>/{}';
        marqueeTrack.querySelectorAll('.marquee-item').forEach(item => {
            const original = item.textContent;
            item.addEventListener('mouseenter', () => {
                let iterations = 0;
                const iv = setInterval(() => {
                    item.textContent = original.split('').map((ch, i) =>
                        i < iterations ? original[i] : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
                    ).join('');
                    iterations += 0.5;
                    if (iterations >= original.length) {
                        item.textContent = original;
                        clearInterval(iv);
                    }
                }, 30);
            });
        });

        /* ========================================
           TERMINAL AUTO-TYPE
        ======================================== */
        const termCmd = document.getElementById('termCmd');
        const termCursor = document.getElementById('termCursor');
        const termOutput = document.getElementById('termOutput');
        let termTyped = false;

        const termObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !termTyped) {
                    termTyped = true;
                    runTerminal();
                }
            });
        }, { threshold: 0.4 });
        termObs.observe(document.getElementById('terminalBody'));

        async function runTerminal() {
            const cmd = 'cat ~/.ericrc';
            for (const ch of cmd) {
                termCmd.textContent += ch;
                await sleep(70 + Math.random() * 50);
            }
            await sleep(500);
            termCursor.style.display = 'none';

            const json = [
                `{`,
                `  <span class="term-key">"name"</span>: <span class="term-str">"Eric"</span>,`,
                `  <span class="term-key">"role"</span>: <span class="term-str">"Full-Stack & AI Vision Dev"</span>,`,
                `  <span class="term-key">"location"</span>: <span class="term-str">"Shanghai, CN"</span>,`,
                `  <span class="term-key">"languages"</span>: <span class="term-bracket">[</span><span class="term-str">"TypeScript"</span>, <span class="term-str">"Python"</span>, <span class="term-str">"Rust"</span>, <span class="term-str">"Go"</span><span class="term-bracket">]</span>,`,
                `  <span class="term-key">"frameworks"</span>: <span class="term-bracket">[</span><span class="term-str">"React"</span>, <span class="term-str">"Next.js"</span>, <span class="term-str">"FastAPI"</span>, <span class="term-str">"PyTorch"</span><span class="term-bracket">]</span>,`,
                `  <span class="term-key">"passions"</span>: <span class="term-bracket">[</span>`,
                `    <span class="term-str">"computer vision"</span>,`,
                `    <span class="term-str">"distributed systems"</span>,`,
                `    <span class="term-str">"open source"</span>`,
                `  <span class="term-bracket">]</span>,`,
                `  <span class="term-key">"coffee_per_day"</span>: <span class="term-str">"∞"</span>`,
                `}`,
            ];

            termOutput.style.display = 'block';
            for (let i = 0; i < json.length; i++) {
                const line = document.createElement('div');
                line.className = 'term-line term-output';
                line.innerHTML = json[i];
                line.style.opacity = '0';
                termOutput.appendChild(line);
                await sleep(60);
                line.style.transition = 'opacity 0.3s ease';
                line.style.opacity = '1';
            }

            /* New prompt line */
            await sleep(400);
            const newLine = document.createElement('div');
            newLine.className = 'term-line';
            newLine.style.marginTop = '8px';
            newLine.innerHTML = '<span class="term-prompt">❯ </span><span class="term-cursor-char"></span>';
            termOutput.appendChild(newLine);
        }

        /* ========================================
           TECH ORBIT
        ======================================== */
        const orbitContainer = document.getElementById('orbitContainer');
        const orbitRings = [
            { radius: 100, speed: 0.008, items: ['React', 'Next.js', 'Vue', 'TypeScript'] },
            { radius: 170, speed: -0.005, items: ['Node.js', 'Python', 'Go', 'Rust', 'PostgreSQL'] },
            { radius: 240, speed: 0.003, items: ['PyTorch', 'OpenCV', 'TensorRT', 'CUDA'] },
        ];

        const orbitElements = [];
        orbitRings.forEach((ring, ri) => {
            /* Ring border */
            const ringEl = document.createElement('div');
            ringEl.className = 'orbit-ring';
            ringEl.style.width = ring.radius * 2 + 'px';
            ringEl.style.height = ring.radius * 2 + 'px';
            orbitContainer.appendChild(ringEl);

            ring.items.forEach((item, ii) => {
                const el = document.createElement('div');
                el.className = 'orbit-item';
                el.textContent = item;
                el.dataset.hover = '';
                orbitContainer.appendChild(el);
                orbitElements.push({
                    el, ri, ii,
                    total: ring.items.length,
                    radius: ring.radius,
                    speed: ring.speed,
                    baseAngle: (ii / ring.items.length) * Math.PI * 2,
                });
            });
        });

        let orbitAngle = 0;
        function animateOrbit() {
            orbitAngle += 1;
            orbitElements.forEach(o => {
                const angle = o.baseAngle + orbitAngle * o.speed;
                const x = Math.cos(angle) * o.radius;
                const y = Math.sin(angle) * o.radius;
                o.el.style.left = `calc(50% + ${x}px)`;
                o.el.style.top = `calc(50% + ${y}px)`;
            });
            requestAnimationFrame(animateOrbit);
        }
        animateOrbit();

        /* ========================================
           3D CARD TILT
        ======================================== */
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.01)`;
                card.style.transition = 'transform 0.1s ease';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1)';
                card.style.transition = 'transform 0.5s ease';
            });
        });

        /* ========================================
           SCROLL REVEAL
        ======================================== */
        const revealEls = document.querySelectorAll('.reveal');
        const revealObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        revealEls.forEach(el => revealObs.observe(el));

        /* ========================================
           COUNTER ANIMATION
        ======================================== */
        const counters = document.querySelectorAll('[data-count]');
        const counterObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = target > 100 ? 2200 : 1600;
                const startTime = performance.now();
                function tick(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const val = Math.floor(eased * target);
                    el.textContent = val.toLocaleString() + '+';
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                counterObs.unobserve(el);
            });
        }, { threshold: 0.5 });
        counters.forEach(el => counterObs.observe(el));

        /* ========================================
           MAGNETIC BUTTONS
        ======================================== */
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });

        /* ========================================
           NAV SCROLL BEHAVIOR
        ======================================== */
        const navEl = document.getElementById('nav');
        let lastScrollY = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const curr = window.pageYOffset;
                    /* Show/hide */
                    if (curr > lastScrollY && curr > 80) {
                        navEl.classList.add('hidden');
                    } else {
                        navEl.classList.remove('hidden');
                    }
                    /* Glass effect */
                    if (curr > 50) {
                        navEl.classList.add('scrolled');
                    } else {
                        navEl.classList.remove('scrolled');
                    }
                    lastScrollY = curr;
                    ticking = false;
                });
                ticking = true;
            }
        });

        /* ========================================
           FLOAT / MORPH KEYFRAMES (injected)
        ======================================== */
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-18px) rotate(4deg); }
                50% { transform: translateY(-8px) rotate(-2deg); }
                75% { transform: translateY(-22px) rotate(3deg); }
            }
            @keyframes morphFloat {
                0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: translateY(0) rotate(0deg); }
                33% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; transform: translateY(-14px) rotate(8deg); }
                66% { border-radius: 50% 50% 30% 70% / 40% 60% 40% 60%; transform: translateY(-6px) rotate(-4deg); }
            }
        `;
        document.head.appendChild(styleSheet);
