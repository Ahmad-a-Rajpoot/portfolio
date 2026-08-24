/* Runs first, before <body> parses. Strips a leftover #hash on a plain
   reload only — not on a fresh visit to a deep link, not on back/forward —
   so the browser has nothing to jump to and a reload always lands at the
   top. In-page nav clicks (see main.js) still push a real hash for
   shareable links; this only clears it when reloading the same page. */
(function () {
  try {
    var isReload = false;
    var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
    if (entries && entries[0]) {
      isReload = entries[0].type === "reload";
    } else if (performance.navigation) {
      isReload = performance.navigation.type === 1;
    }
    if (isReload && location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  } catch (e) {}
})();
