(function () {
  var boxes = Array.prototype.slice.call(
    document.querySelectorAll(".video-box[data-hls]"),
  );
  boxes.forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-layer");
    var src = box.getAttribute("data-hls");
    var ready = false;
    var hls = null;

    var attach = function () {
      if (ready || !video || !src) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }
      video.src = src;
    };

    var start = function () {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var play = video.play();
      if (play && play.catch) {
        play.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    };

    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && button) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    }
  });
})();
