/* Shared behaviour: mobile menu, page slide transitions,
   swipe navigation, and the sliding nav underline. */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Mobile hamburger menu ---------- */
    var menuIcon = document.getElementById("menu-icon");
    var closeIcon = document.getElementById("close-icon");
    var navMenu = document.getElementById("nav-menu");
    if (menuIcon && navMenu) {
        menuIcon.addEventListener("click", function () {
            navMenu.classList.add("open");
        });
    }
    if (closeIcon && navMenu) {
        closeIcon.addEventListener("click", function () {
            navMenu.classList.remove("open");
        });
    }

    /* ---------- Page order (matches the nav) ---------- */
    var ORDER = ["index", "about", "portfolio", "resume", "contact"];
    var inPages = window.location.pathname.indexOf("/pages/") !== -1;

    function keyFromPath(p) {
        var file = p.substring(p.lastIndexOf("/") + 1);
        if (!file) { file = "index.html"; }
        return file.replace(/\.html.*$/, "");
    }
    function hrefFor(key) {
        if (key === "index") { return inPages ? "../index.html" : "index.html"; }
        return inPages ? key + ".html" : "pages/" + key + ".html";
    }
    function rank(key) {
        var i = ORDER.indexOf(key);
        return i !== -1 ? i : ORDER.indexOf("portfolio") + 0.5; // project pages
    }

    var currentKey = keyFromPath(window.location.pathname);
    var isProjectPage = ORDER.indexOf(currentKey) === -1;
    var navIndex = isProjectPage ? ORDER.indexOf("portfolio") : ORDER.indexOf(currentKey);

    /* ---------- Entrance animation ---------- */
    var dir = null;
    try {
        dir = sessionStorage.getItem("pageDir");
        sessionStorage.removeItem("pageDir");
    } catch (e) { /* private mode */ }
    if (!reduceMotion) {
        if (dir === "forward") { document.body.classList.add("is-entering-right"); }
        else if (dir === "back") { document.body.classList.add("is-entering-left"); }
    }

    /* ---------- Navigate with a slide-out ---------- */
    var navigating = false;
    function slideTo(href, direction) {
        if (navigating || !href) { return; }
        navigating = true;
        try { sessionStorage.setItem("pageDir", direction); } catch (e) { /* ignore */ }
        if (reduceMotion) {
            window.location.href = href;
            return;
        }
        document.body.classList.remove("is-entering-right", "is-entering-left");
        document.body.classList.add(
            direction === "forward" ? "is-leaving-left" : "is-leaving-right"
        );
        setTimeout(function () { window.location.href = href; }, 430);
    }

    /* ---------- Intercept internal links ---------- */
    var links = document.querySelectorAll("a[href]");
    Array.prototype.forEach.call(links, function (a) {
        var href = a.getAttribute("href");
        if (!href) { return; }
        if (a.target === "_blank" || a.hasAttribute("download")) { return; }
        if (/^(https?:)?\/\//.test(href) ||
            href.charAt(0) === "#" ||
            href.indexOf("mailto:") === 0 ||
            href.indexOf("tel:") === 0) { return; }
        if (!/\.html(\?|#|$)/.test(href)) { return; } // only page links

        a.addEventListener("click", function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) { return; }
            e.preventDefault();
            var targetKey = keyFromPath(href);
            var direction = rank(targetKey) >= rank(currentKey) ? "forward" : "back";
            slideTo(href, direction);
        });
    });

    /* ---------- Swipe navigation (touch) ---------- */
    var startX = null, startY = null;
    document.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
        if (startX === null) { return; }
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        startX = startY = null;
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.4) { return; }
        if (dx < 0) { // swipe left -> next page
            if (navIndex < ORDER.length - 1) {
                slideTo(hrefFor(ORDER[navIndex + 1]), "forward");
            }
        } else { // swipe right -> previous page
            if (isProjectPage) {
                slideTo(hrefFor("portfolio"), "back");
            } else if (navIndex > 0) {
                slideTo(hrefFor(ORDER[navIndex - 1]), "back");
            }
        }
    }, { passive: true });

    /* ---------- Sliding nav underline ---------- */
    if (navMenu) {
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
    }
})();
