(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = button.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menu.hidden = !isOpen;
      document.body.classList.toggle("menu-open", isOpen);
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
    var index = 0;
    var timer = null;

    function activate(next) {
      index = next;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function play() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        activate(position);
        play();
      });
    });

    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    slider.addEventListener("mouseleave", function () {
      play();
    });

    activate(0);
    play();
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.tags,
      card.textContent
    ].join(" ").toLowerCase();
  }

  function initListingTools() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-listing]"));

    lists.forEach(function (list) {
      var panel = document.querySelector('[data-listing-tools="' + list.id + '"]');
      var empty = document.querySelector('[data-empty-for="' + list.id + '"]');

      if (!panel) {
        return;
      }

      var query = panel.querySelector(".js-query");
      var type = panel.querySelector(".js-type");
      var year = panel.querySelector(".js-year");
      var sort = panel.querySelector(".js-sort");
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card="movie"]'));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (query && initialQuery) {
        query.value = initialQuery;
      }

      function run() {
        var q = query ? query.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var okQuery = !q || textOf(card).indexOf(q) !== -1;
          var okType = !t || card.dataset.type === t;
          var okYear = !y || card.dataset.year === y;
          var ok = okQuery && okType && okYear;

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (sort) {
          var value = sort.value;
          var sorted = cards.slice().sort(function (a, b) {
            if (value === "heat-desc") {
              return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
            }
            if (value === "year-desc") {
              return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            if (value === "title-asc") {
              return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
            }
            return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
          });

          sorted.forEach(function (card) {
            list.appendChild(card);
          });
        }

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      cards.forEach(function (card, position) {
        card.dataset.order = String(position);
      });

      [query, type, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", run);
          control.addEventListener("change", run);
        }
      });

      run();
    });
  }

  window.setupMoviePlayer = function (playerId, sourceUrl) {
    var box = document.getElementById(playerId);

    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var button = box.querySelector(".player-start");
    var hls = null;

    if (!video || !button) {
      return;
    }

    function load() {
      if (video.dataset.loaded === "1") {
        return;
      }

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

      video.dataset.loaded = "1";
    }

    function start() {
      load();
      box.classList.add("is-playing");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", start);

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.add("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initListingTools();
  });
})();
