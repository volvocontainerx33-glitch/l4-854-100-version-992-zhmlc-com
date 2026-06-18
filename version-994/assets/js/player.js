(function () {
  window.initializePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var attached = false;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attachSource();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
