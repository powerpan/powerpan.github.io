/* Shared by the static generator and the browser player. Paths are relative to assets/. */
(() => {
    const tracks = Object.freeze([
        { id: 'emerald-drift', file: 'emerald-drift.mp3', titleKey: 'bgm_title' },
        { id: 'liquid-chrome', file: 'music/liquid-chrome.mp3', titleKey: 'music_liquid_chrome' },
        { id: 'glass-dawn', file: 'music/glass-dawn.mp3', titleKey: 'music_glass_dawn' },
        { id: 'abyssal-signal', file: 'music/abyssal-signal.mp3', titleKey: 'music_abyssal_signal' },
        { id: 'neural-weave', file: 'music/neural-weave.mp3', titleKey: 'music_neural_weave' },
        { id: 'moss-circuit', file: 'music/moss-circuit.mp3', titleKey: 'music_moss_circuit' },
        { id: 'orbital-afterglow', file: 'music/orbital-afterglow.mp3', titleKey: 'music_orbital_afterglow' },
    ]);
    if (typeof module !== 'undefined' && module.exports) module.exports = tracks;
    else window.SiteMusicTracks = tracks;
})();
