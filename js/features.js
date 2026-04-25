/* ========================================
   FEATURES — Scroll Progress, Skills Bars, Code Animation, GitHub Heatmap, Timeline, Command Palette, Back to Top, Contact Form
======================================== */
        /* ========================================
           SCROLL PROGRESS BAR
        ======================================== */
        const scrollProgress = document.getElementById('scrollProgress');
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        });

        /* ========================================
           SKILLS BAR ANIMATION + COUNTER
        ======================================== */
        const skillBars = document.querySelectorAll('.skill-bar-fill');
        const skillObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = parseInt(bar.dataset.width);
                    const pctEl = bar.closest('.skill-bar-item').querySelector('.skill-bar-pct');

                    setTimeout(() => {
                        bar.style.width = width + '%';
                    }, 200);

                    // Animate counter from 0 to target
                    if (pctEl) {
                        const duration = 1200;
                        const start = performance.now();
                        const animate = now => {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            pctEl.textContent = Math.round(eased * width) + '%';
                            if (progress < 1) requestAnimationFrame(animate);
                        };
                        setTimeout(() => requestAnimationFrame(animate), 200);
                    }

                    skillObs.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });
        skillBars.forEach(bar => skillObs.observe(bar));

        /* ========================================
           CODE TYPING ANIMATION
        ======================================== */
        const codeWindow = document.getElementById('codeWindow');
        if (codeWindow) {
            const codeObs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        codeObs.unobserve(entry.target);
                        const lines = codeWindow.querySelectorAll('.code-line');
                        const body = codeWindow.querySelector('.code-window-body');

                        // Create blinking cursor
                        const cursor = document.createElement('span');
                        cursor.className = 'code-typing-cursor';
                        cursor.textContent = '▌';

                        // Hide all lines initially
                        lines.forEach(l => { l.style.opacity = '0'; });

                        let lineIdx = 0;
                        function typeLine() {
                            if (lineIdx >= lines.length) {
                                cursor.remove();
                                return;
                            }
                            const line = lines[lineIdx];
                            const html = line.innerHTML;
                            const text = line.textContent;
                            line.style.opacity = '1';
                            line.innerHTML = '';
                            line.appendChild(cursor);

                            let charIdx = 0;
                            function typeChar() {
                                if (charIdx < text.length) {
                                    // Rebuild with syntax highlighting up to current char
                                    const partial = html.substring(0, charIdx + 1);
                                    // Simple: just set textContent for speed, then restore full HTML at end
                                    line.textContent = text.substring(0, charIdx + 1);
                                    line.appendChild(cursor);
                                    charIdx++;
                                    setTimeout(typeChar, 8 + Math.random() * 5);
                                } else {
                                    // Restore full syntax-highlighted HTML
                                    line.innerHTML = html;
                                    lineIdx++;
                                    setTimeout(typeLine, line.textContent.trim() === '' ? 55 : 80);
                                }
                            }
                            typeChar();
                        }
                        typeLine();
                    }
                });
            }, { threshold: 0.3 });
            codeObs.observe(codeWindow);
        }

        /* ========================================
           GITHUB HEATMAP GENERATION
        ======================================== */
        const ghGrid = document.getElementById('ghGrid');
        if (ghGrid) {
            for (let i = 0; i < 364; i++) {
                const cell = document.createElement('div');
                cell.className = 'gh-cell';
                const rand = Math.random();
                if (rand > 0.7) cell.classList.add('l4');
                else if (rand > 0.5) cell.classList.add('l3');
                else if (rand > 0.3) cell.classList.add('l2');
                else if (rand > 0.15) cell.classList.add('l1');
                ghGrid.appendChild(cell);
            }
        }

        /* ========================================
           TIMELINE DOT ANIMATION
        ======================================== */
        const timelineItems = document.querySelectorAll('.timeline-item');
        const timelineObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });
        timelineItems.forEach(item => timelineObs.observe(item));

        /* ========================================
           COMMAND PALETTE (Cmd+K)
        ======================================== */
        const cmdkOverlay = document.getElementById('cmdkOverlay');
        const cmdkInput = document.getElementById('cmdkInput');
        const cmdkResults = document.getElementById('cmdkResults');

        function getCmdkCommands() {
            const t = (typeof I18N !== 'undefined' && I18N[currentLang]) ? I18N[currentLang] : {};
            return [
                { icon: '🏠', title: t.cmdk_goto_about || '关于我', desc: '', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '💼', title: 'Experience', desc: '', action: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '🛠️', title: 'Tech Stack', desc: '', action: () => document.getElementById('tech')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '📊', title: t.skills_title || 'Skills', desc: '', action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '🚀', title: t.cmdk_goto_projects || '项目作品', desc: '', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '📝', title: t.cmdk_goto_blog || '博客文章', desc: '', action: () => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '🐙', title: 'GitHub', desc: '', action: () => document.getElementById('github')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '💬', title: t.cmdk_goto_contact || '联系我', desc: '', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), group: t.cmdk_group_nav || '导航' },
                { icon: '🌐', title: t.cmdk_toggle_lang || '切换语言', desc: '中 / EN', action: () => toggleLang(), group: t.cmdk_group_action || '操作' },
                { icon: '🌙', title: t.cmdk_toggle_theme || '切换主题', desc: '', action: () => {}, group: t.cmdk_group_action || '操作', shortcut: 'T' },
                { icon: '📧', title: t.cmdk_copy_email || '复制邮箱', desc: 'eric@example.com', action: () => navigator.clipboard?.writeText('eric@example.com'), group: t.cmdk_group_action || '操作' },
            ];
        }

        function renderCmdk(filter = '') {
            const commands = getCmdkCommands();
            const filtered = commands.filter(cmd =>
                cmd.title.toLowerCase().includes(filter.toLowerCase()) ||
                cmd.desc.toLowerCase().includes(filter.toLowerCase())
            );
            const groups = {};
            filtered.forEach(cmd => {
                if (!groups[cmd.group]) groups[cmd.group] = [];
                groups[cmd.group].push(cmd);
            });
            let html = '';
            for (const [group, items] of Object.entries(groups)) {
                html += `<div class="cmdk-group-title">${group}</div>`;
                items.forEach((cmd) => {
                    const shortcutHtml = cmd.shortcut ? `<div class="cmdk-item-shortcut"><kbd>${cmd.shortcut}</kbd></div>` : '';
                    html += `
                        <div class="cmdk-item" data-cmd-idx="${commands.indexOf(cmd)}">
                            <div class="cmdk-item-icon">${cmd.icon}</div>
                            <div class="cmdk-item-text">
                                <div class="cmdk-item-title">${cmd.title}</div>
                                ${cmd.desc ? `<div class="cmdk-item-desc">${cmd.desc}</div>` : ''}
                            </div>
                            ${shortcutHtml}
                        </div>
                    `;
                });
            }
            cmdkResults.innerHTML = html;
            cmdkResults.querySelectorAll('.cmdk-item').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.cmdIdx);
                    commands[idx]?.action();
                    closeCmdk();
                });
            });
        }

        // Expose for i18n.js to re-render
        window.renderCommands = renderCmdk;

        function openCmdk() {
            cmdkOverlay.classList.add('active');
            cmdkInput.value = '';
            renderCmdk();
            setTimeout(() => cmdkInput.focus(), 100);
        }
        function closeCmdk() {
            cmdkOverlay.classList.remove('active');
        }

        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (cmdkOverlay.classList.contains('active')) closeCmdk();
                else openCmdk();
            }
            if (e.key === 'Escape' && cmdkOverlay.classList.contains('active')) {
                closeCmdk();
            }
        });
        cmdkOverlay.addEventListener('click', e => {
            if (e.target === cmdkOverlay) closeCmdk();
        });
        cmdkInput.addEventListener('input', () => {
            renderCmdk(cmdkInput.value);
        });

        /* ========================================
           CONTACT FORM
        ======================================== */
        const contactForm = document.getElementById('contactForm');
        const formStatus = document.getElementById('formStatus');
        const WORKER_URL = 'https://contact-form.2779975738.workers.dev';

        if (contactForm) {
            contactForm.addEventListener('submit', async e => {
                e.preventDefault();
                const btn = contactForm.querySelector('.form-submit');
                const btnText = btn.querySelector('span');
                const originalText = btnText.textContent;

                btn.disabled = true;
                btnText.textContent = '⏳ 发送中...';
                formStatus.textContent = '';
                formStatus.className = 'form-status';

                try {
                    const formData = new FormData(contactForm);
                    const data = Object.fromEntries(formData);

                    const res = await fetch(WORKER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    if (res.ok) {
                        btnText.textContent = '✓ 已发送！';
                        btn.style.background = 'var(--accent)';
                        formStatus.textContent = '消息已发送，我会尽快回复你 ✉️';
                        formStatus.className = 'form-status success';
                        contactForm.reset();
                        setTimeout(() => {
                            btnText.textContent = originalText;
                            btn.style.background = '';
                        }, 3000);
                    } else {
                        throw new Error('Server error');
                    }
                } catch (err) {
                    btnText.textContent = '✗ 发送失败';
                    btn.style.background = 'var(--pink)';
                    formStatus.textContent = '发送出错，请稍后再试，或直接发邮件给我';
                    formStatus.className = 'form-status error';
                    setTimeout(() => {
                        btnText.textContent = originalText;
                        btn.style.background = '';
                    }, 3000);
                } finally {
                    btn.disabled = false;
                }
            });
        }

        /* ========================================
           NEXT CHAPTER — Progress Animation
        ======================================== */
        const nextProgressFill = document.getElementById('nextProgressFill');
        const nextProgressPct = document.getElementById('nextProgressPct');
        if (nextProgressFill && nextProgressPct) {
            const nextObs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        nextProgressFill.classList.add('animated');
                        let current = 0;
                        const target = 85;
                        const duration = 2000;
                        const step = target / (duration / 16);
                        const counter = setInterval(() => {
                            current += step;
                            if (current >= target) {
                                current = target;
                                clearInterval(counter);
                            }
                            nextProgressPct.textContent = Math.round(current) + '%';
                        }, 16);
                        nextObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            nextObs.observe(nextProgressFill.closest('.next-chapter-card'));
        }

        /* ========================================
           BACKGROUND MUSIC PLAYER
        ======================================== */
        const bgm = document.getElementById('bgm');
        const nowPlaying = document.getElementById('nowPlaying');
        const npIcon = document.getElementById('npIcon');
        const npBars = document.getElementById('npBars');
        const mobileBgmBtn = document.getElementById('mobileBgmBtn');
        const mobileBgmState = document.getElementById('mobileBgmState');
        const syncBgmUI = (playing) => {
            if (mobileBgmBtn) mobileBgmBtn.classList.toggle('playing', playing);
            if (mobileBgmState) mobileBgmState.textContent = playing ? '⏸' : '▶';
        };
        const toggleBgm = () => {
            if (!bgm) return;
            if (bgm.paused) {
                bgm.play().then(() => {
                    if (npIcon) npIcon.textContent = '⏸';
                    if (npBars) npBars.classList.add('playing');
                    syncBgmUI(true);
                }).catch(() => {});
            } else {
                bgm.pause();
                if (npIcon) npIcon.textContent = '▶';
                if (npBars) npBars.classList.remove('playing');
                syncBgmUI(false);
            }
        };
        if (bgm && nowPlaying) {
            let userInteracted = false;
            const tryPlay = () => {
                if (!userInteracted) {
                    userInteracted = true;
                    bgm.play().then(() => {
                        if (npIcon) npIcon.textContent = '⏸';
                        if (npBars) npBars.classList.add('playing');
                        syncBgmUI(true);
                    }).catch(() => {});
                    document.removeEventListener('click', tryPlay);
                    document.removeEventListener('keydown', tryPlay);
                }
            };
            document.addEventListener('click', tryPlay, { once: false });
            document.addEventListener('keydown', tryPlay, { once: false });

            nowPlaying.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleBgm();
            });
        }
        if (mobileBgmBtn) {
            mobileBgmBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleBgm();
            });
        }
