(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        stopHero();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }
        startHero();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var root = panel.closest('section') || document;
        var search = panel.querySelector('[data-local-search]');
        var region = panel.querySelector('[data-region-filter]');
        var year = panel.querySelector('[data-year-filter]');
        var sort = panel.querySelector('[data-sort-filter]');
        var grid = root.querySelector('[data-card-grid]');
        var empty = root.querySelector('[data-empty-state]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

        function applyFilters() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    ok = false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        function applySort() {
            if (!sort) {
                return;
            }
            var value = sort.value;
            var sorted = cards.slice();
            if (value === 'year-desc') {
                sorted.sort(function (a, b) {
                    return String(b.dataset.year).localeCompare(String(a.dataset.year));
                });
            }
            if (value === 'title-asc') {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-Hans-CN');
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        [search, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
        if (sort) {
            sort.addEventListener('change', function () {
                applySort();
                applyFilters();
            });
        }
    });
})();
