(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    startHero();

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (filterInput && query) {
      filterInput.value = query;
    }

    function applyFilters() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";

      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }
        if (type && cardType !== type) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
      });
    }

    if (cards.length) {
      [filterInput, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
      applyFilters();
    }
  });
})();
