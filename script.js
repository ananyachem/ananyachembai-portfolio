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
