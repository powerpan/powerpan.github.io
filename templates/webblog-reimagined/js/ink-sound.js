/* Sound controls and ink-line meter extracted from the supplied player design. */
(() => {
    const root = document.documentElement;
    const text = (en, zh) => root.lang.startsWith('zh') ? zh : en;
    const all = s => [...document.querySelectorAll(s)];
    const toggles = all('[data-sound-toggle]');
    if (!toggles.length) return;
    // currentScript also works after the production build fingerprints this file.
    const base = new URL('../assets/audio/', document.currentScript.src);
    const tracks = {
        day: { src: new URL('paper-drift.mp3', base).href, title: 'Paper Drift' },
        night: { src: new URL('diffusing-ink.mp3', base).href, title: 'Diffusing Ink' },
    };
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    };
    const clamp = v => Math.min(1, Math.max(0, v));
    const ranges = all('[data-sound-volume]'), waves = all('.sound-wave');
    const status = document.querySelector('[data-sound-status]');
    const motion = () => root.dataset.motion !== 'off';
    const theme = () => root.dataset.theme === 'night' ? 'night' : 'day';
    let volume = Number.parseFloat(store.get('ink-volume') ?? '.6');
    volume = Number.isFinite(volume) ? clamp(volume) : .6;
    let ctx = null, master = null, analyser = null, bins = null, buffers = null, els = null;
    const gains = {}, tweens = new Map();
    let state = 'off', wanted = false, generation = 0, loading = null, sources = [];
    let offset = 0, startedAt = 0, frame = 0, amp = 0, level = 0, unlock = null;

    function position() {
        if (state !== 'playing') return offset;
        return offset + Math.max(0, (buffers ? ctx.currentTime : performance.now() / 1000) - startedAt);
    }
    function rememberPosition(running) {
        try { sessionStorage.setItem('ink-sound-pos', JSON.stringify({ pos: position(), at: running ? Date.now() : null })); } catch { /* private mode */ }
    }
    function restorePosition() {
        try {
            const h = JSON.parse(sessionStorage.getItem('ink-sound-pos') || 'null');
            if (Number.isFinite(h?.pos) && h.pos >= 0) offset = h.pos + (h.at && store.get('ink-sound') === 'on' ? Math.max(0, (Date.now() - h.at) / 1000) : 0);
        } catch { /* ignore stale state */ }
    }
    function ui() {
        const playing = state === 'playing', title = tracks[theme()].title;
        toggles.forEach(b => {
            b.dataset.state = state;
            b.setAttribute('aria-pressed', String(playing));
            b.setAttribute('aria-busy', String(state === 'loading'));
            b.setAttribute('aria-label', (playing ? text('Pause background music', '暂停背景音乐') : text('Play background music', '播放背景音乐')) + ': ' + title);
            b.title = title;
            if (b.classList.contains('sound-text')) b.textContent = playing ? text('Sound: on', '音乐：开启') : state === 'armed' ? text('Sound: tap to resume', '音乐：点击恢复') : state === 'loading' ? text('Sound: loading', '音乐：加载中') : state === 'error' ? text('Sound: retry', '音乐：点击重试') : text('Sound: off', '音乐：关闭');
        });
        if (status) status.textContent = playing ? text('Background music playing: ', '正在播放背景音乐：') + title : state === 'armed' ? text('Background music will resume on your next tap', '点击或按键后恢复背景音乐') : state === 'loading' ? text('Loading background music', '正在加载背景音乐') : state === 'error' ? text('Music could not load. Use the sound control to retry.', '音乐加载失败，可点击音乐按钮重试。') : text('Background music paused', '背景音乐已暂停');
    }
    function load() {
        if (loading) return loading;
        loading = (async () => {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC && !ctx) {
                ctx = new AC(); master = ctx.createGain(); master.gain.value = 0;
                analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = .82;
                bins = new Uint8Array(analyser.frequencyBinCount);
                master.connect(analyser); analyser.connect(ctx.destination);
                ctx.addEventListener('statechange', () => {
                    if (state === 'playing' && ctx.state !== 'running') { offset = position(); sources.forEach(s => { try { s.stop(); } catch { /* stopped */ } }); arm(); }
                });
            }
            try {
                if (!ctx || location.protocol === 'file:') throw new Error('Use media elements');
                const decoded = await Promise.all(Object.entries(tracks).map(async ([key, track]) => {
                    const response = await fetch(track.src);
                    if (!response.ok) throw new Error('Music HTTP ' + response.status);
                    return [key, await ctx.decodeAudioData(await response.arrayBuffer())];
                }));
                buffers = Object.fromEntries(decoded);
                for (const key of Object.keys(tracks)) { gains[key] = ctx.createGain(); gains[key].connect(master); }
            } catch {
                els = Object.fromEntries(Object.entries(tracks).map(([key, track]) => {
                    const audio = new Audio(track.src); audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
                    return [key, audio];
                }));
            }
        })();
        return loading;
    }
    function tween(el, target, seconds) {
        cancelAnimationFrame(tweens.get(el));
        const from = el.volume, start = performance.now();
        function step(now) {
            const progress = clamp((now - start) / (seconds * 1000));
            el.volume = clamp(from + (target - from) * progress);
            if (progress < 1) tweens.set(el, requestAnimationFrame(step));
        }
        tweens.set(el, requestAnimationFrame(step));
    }
    function setGain(param, target, seconds) {
        const now = ctx.currentTime;
        param.cancelScheduledValues(now); param.setValueAtTime(param.value, now);
        param.setTargetAtTime(target, now, Math.max(.01, seconds / 3));
    }
    function mix(seconds) {
        const night = theme() === 'night';
        if (buffers) {
            setGain(gains.day.gain, night ? 0 : 1, seconds);
            setGain(gains.night.gain, night ? 1 : 0, seconds);
        } else if (els && state === 'playing') {
            tween(els.day, night ? 0 : volume, seconds); tween(els.night, night ? volume : 0, seconds);
        }
    }
    async function start(fade) {
        if (buffers) {
            sources.forEach(s => { try { s.stop(); } catch { /* stopped */ } });
            const at = ctx.currentTime + .05;
            sources = Object.keys(tracks).map(key => {
                const source = ctx.createBufferSource(); source.buffer = buffers[key]; source.loop = true; source.connect(gains[key]);
                // The supplied tracks have different lengths. Each loops on its own duration.
                source.start(at, offset % buffers[key].duration); return source;
            });
            startedAt = at;
            for (const key of Object.keys(tracks)) { gains[key].gain.cancelScheduledValues(ctx.currentTime); gains[key].gain.setValueAtTime(key === theme() ? 1 : 0, ctx.currentTime); }
            master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(0, ctx.currentTime); master.gain.linearRampToValueAtTime(volume, at + fade);
        } else {
            for (const audio of Object.values(els)) {
                cancelAnimationFrame(tweens.get(audio)); audio.volume = 0;
                if (Number.isFinite(audio.duration)) audio.currentTime = offset % audio.duration;
                else audio.addEventListener('loadedmetadata', () => { audio.currentTime = offset % audio.duration; }, { once: true });
            }
            await Promise.all(Object.values(els).map(a => a.play()));
            startedAt = performance.now() / 1000;
        }
    }
    function disarm() {
        if (unlock) { removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true); unlock = null; }
    }
    function arm() {
        state = 'armed'; ui(); meter(); disarm();
        unlock = event => {
            if (event.target.closest?.('[data-sound-toggle]')) return;
            disarm(); if (wanted) enable(true);
        };
        addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);
    }
    function pause(remember = true) {
        rememberPosition(false); offset = position(); wanted = false; generation++; disarm();
        state = 'off'; if (remember) store.set('ink-sound', 'off');
        if (buffers) {
            const now = ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(0, now + .45);
            sources.forEach(s => { try { s.stop(now + .45); } catch { /* stopped */ } });
        } else if (els) {
            const old = Object.values(els); old.forEach(a => tween(a, 0, .45));
            setTimeout(() => { if (!wanted) old.forEach(a => a.pause()); }, 500);
        }
        ui(); meter();
    }
    async function enable(fromGesture) {
        wanted = true; store.set('ink-sound', 'on'); disarm();
        const request = ++generation; state = 'loading'; ui();
        try {
            const ready = load();
            // Resume while the click still carries browser user activation, before fetching.
            const resumed = ctx && ctx.state !== 'running' ? ctx.resume().catch(() => {}) : Promise.resolve();
            await ready;
            if (!wanted || request !== generation) return;
            await Promise.race([resumed, new Promise(resolve => setTimeout(resolve, 200))]);
            if (!wanted || request !== generation) return;
            if (buffers && ctx.state !== 'running') { arm(); return; }
            await start(fromGesture ? .9 : 1.6);
            if (!wanted || request !== generation) { if (!wanted && els) Object.values(els).forEach(a => a.pause()); return; }
            state = 'playing'; if (els) mix(fromGesture ? .9 : 1.6); ui(); meter();
        } catch (error) {
            if (!wanted || request !== generation) return;
            if (els) Object.values(els).forEach(a => a.pause());
            if (error.name === 'NotAllowedError') { arm(); return; }
            loading = null; state = 'error'; wanted = false; ui(); meter();
        }
    }
    // The supplied player's swaying ink line; reduced motion keeps it still.
    function meter() {
        cancelAnimationFrame(frame);
        function draw(now) {
            const active = state === 'playing' && motion(); let low = 0, mids = [];
            if (active && analyser && buffers) { analyser.getByteFrequencyData(bins); for (let i = 1; i < 7; i++) low += bins[i]; low /= 6 * 255; for (let i = 0; i < 9; i++) mids.push(bins[3 + i * 5] / 255); }
            else if (active) { low = .35 + .2 * Math.sin(now / 520); for (let i = 0; i < 9; i++) mids.push(.4 + .35 * Math.sin(now / 300 + i * 1.3)); }
            amp += ((active ? 1 : 0) - amp) * .08; level += (low - level) * .15;
            if (!motion()) amp = level = 0;
            waves.forEach(canvas => {
                const ratio = Math.min(devicePixelRatio || 1, 2), width = canvas.clientWidth, height = canvas.clientHeight;
                if (!width || !height) return;
                if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
                const x = canvas.getContext('2d'); if (!x) return;
                x.setTransform(ratio, 0, 0, ratio, 0, 0); x.clearRect(0, 0, width, height);
                x.strokeStyle = x.fillStyle = getComputedStyle(canvas).color; x.lineWidth = 1.6; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
                for (let i = 0; i <= 40; i++) {
                    const u = i / 40, envelope = Math.sin(Math.PI * u), m = mids.length ? mids[Math.min(8, Math.floor(u * 9))] : 0;
                    const y = height / 2 + Math.sin(u * 9 + now / 260) * envelope * (height * .38) * amp * (.35 + .65 * m);
                    i ? x.lineTo(2 + u * (width - 8), y) : x.moveTo(2, y);
                }
                x.stroke(); x.beginPath(); x.arc(width - 3, height / 2, 2 + amp * 1.2, 0, Math.PI * 2); x.fill();
            });
            window.Ink?.setMusic?.(motion() ? level * amp : 0);
            if (active || amp > .01) frame = requestAnimationFrame(draw);
        }
        frame = requestAnimationFrame(draw);
    }
    toggles.forEach(b => b.addEventListener('click', event => {
        event.stopPropagation(); if (state === 'playing' || state === 'loading') pause(); else enable(true);
    }));
    ranges.forEach(range => {
        range.value = volume; range.style.setProperty('--fill', `${volume * 100}%`);
        range.addEventListener('input', () => {
            volume = clamp(Number.parseFloat(range.value)); store.set('ink-volume', String(volume));
            ranges.forEach(other => { other.value = volume; other.style.setProperty('--fill', `${volume * 100}%`); });
            if (state === 'playing') { if (buffers) setGain(master.gain, volume, .15); else mix(.15); }
        });
    });
    addEventListener('ink-theme', () => { if (state === 'playing') mix(1.6); ui(); });
    root.addEventListener('ink:motionchange', meter);
    addEventListener('resize', meter, { passive: true });
    addEventListener('pagehide', () => {
        const running = wanted; const pos = position(); pause(false);
        try { sessionStorage.setItem('ink-sound-pos', JSON.stringify({ pos, at: running ? Date.now() : null })); } catch { /* private mode */ }
    });
    addEventListener('pageshow', event => { if (event.persisted && store.get('ink-sound') === 'on') { restorePosition(); enable(false); } });
    restorePosition(); ui(); meter();
    // New visits try autoplay; an explicit off preference remains in control.
    if (store.get('ink-sound') !== 'off') enable(false);
})();
