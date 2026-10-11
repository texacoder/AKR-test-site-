(function () {
  // ---------- Data ----------
  const APPS = [];
  for (const group of window.PORTAL_SITES) {
    for (const s of group.sites) APPS.push({ ...s, category: group.category });
  }
  const byId = new Map(APPS.map((a) => [a.id, a]));
  const CATEGORIES = window.PORTAL_SITES.map((g) => g.category);

  // ---------- Persistence (local only) ----------
  const KEY = "akr-portal:v1";
  const DEFAULTS = {
    theme: "system",
    newTab: true,
    showRecent: true,
    direct: false,
    favorites: [],
    recent: []
  };
  function load() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    } catch {
      return { ...DEFAULTS };
    }
  }
  let state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const view = $("#view");
  const search = $("#search");
  let tab = "home";
  let activeCategory = CATEGORIES[0];

  function hue(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // Plain letter icon instead of company logos (avoids trademark/logo-usage issues).
  function paintIcon(node, app) {
    node.textContent = app.name.charAt(0);
    node.style.setProperty("--h", hue(app.name));
    node.setAttribute("aria-hidden", "true");
    return node;
  }
  function domain(url) {
    return new URL(url).hostname.replace(/^www\./, "");
  }
  const isFav = (id) => state.favorites.includes(id);

  function openApp(app) {
    state.recent = [app.id, ...state.recent.filter((id) => id !== app.id)].slice(0, 12);
    save();
    if (state.newTab) window.open(app.url, "_blank", "noopener,noreferrer");
    else window.location.href = app.url;
  }

  function onAppClick(app) {
    if (state.direct) openApp(app);
    else showDetails(app);
  }

  // ---------- Components ----------
  function tile(app) {
    const b = el("button", "tile");
    b.type = "button";
    b.append(paintIcon(el("span", "icon"), app), el("span", "tile-name", app.name), el("span", "tile-sub", app.category));
    b.addEventListener("click", () => onAppClick(app));
    return b;
  }

  function listItem(app) {
    const b = el("button", "list-item");
    b.type = "button";
    const text = el("span", "li-text");
    text.append(el("strong", null, app.name), el("small", null, app.category + " · " + domain(app.url)));
    const star = el("span", "li-star" + (isFav(app.id) ? " on" : ""), isFav(app.id) ? "★" : "");
    b.append(paintIcon(el("span", "icon"), app), text, star);
    b.addEventListener("click", () => onAppClick(app));
    return b;
  }

  function row(title, apps) {
    const sec = el("section", "row");
    const head = el("div", "row-head");
    head.append(el("h2", null, title));
    const strip = el("div", "strip");
    apps.forEach((a) => strip.append(tile(a)));
    sec.append(head, strip);
    return sec;
  }

  function emptyState(msg) {
    return el("p", "empty", msg);
  }

  // ---------- Views ----------
  function renderHome() {
    const favs = state.favorites.map((id) => byId.get(id)).filter(Boolean);
    if (favs.length) view.append(row("Your apps", favs));
    if (state.showRecent) {
      const recent = state.recent.map((id) => byId.get(id)).filter(Boolean);
      if (recent.length) view.append(row("Recently opened", recent));
    }
    for (const group of window.PORTAL_SITES) {
      view.append(row(group.category, APPS.filter((a) => a.category === group.category)));
    }
  }

  function renderCategories() {
    const chips = el("div", "chips");
    for (const c of CATEGORIES) {
      const chip = el("button", "chip", c);
      chip.type = "button";
      chip.setAttribute("aria-pressed", String(c === activeCategory));
      chip.addEventListener("click", () => { activeCategory = c; render(); });
      chips.append(chip);
    }
    const list = el("div", "list");
    APPS.filter((a) => a.category === activeCategory).forEach((a) => list.append(listItem(a)));
    view.append(chips, list);
  }

  function renderLibrary() {
    const favs = state.favorites.map((id) => byId.get(id)).filter(Boolean);
    view.append(el("h2", "section-title", "Favorites"));
    if (!favs.length) {
      view.append(emptyState("No favorites yet. Open an app's page and tap “Add to My apps”."));
    } else {
      const list = el("div", "list");
      favs.forEach((a) => list.append(listItem(a)));
      view.append(list);
    }
  }

  function renderSearch(q) {
    const results = APPS.filter((a) =>
      (a.name + " " + a.desc + " " + a.category + " " + a.url).toLowerCase().includes(q)
    );
    view.append(el("h2", "section-title", `Results for “${search.value.trim()}”`));
    if (!results.length) return view.append(emptyState("No apps match your search."));
    const list = el("div", "list");
    results.forEach((a) => list.append(listItem(a)));
    view.append(list);
  }

  function render() {
    view.replaceChildren();
    document.querySelectorAll(".tabs [role=tab]").forEach((t) => {
      t.setAttribute("aria-selected", String(t.dataset.tab === tab));
    });
    const q = search.value.trim().toLowerCase();
    if (q) return renderSearch(q);
    if (tab === "categories") renderCategories();
    else if (tab === "library") renderLibrary();
    else renderHome();
  }

  // ---------- Details sheet ----------
  const details = $("#details");
  let current = null;
  function syncFavButton() {
    $("#d-fav").textContent = isFav(current.id) ? "★ In My apps" : "☆ Add to My apps";
  }
  function showDetails(app) {
    current = app;
    paintIcon($("#d-icon"), app);
    $("#d-name").textContent = app.name;
    $("#d-domain").textContent = domain(app.url);
    $("#d-cat").textContent = app.category;
    $("#d-desc").textContent = app.desc;
    $("#d-open").href = app.url;
    syncFavButton();
    details.showModal();
  }
  $("#d-open").addEventListener("click", (e) => {
    e.preventDefault();
    details.close();
    openApp(current);
  });
  $("#d-fav").addEventListener("click", () => {
    state.favorites = isFav(current.id)
      ? state.favorites.filter((id) => id !== current.id)
      : [...state.favorites, current.id];
    save();
    syncFavButton();
    render();
  });

  // ---------- Settings ----------
  const settings = $("#settings");
  function applyTheme() {
    if (state.theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", state.theme);
  }
  function syncSettings() {
    $("#s-theme").value = state.theme;
    $("#s-newtab").checked = state.newTab;
    $("#s-recent").checked = state.showRecent;
    $("#s-direct").checked = state.direct;
  }
  $("#open-settings").addEventListener("click", () => { syncSettings(); settings.showModal(); });
  $("#s-theme").addEventListener("change", (e) => { state.theme = e.target.value; save(); applyTheme(); });
  $("#s-newtab").addEventListener("change", (e) => { state.newTab = e.target.checked; save(); });
  $("#s-recent").addEventListener("change", (e) => { state.showRecent = e.target.checked; save(); render(); });
  $("#s-direct").addEventListener("change", (e) => { state.direct = e.target.checked; save(); });
  $("#s-clear-recent").addEventListener("click", () => { state.recent = []; save(); render(); });
  $("#s-reset").addEventListener("click", () => {
    if (!confirm("Reset all settings, favorites and recents?")) return;
    state = { ...DEFAULTS };
    save(); applyTheme(); syncSettings(); render();
  });

  // Close a sheet when its backdrop is clicked.
  for (const d of [details, settings]) {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  }

  // ---------- Navigation ----------
  document.querySelectorAll("[data-tab]").forEach((t) => {
    t.addEventListener("click", (e) => {
      e.preventDefault();
      tab = t.dataset.tab;
      search.value = "";
      render();
    });
  });
  search.addEventListener("input", render);
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search && !document.querySelector("dialog[open]")) {
      e.preventDefault();
      search.focus();
    }
  });

  applyTheme();
  render();
})();
