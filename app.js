// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

if (navToggle && navMobile) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMobile.setAttribute("aria-hidden", String(expanded));
  });

  // close menu when clicking a link
  navMobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navMobile.setAttribute("aria-hidden", "true");
    });
  });
}

// Footer year
const y = document.getElementById("year");
if (y) y.textContent = String(new Date().getFullYear());

// ===== Scroll spy: highlight current section in nav (desktop + mobile) =====
(function () {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll("[data-spy]"));

  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const active = href.endsWith(`#${id}`) || href.includes(`#${id}`);
      a.classList.toggle("is-active", active);
    });
  }

  if (location.hash) setActive(location.hash.replace("#", ""));
  else setActive(sections[0].id);

  const onScroll = () => {
    const yy = window.scrollY + 120;
    let current = sections[0].id;

    for (const s of sections) {
      if (s.offsetTop <= yy) current = s.id;
    }
    setActive(current);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", () => {
    if (location.hash) setActive(location.hash.replace("#", ""));
  });

  onScroll();
})();

// ==============================
// Star Spots Map (Tier pins)
// lat/lon -> x/y% (equirectangular)
// + Tooltip (hover/click, mobile friendly)
// ==============================
(function () {
  const wrap = document.getElementById("mapWrap");
  const pinsEl = document.getElementById("mapPins");
  const tipEl = document.getElementById("mapTooltip"); // 없으면 자동 생성
  if (!wrap || !pinsEl) return;

  const TIERS = {
    TOP: { label: "TIER 0" },
    A: { label: "TIER 1" },
    B: { label: "TIER 2" },
    C: { label: "TIER 3" },
    ASIA: { label: "아시아" },
    KR: { label: "한국" },
  };

  // lat: +N / -S, lon: +E / -W
  const SPOTS = [
    // ===== TOP TIER =====
    { name: "Atacama Desert (Chile)", tier: "TOP", lat: -24.6, lon: -69.2 },
    { name: "Mauna Kea (Hawaii, USA)", tier: "TOP", lat: 19.82, lon: -155.47 },
    { name: "La Palma (Canary Islands, Spain)", tier: "TOP", lat: 28.76, lon: -17.89 },
    { name: "Namib Desert (Namibia)", tier: "TOP", lat: -23.6, lon: 15.0 },

    // ===== 1군 =====
    { name: "Death Valley (USA)", tier: "A", lat: 36.46, lon: -116.87 },
    { name: "Bryce Canyon (USA)", tier: "A", lat: 37.59, lon: -112.19 },
    { name: "Aoraki / Mt. Cook (NZ)", tier: "A", lat: -43.6, lon: 170.14 },
    { name: "Kalahari Desert (Botswana/Namibia)", tier: "A", lat: -22.0, lon: 21.0 },
    { name: "Lapland (Finland)", tier: "A", lat: 67.0, lon: 26.0 },

    // ===== 2군 =====
    { name: "Uluru (Australia)", tier: "B", lat: -25.34, lon: 131.03 },
    { name: "Joshua Tree NP (USA)", tier: "B", lat: 33.87, lon: -115.90 },
    { name: "Gobi Desert (Mongolia/China)", tier: "B", lat: 42.5, lon: 103.5 },
    { name: "Wadi Rum (Jordan)", tier: "B", lat: 29.57, lon: 35.42 },

    // ===== 3군 =====
    { name: "Scottish Highlands (UK)", tier: "C", lat: 57.2, lon: -5.2 },
    { name: "Alps (Switzerland)", tier: "C", lat: 46.6, lon: 8.0 },
    { name: "Pyrenees (France/Spain)", tier: "C", lat: 42.7, lon: 0.5 },
    { name: "Sicily inland (Italy)", tier: "C", lat: 37.6, lon: 14.0 },
    { name: "Tasmania (Australia)", tier: "C", lat: -42.0, lon: 147.0 },

    // ===== Asia =====
    { name: "Ali, Tibet (China)", tier: "ASIA", lat: 32.5, lon: 80.1 },
    { name: "Ladakh (India)", tier: "ASIA", lat: 34.16, lon: 77.58 },
    { name: "Hokkaido (Japan)", tier: "ASIA", lat: 43.06, lon: 141.35 },
    { name: "Mongolian Steppe (Mongolia)", tier: "ASIA", lat: 47.9, lon: 106.9 },

    // ===== Korea =====
    { name: "Yeongyang Dark Sky Park (KR)", tier: "KR", lat: 36.67, lon: 129.11 },
    { name: "Taebaeksan (KR)", tier: "KR", lat: 37.10, lon: 128.99 },
    { name: "Deogyusan (KR)", tier: "KR", lat: 35.86, lon: 127.75 },
    { name: "Hallasan (Jeju, KR)", tier: "KR", lat: 33.36, lon: 126.53 },
    { name: "Jirisan (KR)", tier: "KR", lat: 35.32, lon: 127.73 },
  ];

  function latLonToXY(lat, lon) {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  }

  // Tooltip element ensure
  let tooltip = document.getElementById("mapTooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "mapTooltip";
    tooltip.className = "map-tooltip";
    wrap.appendChild(tooltip);
  }

  function hideTooltip() {
    tooltip.classList.remove("is-show");
  }

  function showTooltip(pinEl, spot) {
    // 위치: 핀 근처로 (mapWrap 기준)
    const pinRect = pinEl.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();

    const left = pinRect.left - wrapRect.left;
    const top = pinRect.top - wrapRect.top;

    tooltip.innerHTML = `
      <div class="map-tooltip__title">${spot.name}</div>
      <div class="map-tooltip__sub">${TIERS[spot.tier]?.label || spot.tier}</div>
    `;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add("is-show");
  }

  function renderPins(list) {
    pinsEl.innerHTML = "";

    list.forEach((s) => {
      const { x, y } = latLonToXY(s.lat, s.lon);

      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = `pin pin--${s.tier}`;
      pin.style.left = `${x}%`;
      pin.style.top = `${y}%`;
      pin.setAttribute("aria-label", `${s.name} (${TIERS[s.tier]?.label || s.tier})`);

      // Desktop: hover
      pin.addEventListener("mouseenter", () => showTooltip(pin, s));
      pin.addEventListener("mouseleave", () => hideTooltip());

      // Mobile/Touch: tap
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = tooltip.classList.contains("is-show");
        if (isOpen) hideTooltip();
        else showTooltip(pin, s);
      });

      pinsEl.appendChild(pin);
    });
  }

  // close on outside click / scroll
  document.addEventListener("click", () => hideTooltip());
  window.addEventListener("scroll", () => hideTooltip(), { passive: true });

  renderPins(SPOTS);

  // (옵션) 콘솔에 몇 개 찍혔는지
  console.log(`[Map] Pins rendered: ${SPOTS.length}`);
})();

