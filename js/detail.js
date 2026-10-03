/* ========================================
   DETAIL PAGE INTERACTIONS
======================================== */

(function() {
    'use strict';

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const canAnimate = () => SiteMotion.enabled && !document.hidden;

    /* ========================================
       SCROLL PROGRESS
    ======================================== */
    const scrollProgress = document.getElementById('detailScrollProgress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = progress + '%';
        }
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
       CODE BLOCK LINE NUMBERS
    ======================================== */
    document.querySelectorAll('.detail-code-body').forEach(block => {
        const lines = block.querySelectorAll('.line');
        lines.forEach((line, i) => {
            const num = document.createElement('span');
            num.className = 'line-num';
            num.textContent = (i + 1).toString().padStart(2, '0');
            line.prepend(num);
        });
    });

    /* ========================================
       COUNTER ANIMATION
    ======================================== */
    const counters = document.querySelectorAll('[data-count]');
    const counterFrames = new Map();
    function finishCounter(el) {
        cancelAnimationFrame(counterFrames.get(el));
        counterFrames.delete(el);
        el.textContent = parseInt(el.dataset.count).toLocaleString() + '+';
    }
    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            counterObs.unobserve(el);
            if (!canAnimate()) return finishCounter(el);
            const target = parseInt(el.dataset.count);
            const duration = target > 100 ? 2200 : 1600;
            const startTime = performance.now();
            function tick(now) {
                if (!canAnimate()) return finishCounter(el);
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const val = Math.floor(eased * target);
                el.textContent = val.toLocaleString() + '+';
                if (progress < 1) counterFrames.set(el, requestAnimationFrame(tick));
                else counterFrames.delete(el);
            }
            counterFrames.set(el, requestAnimationFrame(tick));
        });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));

    /* ========================================
       TABLE OF CONTENTS ACTIVE STATE
    ======================================== */
    const tocItems = document.querySelectorAll('.detail-toc-item');
    const sections = document.querySelectorAll('.detail-section[id]');

    function updateDetailTocLabels() {
        const isZh = document.documentElement.lang.startsWith('zh');
        tocItems.forEach(item => {
            if (!item.dataset.labelZh) item.dataset.labelZh = item.dataset.label || '';
            if (isZh && item.dataset.labelZh) {
                item.dataset.label = item.dataset.labelZh;
                return;
            }

            const target = document.getElementById(item.dataset.target);
            const heading = target && target.querySelector('h2');
            if (!heading) return;

            const label = heading.textContent.trim().replace(/\s+/g, ' ');
            if (label) item.dataset.label = label;
        });
    }

    window.updateDetailTocLabels = updateDetailTocLabels;
    updateDetailTocLabels();
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) {
                current = section.id;
            }
        });
        
        tocItems.forEach(item => {
            item.classList.toggle('active', item.dataset.target === current);
        });
    });

    /* TOC click */
    tocItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = document.getElementById(item.dataset.target);
            if (target) {
                target.scrollIntoView({ behavior: SiteMotion.enabled ? 'smooth' : 'instant' });
            }
        });
    });

    /* ========================================
       MAGNETIC BUTTONS
    ======================================== */
    const magneticButtons = document.querySelectorAll('.magnetic');
    const resetMagnets = () => magneticButtons.forEach(btn => btn.style.transform = '');
    finePointer.addEventListener('change', resetMagnets);
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            if (!canAnimate() || !finePointer.matches) return;
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
                if (curr > lastScrollY && curr > 80) {
                    navEl.classList.add('hidden');
                } else {
                    navEl.classList.remove('hidden');
                }
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
       PARALLAX EFFECT
    ======================================== */
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    window.addEventListener('scroll', () => {
        if (!canAnimate()) return;
        const scrollTop = window.pageYOffset;
        parallaxEls.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrollTop * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });

    /* ========================================
       TYPEWRITER EFFECT
    ======================================== */
    const typewriters = document.querySelectorAll('[data-typewriter]');
    const typewriterTimers = new Map();
    function finishTypewriter(el) {
        clearTimeout(typewriterTimers.get(el));
        typewriterTimers.delete(el);
        el.textContent = el.dataset.typewriter;
    }
    typewriters.forEach(el => {
        if (!canAnimate()) return finishTypewriter(el);
        const text = el.dataset.typewriter;
        let i = 0;
        el.textContent = '';
        
        function type() {
            if (!canAnimate()) return finishTypewriter(el);
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                typewriterTimers.set(el, setTimeout(type, 50 + Math.random() * 30));
            }
            else typewriterTimers.delete(el);
        }
        
        typewriterTimers.set(el, setTimeout(type, 1000));
    });

    function stopDecorations() {
        resetMagnets();
        parallaxEls.forEach(el => el.style.transform = '');
        counterFrames.forEach((_, el) => finishCounter(el));
        typewriterTimers.forEach((_, el) => finishTypewriter(el));
    }
    SiteMotion.subscribe(enabled => {
        if (enabled) return;
        stopDecorations();
        counters.forEach(el => {
            counterObs.unobserve(el);
            finishCounter(el);
        });
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopDecorations();
    });
    window.addEventListener('pagehide', stopDecorations);

    /* ========================================
       FLOAT KEYFRAMES (injected)
    ======================================== */
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-18px) rotate(4deg); }
            50% { transform: translateY(-8px) rotate(-2deg); }
            75% { transform: translateY(-22px) rotate(3deg); }
        }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);

    /* ========================================
       MOBILE NAV (Hamburger + Close)
    ======================================== */
    const hamburger = document.getElementById('navHamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const closeMobileNav = () => {
        hamburger && hamburger.classList.remove('active');
        mobileNav && mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    };
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });
    }
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }

    /* ========================================
       BACK TO TOP
    ======================================== */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.pageYOffset > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: SiteMotion.enabled ? 'smooth' : 'instant' });
        });
    }

})();
