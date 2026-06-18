import { H as Hls } from './hls.js';

function setupMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        menu.classList.toggle('is-open');
    });
}

function setupHero() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            show(dotIndex);
            start();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(index + 1);
            start();
        });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function setupSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';

            if (!query) {
                event.preventDefault();
            }
        });
    });
}

function setupLocalFilter() {
    const input = document.querySelector('[data-local-filter]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));

    if (!input || cards.length === 0) {
        return;
    }

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.tags,
                card.dataset.genre
            ].join(' ').toLowerCase();

            card.style.display = haystack.includes(query) ? '' : 'none';
        });
    });
}

function setupPlayers() {
    document.querySelectorAll('video[data-hls-src]').forEach((video) => {
        const source = video.dataset.hlsSrc;

        if (!source) {
            return;
        }

        if (Hls && Hls.isSupported && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
    });

    document.querySelectorAll('[data-play-trigger]').forEach((button) => {
        button.addEventListener('click', () => {
            const panel = button.closest('.player-wrap');
            const video = panel ? panel.querySelector('video') : null;

            if (!video) {
                return;
            }

            button.style.display = 'none';
            video.play().catch(() => {
                button.style.display = '';
            });
        });
    });
}

async function setupSearchPage() {
    const box = document.querySelector('[data-search-results]');

    if (!box) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim().toLowerCase();
    const title = document.querySelector('[data-search-title]');

    if (title) {
        title.textContent = query ? `“${query}” 的搜索结果` : '站内影片搜索';
    }

    if (!query) {
        box.innerHTML = '<div class="search-empty">请输入片名、类型、地区或标签进行搜索。</div>';
        return;
    }

    const response = await fetch(new URL('./movies.json', import.meta.url));
    const movies = await response.json();
    const results = movies.filter((movie) => {
        const haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category_name,
            movie.tags.join(' '),
            movie.one_line
        ].join(' ').toLowerCase();

        return haystack.includes(query);
    }).slice(0, 120);

    if (results.length === 0) {
        box.innerHTML = '<div class="search-empty">没有找到匹配影片，可以换一个关键词继续搜索。</div>';
        return;
    }

    box.innerHTML = results.map((movie) => {
        const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

        return `
            <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-tags="${escapeHtml(movie.tags.join(' '))}" data-genre="${escapeHtml(movie.genre)}">
                <a href="detail/movie-${String(movie.id).padStart(4, '0')}.html" class="card-link" aria-label="查看${escapeHtml(movie.title)}">
                    <div class="card-poster">
                        <img src="${movie.cover_no}.jpg" alt="${escapeHtml(movie.title)}" loading="lazy">
                        <span class="card-badge">${escapeHtml(movie.category_name)}</span>
                        <span class="card-play">▶</span>
                    </div>
                    <div class="card-body">
                        <h3>${escapeHtml(movie.title)}</h3>
                        <p>${escapeHtml(movie.one_line)}</p>
                        <div class="card-meta">
                            <span>${escapeHtml(movie.year)}</span>
                            <span>${escapeHtml(movie.region)}</span>
                            <span>${escapeHtml(movie.type)}</span>
                        </div>
                        <div class="tag-row">${tags}</div>
                    </div>
                </a>
            </article>`;
    }).join('');
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

setupMobileMenu();
setupHero();
setupSearchForms();
setupLocalFilter();
setupPlayers();
setupSearchPage();
