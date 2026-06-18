(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var pages = Array.prototype.slice.call(document.querySelectorAll("[data-filter-page]"));
    pages.forEach(function (page) {
      var input = page.querySelector("[data-filter-input]");
      var year = page.querySelector("[data-filter-year]");
      var sort = page.querySelector("[data-filter-sort]");
      var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
      var empty = page.querySelector(".empty-state");
      var count = page.querySelector("[data-visible-count]");

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var visible = [];

        cards.forEach(function (card) {
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var genre = (card.getAttribute("data-genre") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchedKeyword = !keyword || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1;
          var matchedYear = !selectedYear || selectedYear === cardYear;
          var shown = matchedKeyword && matchedYear;
          card.classList.toggle("hidden-by-filter", !shown);
          if (shown) {
            visible.push(card);
          }
        });

        if (sort && sort.value) {
          var container = cards[0] ? cards[0].parentNode : null;
          if (container) {
            visible.sort(function (a, b) {
              if (sort.value === "score") {
                return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
              }
              return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
            });
            visible.forEach(function (card) {
              container.appendChild(card);
            });
          }
        }

        if (empty) {
          empty.classList.toggle("show", visible.length === 0);
        }
        if (count) {
          count.textContent = String(visible.length);
        }
      }

      [input, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var container = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-box]");
    var heading = document.querySelector("[data-search-heading]");
    if (!container || !form || !input || !window.MovieSearchIndex) {
      return;
    }

    function params() {
      return new URLSearchParams(window.location.search);
    }

    function itemTemplate(item) {
      return [
        '<article class="movie-card">',
        '<a class="card-cover" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<strong>' + escapeHtml(item.score) + '</strong>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-tags"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
        '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.line) + '</p>',
        '</div>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render(query) {
      var keyword = (query || "").trim().toLowerCase();
      var results = window.MovieSearchIndex.filter(function (item) {
        var haystack = [item.title, item.region, item.genre, item.category, item.tags].join(" ").toLowerCase();
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (heading) {
        heading.textContent = keyword ? "搜索结果" : "热门影片";
      }
      container.innerHTML = results.map(itemTemplate).join("") || '<div class="empty-state show">没有找到匹配的影片</div>';
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      url.searchParams.set("q", input.value.trim());
      window.history.replaceState(null, "", url.toString());
      render(input.value);
    });

    input.value = params().get("q") || "";
    render(input.value);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (video) {
      var source = video.getAttribute("data-stream") || "";
      var frame = video.closest(".player-frame");
      var button = frame ? frame.querySelector(".play-toggle") : null;
      var hls = null;

      if (source && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (source && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      }

      function update() {
        if (frame) {
          frame.classList.toggle("playing", !video.paused);
        }
      }

      function toggle() {
        if (video.paused) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", toggle);
      }
      video.addEventListener("click", toggle);
      video.addEventListener("play", update);
      video.addEventListener("pause", update);
      video.addEventListener("ended", update);
      update();

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
