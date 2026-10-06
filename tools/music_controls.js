const tracks = require('../js/music-library');

function addMusicRuntime($, lang, t) {
  const motion = $('#motionToggle, [data-page-motion]').first().remove();
  $('#bgm, #siteSound, #nowPlaying').remove();
  $('#mobileBgmBtn').closest('li').remove();
  $('script[src$="/music.js"], script[src$="/music-library.js"], link[href$="/music.css"]').remove();
  const widget = $('<div id="siteSound" class="site-sound" data-state="paused" hidden></div>');
  widget.html('<button type="button" id="nowPlaying" class="site-sound-toggle" aria-pressed="false">' +
    '<svg class="sound-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"></path><path class="sound-waves" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"></path><path class="sound-off" d="m15 9 6 6m0-6-6 6"></path></svg>' +
    '<span class="sound-title"></span><span class="sound-meter" aria-hidden="true"><i></i><i></i><i></i></span></button>' +
    '<button type="button" id="soundSettings" class="sound-settings" aria-expanded="false" aria-controls="soundPanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16"></path><circle cx="9" cy="7" r="3" fill="var(--bg-elevated)"></circle><circle cx="15" cy="17" r="3" fill="var(--bg-elevated)"></circle></svg></button>' +
    '<section id="soundPanel" class="sound-panel" hidden><div class="sound-panel-heading"><div class="sound-panel-track"></div><span id="soundTrackCount" class="sound-track-count">1 / ' + tracks.length + '</span></div>' +
    '<label for="soundTrack" data-i18n="audio_playlist"></label><select id="soundTrack" class="sound-track-select"></select>' +
    '<div class="sound-track-actions"><button type="button" id="soundPrevious"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 5v14m12-14-9 7 9 7Z"></path></svg><span data-i18n="audio_previous"></span></button><button type="button" id="soundNext"><span data-i18n="audio_next"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M18 5v14M6 5l9 7-9 7Z"></path></svg></button></div>' +
    '<label for="soundVolume" data-i18n="audio_volume"></label><div class="sound-volume-row"><input id="soundVolume" type="range" min="0" max="100" step="5" value="40"><output for="soundVolume" id="soundVolumeValue">40%</output></div><div class="sound-motion-slot"></div><p data-i18n="audio_note"></p></section>' +
    '<span id="soundStatus" class="sound-status" role="status" aria-live="polite"></span>');
  for (const track of tracks) widget.find('#soundTrack').append($('<option></option>')
    .attr({ value: track.id, 'data-i18n': track.titleKey }).text(t[track.titleKey]));
  widget.find('.sound-title, .sound-panel-track').attr('data-i18n', tracks[0].titleKey).text(t[tracks[0].titleKey]);
  widget.find('[data-i18n]').each((_, node) => $(node).text(t[$(node).attr('data-i18n')]));
  widget.find('#nowPlaying').attr({ 'aria-label': t.audio_play, title: t.audio_play });
  widget.find('#soundSettings, #soundPanel').attr('aria-label', t.audio_settings);
  widget.find('#soundSettings').attr('title', t.audio_settings);
  widget.find('.sound-motion-slot').append(motion);
  const audio = '<audio id="bgm" preload="none"><source src="/assets/' + tracks[0].file + '" type="audio/mpeg"></audio>';
  // The existing motion runtime captures the homepage button during script evaluation.
  const scripts = $('body > script').first();
  if (scripts.length) scripts.before(audio, widget);
  else $('body').append(audio, widget);
  $('head').append('<link rel="stylesheet" href="/css/music.css"><script src="/js/music-library.js" defer></script><script src="/js/music.js" defer></script>');
}

module.exports = { addMusicRuntime };
