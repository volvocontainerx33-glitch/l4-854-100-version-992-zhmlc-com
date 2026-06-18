(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        stop();
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filters.forEach(function (input) {
      var scopeSelector = input.getAttribute('data-filter-scope');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var value = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('hidden-card', keyword && value.indexOf(keyword) === -1);
        });
      });
    });
  }

  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  function initPlayer() {
    var frame = document.querySelector('[data-player]');
    if (!frame) {
      return;
    }
    var video = frame.querySelector('video');
    var trigger = frame.querySelector('[data-play]');
    var cover = frame.querySelector('.player-cover');
    var source = frame.getAttribute('data-stream') || '';
    var loaded = false;
    var hls = null;

    function loadAndPlay() {
      if (!video || !source) {
        return;
      }
      frame.classList.add('is-playing');
      video.controls = true;

      if (loaded) {
        playVideo(video);
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          playVideo(video);
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        playVideo(video);
      }, { once: true });
      video.load();
    }

    if (trigger) {
      trigger.addEventListener('click', loadAndPlay);
    }
    if (cover) {
      cover.addEventListener('click', loadAndPlay);
    }
    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });
  }

  function createResultCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + encodeURI(item.href) + '">',
      '<img src="' + encodeURI(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.year || item.type || '') + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(item.category || '') + '</span><span>' + escapeHtml(item.region || '') + '</span></div>',
      '<h3><a href="' + encodeURI(item.href) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.line || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-search-select]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !input || !results || !window.siteMovies) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var category = select ? select.value : '';
      var items = window.siteMovies.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.category, item.line, (item.tags || []).join(' ')].join(' ').toLowerCase();
        var hitKeyword = !keyword || text.indexOf(keyword) !== -1;
        var hitCategory = !category || item.category === category;
        return hitKeyword && hitCategory;
      }).slice(0, 96);

      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，可以更换关键词继续搜索。</div>';
        return;
      }
      results.innerHTML = items.map(createResultCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var next = input.value.trim();
      var url = next ? '?q=' + encodeURIComponent(next) : window.location.pathname;
      window.history.replaceState({}, '', url);
      render();
    });
    input.addEventListener('input', render);
    if (select) {
      select.addEventListener('change', render);
    }
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initPlayer();
    initSearchPage();
  });
})();
