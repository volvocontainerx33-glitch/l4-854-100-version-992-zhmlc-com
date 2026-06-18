(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
            button.textContent = panel.classList.contains('open') ? '×' : '☰';
        });
    }

    function setupHero() {
        var slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                stop();
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupPageFilter() {
        var bars = Array.prototype.slice.call(document.querySelectorAll('.filter-bar'));
        bars.forEach(function (bar) {
            var input = bar.querySelector('[data-filter-input]');
            var year = bar.querySelector('[data-filter-year]');
            var region = bar.querySelector('[data-filter-region]');
            var scope = document.querySelector(bar.getAttribute('data-filter-scope') || '.movie-grid');
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var regionValue = region ? region.value : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    card.classList.toggle('hide-card', !(matchedKeyword && matchedYear && matchedRegion));
                });
            }
            [input, year, region].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupPlayer() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var source = shell.getAttribute('data-video');
            var buttons = Array.prototype.slice.call(shell.querySelectorAll('.play-btn, .video-mask'));
            var started = false;
            if (!video || !source) {
                return;
            }
            function attach() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.controls = true;
                shell.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    attach();
                });
            });
            video.addEventListener('click', attach);
        });
    }

    function setupSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-box]');
        var result = document.querySelector('[data-search-results]');
        var empty = document.querySelector('[data-empty-state]');
        if (!form || !input || !result || !window.MOVIE_INDEX) {
            return;
        }
        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a href="./' + movie.file + '" class="movie-card-link">',
                '<figure class="movie-poster">',
                '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                '<figcaption>' + movie.category + '</figcaption>',
                '</figure>',
                '<div class="movie-card-body">',
                '<div class="movie-meta-line"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
                '<h3>' + movie.title + '</h3>',
                '<p>' + movie.desc + '</p>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }
        function run(value) {
            var keyword = value.trim().toLowerCase();
            var list = window.MOVIE_INDEX;
            if (keyword) {
                list = list.filter(function (movie) {
                    return [movie.title, movie.region, movie.year, movie.genre, movie.tags, movie.desc].join(' ').toLowerCase().indexOf(keyword) !== -1;
                });
            }
            result.innerHTML = list.slice(0, 120).map(card).join('');
            if (empty) {
                empty.classList.toggle('show', list.length === 0);
            }
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            run(input.value);
        });
        input.addEventListener('input', function () {
            run(input.value);
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        input.value = q;
        run(q);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupPageFilter();
        setupPlayer();
        setupSearchPage();
    });
}());
