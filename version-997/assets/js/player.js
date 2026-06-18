import { H as Hls } from './hls-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell[data-stream]'));

players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;
    var ready = false;

    function attachStream() {
        if (!video || !stream || ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }
        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
            return;
        }
        video.src = stream;
    }

    function playVideo() {
        attachStream();
        if (button) {
            button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
