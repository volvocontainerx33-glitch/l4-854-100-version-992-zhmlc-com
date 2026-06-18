function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !button || !source) {
    return;
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function start() {
    button.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    if (!loaded) {
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      }
    }

    playVideo();
  }

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!loaded) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
