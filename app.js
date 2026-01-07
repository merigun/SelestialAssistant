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
  navMobile.querySelectorAll("a").forEach(a => {
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
  const navLinks = Array.from(document.querySelectorAll('[data-spy]'));

  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(a => {
      const href = a.getAttribute("href") || "";
      const active = href.endsWith(`#${id}`) || href.includes(`#${id}`);
      a.classList.toggle("is-active", active);
    });
  }

  // 초기 active (hash 우선)
  if (location.hash) setActive(location.hash.replace("#", ""));
  else setActive(sections[0].id);

  const onScroll = () => {
    const y = window.scrollY + 120; // nav 높이 보정
    let current = sections[0].id;

    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    setActive(current);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", () => {
    if (location.hash) setActive(location.hash.replace("#", ""));
  });

  onScroll();
})();

// ===== Map pins (world.svg) =====
(function () {
  const pinsLayer = document.getElementById("mapPins"); // 핀 꽂을 div
  if (!pinsLayer) return;

  // 퍼센트 좌표(0~100). world.svg에 맞춰 네가 조금씩 튜닝하면 됨.
  // name은 나중에 tooltip/리스트 연결할 때 쓰기 좋음.
  const SPOTS = [
    { name: "Atacama", x: 28.3, y: 78.0 },
    { name: "Mauna Kea", x: 17.5, y: 46.0 },
    { name: "La Palma", x: 48.2, y: 44.0 },
    { name: "Namib", x: 52.5, y: 77.0 },
  ];

  // 기존 핀 초기화
  pinsLayer.innerHTML = "";

  // 핀 생성
  SPOTS.forEach(s => {
    const pin = document.createElement("span");
    pin.className = "pin";
    pin.style.left = `${s.x}%`;
    pin.style.top = `${s.y}%`;
    pin.setAttribute("aria-label", s.name);
    pinsLayer.appendChild(pin);
    pin.title = `${s.name} (${tierLabel})`;
  });
})();
// ==============================
// Star Spots Map (Tier pins)
// lat/lon -> x/y% (equirectangular)
// ==============================
(function () {
  const wrap = document.getElementById("mapWrap");
  const pinsEl = document.getElementById("mapPins");
  if (!wrap || !pinsEl) return;

  // Tier style key
  const TIERS = {
    TOP: { label: "TOP TIER" },
    A: { label: "1군" },
    B: { label: "2군" },
    C: { label: "3군" },
    ASIA: { label: "아시아" },
    KR: { label: "한국" },
  };

  // lat: +N / -S, lon: +E / -W
  // ※ 좌표는 "대표 지점" 기준의 대략값(발표용/시각화용)
  //   필요하면 너가 원하는 정확 포인트로 later refine 가능.
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

    // ===== 2군 (관측+관광) =====
    { name: "Uluru (Australia)", tier: "B", lat: -25.34, lon: 131.03 },
    { name: "Joshua Tree NP (USA)", tier: "B", lat: 33.87, lon: -115.90 },
    // 너가 예전에 적어둔 '몬우누아 케아'는 Mauna Kea로 통일하는게 맞음(중복 방지)
    { name: "Gobi Desert (Mongolia/China)", tier: "B", lat: 42.5, lon: 103.5 },
    { name: "Wadi Rum (Jordan)", tier: "B", lat: 29.57, lon: 35.42 },

    // ===== 3군 (접근성 우수) =====
    { name: "Scottish Highlands (UK)", tier: "C", lat: 57.2, lon: -5.2 },
    { name: "Alps (Switzerland)", tier: "C", lat: 46.6, lon: 8.0 },
    { name: "Pyrenees (France/Spain)", tier: "C", lat: 42.7, lon: 0.5 },
    { name: "Sicily inland (Italy)", tier: "C", lat: 37.6, lon: 14.0 },
    { name: "Tasmania (Australia)", tier: "C", lat: -42.0, lon: 147.0 },

    // ===== Asia (발표 공감용) =====
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
      pin.title = `${s.name}\n${TIERS[s.tier]?.label || s.tier}`;

      pinsEl.appendChild(pin);
    });
  }

  renderPins(SPOTS);


