# Shared Audio

All published Chinese and English pages receive one shared music dock through
`tools/music_controls.js`. It uses `js/music.js` and `css/music.css`. The homepage
also carries source-preview markup. The left-hand dock contains a native music
button and a settings disclosure for volume and the existing motion preference.
Motion and audio remain independent; system reduced motion never starts audio.

## Consent And Loading

Fresh visits are silent, with `preload="none"` and no autoplay attribute. Only the
music button starts a new playback session. Clicking links, switching themes,
opening menus, typing, adjusting volume and changing motion never start music.
There is no global gesture handler or retry loop for media playback.

## Cross-Page Handoff

The site retains native multi-page links, SEO, history and view transitions. A
`pagehide` event records the current position, volume and active opt-in in
per-tab `sessionStorage`, then pauses the departing audio element. The next
document consumes this recent, one-use handoff. Ordinary progress checkpoints
never contain a resume instruction. Handoffs older than 60 seconds, malformed
states and unrelated tracks cannot autoplay. BFCache returns read the latest
position instead of replaying an old document's position.

This is cross-document resume, not uninterrupted audio: navigation can produce
a short gap. Browser autoplay policies may reject a resume request; the dock then
offers an explicit click-to-resume instead of retrying on unrelated gestures.
Blocked storage leaves the current player usable but disables cross-page resume.
Original WAV material is retained outside the public site; the public MP3 is
`assets/emerald-drift.mp3`.

## Validation

Run `npm run build` and `npm run check`. `tools/music.test.js` covers consent,
page/language injection, native controls, pause, handoff consumption, progress,
volume, rejected playback, stale state, history, storage failure and late promises.
Then test actual links and history in the local browser, including mobile layouts,
the sound settings, retained motion switch and both palettes.
The local preview serves single byte ranges (206/416), so media seeking matches
static hosting rather than silently restarting the MP3 at zero.
