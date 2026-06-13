/* Sliding nav underline: a single pink bar that glides to the hovered
   link and rests under the current page's link (desktop only). */
(function () {
    "use strict";

    var navMenu = document.getElementById("nav-menu");
    if (!navMenu) { return; }

    var indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    navMenu.appendChild(indicator);
    var activeLink = navMenu.querySelector("a.active");

    function moveTo(el) {
        if (!el || window.innerWidth <= 900) {
            indicator.style.opacity = "0";
            return;
        }
        var ulRect = navMenu.getBoundingClientRect();
        var r = el.getBoundingClientRect();
        indicator.style.left = (r.left - ulRect.left) + "px";
        indicator.style.width = r.width + "px";
        indicator.style.opacity = "1";
    }
    function reset() { moveTo(activeLink); }

    Array.prototype.forEach.call(navMenu.querySelectorAll("a"), function (a) {
        a.addEventListener("mouseenter", function () { moveTo(a); });
    });
    navMenu.addEventListener("mouseleave", reset);

    window.addEventListener("load", reset);
    window.addEventListener("resize", reset);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reset);
    }
    setTimeout(reset, 120);
})();


/* Twinkling sparkles on every page. The home page ships them in its markup;
   here we inject the same set into any page that doesn't already have them. */
(function () {
    "use strict";

    var header = document.getElementById("header");
    if (!header || header.querySelector(".sparkles")) { return; }

    var wrap = document.createElement("div");
    wrap.className = "sparkles";
    wrap.setAttribute("aria-hidden", "true");

    for (var i = 1; i <= 4; i++) {
        var spark = document.createElement("span");
        spark.className = "sparkle s" + i;
        spark.innerHTML = "&#10022;";
        wrap.appendChild(spark);
    }

    header.insertBefore(wrap, header.firstChild);
})();
