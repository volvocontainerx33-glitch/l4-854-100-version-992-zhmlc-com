(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      showSlide(index);
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var filterInput = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';

    if (queryFromUrl && filterInput) {
      filterInput.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function filterCards() {
      var query = normalize(filterInput ? filterInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var visible = matchesQuery && matchesYear && matchesType;

        card.classList.toggle('hidden-card', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }
    }

    [filterInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }
})();
