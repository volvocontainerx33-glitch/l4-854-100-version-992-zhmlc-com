(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
        input.value = query;
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="card-cover" href="' + escapeHtml(movie.url) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="card-badge">' + escapeHtml(movie.badge) + '</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.description) + '</p>' +
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<div class="card-tags">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function runSearch(value) {
        var keyword = String(value || '').trim().toLowerCase();
        if (!results || !note) {
            return;
        }
        if (!keyword) {
            note.textContent = '输入关键词搜索片单';
            results.innerHTML = '';
            return;
        }
        var data = window.SEARCH_MOVIES || [];
        var matches = data.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.description,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        }).slice(0, 120);
        note.textContent = matches.length ? '以下为相关片单' : '没有找到匹配的影片';
        results.innerHTML = matches.map(createCard).join('');
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input ? input.value.trim() : '';
            var url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.history.replaceState(null, '', url);
            runSearch(value);
        });
    }

    runSearch(query);
})();
