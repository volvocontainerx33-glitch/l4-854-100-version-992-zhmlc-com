(function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var panels = Array.prototype.slice.call(
    document.querySelectorAll("[data-filter-panel]"),
  );
  panels.forEach(function (filterPanel) {
    var input = filterPanel.querySelector("[data-filter-input]");
    var year = filterPanel.querySelector("[data-year-filter]");
    var region = filterPanel.querySelector("[data-region-filter]");
    var type = filterPanel.querySelector("[data-type-filter]");
    var grid = document.querySelector("[data-filter-grid]");
    var empty = document.querySelector("[data-empty-state]");
    if (!grid) {
      return;
    }
    var items = Array.prototype.slice.call(grid.children);
    if (input && query) {
      input.value = query;
    }
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var shown = 0;
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-type") || "",
          item.getAttribute("data-genre") || "",
          item.getAttribute("data-category") || "",
          item.textContent || "",
        ]
          .join(" ")
          .toLowerCase();
        var match = true;
        if (q && haystack.indexOf(q) === -1) {
          match = false;
        }
        if (y && (item.getAttribute("data-year") || "") !== y) {
          match = false;
        }
        if (r && (item.getAttribute("data-region") || "") !== r) {
          match = false;
        }
        if (t && (item.getAttribute("data-type") || "") !== t) {
          match = false;
        }
        item.hidden = !match;
        if (match) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    };
    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  });

  Array.prototype.slice
    .call(document.querySelectorAll("img"))
    .forEach(function (img) {
      img.addEventListener(
        "error",
        function () {
          img.classList.add("image-error");
        },
        { once: true },
      );
    });
})();
