(function () {
  const portal = document.getElementById("portal");
  const search = document.getElementById("search");
  const empty = document.getElementById("empty");

  // Deterministic colour per site name, so letter badges stay stable.
  function hue(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }

  function card(site) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = site.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.search = (site.name + " " + site.desc + " " + site.url).toLowerCase();

    // Plain letter badge instead of company logos (avoids trademark/logo-usage issues).
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = site.name.charAt(0);
    badge.style.setProperty("--h", hue(site.name));
    badge.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "text";
    const name = document.createElement("strong");
    name.textContent = site.name;
    const desc = document.createElement("small");
    desc.textContent = site.desc;
    text.append(name, desc);

    a.append(badge, text);
    return a;
  }

  for (const group of window.PORTAL_SITES) {
    const section = document.createElement("section");
    section.className = "group";
    const h2 = document.createElement("h2");
    h2.textContent = group.category;
    const grid = document.createElement("div");
    grid.className = "grid";
    group.sites.forEach((s) => grid.append(card(s)));
    section.append(h2, grid);
    portal.append(section);
  }

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const section of portal.querySelectorAll(".group")) {
      let visible = 0;
      for (const c of section.querySelectorAll(".card")) {
        const match = !q || c.dataset.search.includes(q);
        c.hidden = !match;
        if (match) visible++;
      }
      section.hidden = visible === 0;
      shown += visible;
    }
    empty.hidden = shown !== 0;
  });

  // "/" focuses the filter; Enter opens the first visible match.
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = portal.querySelector(".card:not([hidden])");
      if (first) first.click();
    }
  });
})();
