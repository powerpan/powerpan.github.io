/* Explicit opt-in audio. Native page navigation carries a one-use playback handoff. */
(() => {
    function init() {
        const audio = document.getElementById('bgm');
        const widget = document.getElementById('siteSound');
        const toggle = document.getElementById('nowPlaying');
        if (!audio || !widget || !toggle || audio.dataset.initialized) return;
        audio.dataset.initialized = 'true';
        const settings = document.getElementById('soundSettings');
        const panel = document.getElementById('soundPanel');
        const volume = document.getElementById('soundVolume');
        const output = document.getElementById('soundVolumeValue');
        const status = document.getElementById('soundStatus');
        const key = 'site-audio-handoff';
        const track = 'emerald-drift';
        let wanted = false, pending = false, leaving = false, revision = 0;
        let position = null, lastSave = 0, message = '';
        audio.volume = 0.4;

        function copy() {
            const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
            return window.I18N?.[lang] || {};
        }
        function sync() {
            const t = copy();
            const playing = !audio.paused && !leaving;
            widget.dataset.state = pending ? 'loading' : playing ? 'playing' : 'paused';
            toggle.setAttribute('aria-pressed', String(playing));
            toggle.setAttribute('aria-label', playing ? t.audio_pause : t.audio_play);
            toggle.title = message ? t[message] : playing ? t.audio_pause : t.audio_play;
            settings.title = t.audio_settings;
            settings.setAttribute('aria-label', t.audio_settings);
            panel.setAttribute('aria-label', t.audio_settings);
            widget.querySelectorAll('[data-i18n]').forEach(node => {
                const text = t[node.dataset.i18n];
                if (text) node.textContent = text;
            });
            volume.value = String(Math.round(audio.volume * 100));
            output.textContent = volume.value + '%';
            status.textContent = message ? t[message] : '';
        }
        function save(resume = false) {
            if (leaving) return;
            const state = { version: 1, track, position: audio.currentTime || position || 0,
                volume: audio.volume, savedAt: Date.now(), resume };
            try { sessionStorage.setItem(key, JSON.stringify(state)); }
            catch { /* Blocked storage affects cross-page resume, not the current player. */ }
        }
        function seek() {
            if (position === null || audio.readyState < 1 || !(audio.duration > 0)) return;
            // MP3 metadata can initially report Infinity before its full duration is known.
            const next = Number.isFinite(audio.duration) ? position % audio.duration : position;
            try { audio.currentTime = next; position = null; }
            catch { /* A media backend may not be seekable until playback begins. */ }
        }
        function stop() {
            wanted = false; pending = false; message = ''; revision++;
            audio.pause();
            save(); sync();
        }
        function play() {
            wanted = true; pending = true; message = '';
            const request = ++revision;
            seek(); sync();
            // Call play directly in the music button's activation, never a global gesture handler.
            let result;
            try { result = audio.play(); } catch (error) { result = Promise.reject(error); }
            Promise.resolve(result).then(() => {
                if (request !== revision || leaving || !wanted) {
                    if (!wanted || leaving) audio.pause();
                    return;
                }
                pending = false; seek(); save(); sync();
            }).catch(error => {
                if (request !== revision || leaving) return;
                wanted = false; pending = false;
                message = error?.name === 'NotAllowedError' ? 'audio_resume' : 'audio_error';
                save(); sync();
            });
        }
        function restore() {
            let state;
            try { state = JSON.parse(sessionStorage.getItem(key)); }
            catch { return; }
            if (!state || state.version !== 1 || state.track !== track ||
                !Number.isFinite(state.position) || state.position < 0 || state.position > 7200 ||
                !Number.isFinite(state.volume) || state.volume < 0 || state.volume > 1 ||
                !Number.isFinite(state.savedAt)) return;
            position = state.position;
            audio.volume = state.volume;
            const age = Date.now() - state.savedAt;
            // Only a recent pagehide can carry consent. Checkpoints and fresh tabs are silent.
            const resume = state.resume === true && age >= 0 && age < 60000;
            save(); seek(); sync();
            if (resume) play();
        }
        function showSettings(open) {
            panel.hidden = !open;
            settings.setAttribute('aria-expanded', String(open));
        }
        toggle.addEventListener('click', () => {
            if (wanted || !audio.paused) stop();
            else play();
        });
        settings.addEventListener('click', () => showSettings(panel.hidden));
        volume.addEventListener('input', () => {
            const value = Number(volume.value);
            if (Number.isFinite(value)) audio.volume = Math.min(1, Math.max(0, value / 100));
            save(); sync();
        });
        audio.addEventListener('loadedmetadata', seek);
        audio.addEventListener('durationchange', seek);
        audio.addEventListener('canplay', seek);
        audio.addEventListener('playing', () => {
            if (leaving || !wanted) { audio.pause(); return; }
            pending = false; message = ''; sync();
        });
        audio.addEventListener('pause', () => {
            if (leaving || pending || !audio.paused) return;
            wanted = false; save(); sync();
        });
        audio.addEventListener('error', () => {
            if (leaving) return;
            wanted = false; pending = false; revision++; message = 'audio_error';
            save(); sync();
        });
        audio.addEventListener('timeupdate', () => {
            if (Date.now() - lastSave < 3000) return;
            lastSave = Date.now(); save();
        });
        document.addEventListener('click', event => {
            if (!event.target.closest?.('#siteSound')) showSettings(false);
        });
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || panel.hidden) return;
            showSettings(false); settings.focus();
        });
        window.addEventListener('pagehide', () => {
            save(wanted && (!audio.paused || pending));
            leaving = true; wanted = false; pending = false; revision++;
            audio.pause(); showSettings(false); sync();
        });
        window.addEventListener('pageshow', event => {
            if (!event.persisted) return;
            leaving = false; restore(); sync();
        });
        if (typeof MutationObserver !== 'undefined') {
            new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
        }
        widget.hidden = false;
        restore(); sync();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
