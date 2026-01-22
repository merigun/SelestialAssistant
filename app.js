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

// ===============================
// World map pins (SVG inside <object>)
// ===============================
(function () {
  const obj = document.getElementById("worldMapObj");
  const tip = document.getElementById("mapTip");
  if (!obj) return;

  const SPOTS = [
    // 🔴 Tier 0
    { tier: "t0", name: "Atacama Desert (Chile)", lat: -23.0, lon: -67.8, note: "세계 최상급 건조·투명도" },
    { tier: "t0", name: "Mauna Kea (Hawaii, USA)", lat: 19.82, lon: -155.47, note: "해발 4,200m급 관측" },
    { tier: "t0", name: "La Palma (Canary, Spain)", lat: 28.76, lon: -17.89, note: "광공해 규제·유럽 성지" },
    { tier: "t0", name: "Namib Desert (Namibia)", lat: -23.0, lon: 15.0, note: "남반구 은하 중심부 최적" },

    // 🟠 Tier 1
    { tier: "t1", name: "Death Valley (USA)", lat: 36.24, lon: -116.82, note: "다크스카이, 접근성↑" },
    { tier: "t1", name: "Bryce Canyon (USA)", lat: 37.59, lon: -112.18, note: "국립공원 다크스카이" },
    { tier: "t1", name: "Aoraki Mackenzie (NZ)", lat: -43.73, lon: 170.10, note: "남반구 대표 다크스카이" },
    { tier: "t1", name: "Kalahari (Botswana/Namibia)", lat: -23.0, lon: 22.0, note: "광공해↓, 건조" },
    { tier: "t1", name: "Lapland (Finland/Norway)", lat: 67.5, lon: 25.7, note: "오로라+관측" },

    // 🟡 Tier 2
    { tier: "t2", name: "Uluru (Australia)", lat: -25.35, lon: 131.03, note: "관광+다크스카이" },
    { tier: "t2", name: "Joshua Tree (USA)", lat: 33.87, lon: -115.90, note: "캠핑 관측 명소" },
    { tier: "t2", name: "Wadi Rum (Jordan)", lat: 29.58, lon: 35.42, note: "사막·관광+관측" },
    { tier: "t2", name: "Gobi Desert (Mongolia/China)", lat: 42.6, lon: 103.0, note: "광활·광공해↓" },
    { tier: "t2", name: "Scottish Highlands (UK)", lat: 57.2, lon: -5.5, note: "유럽 접근성 좋은 다크스카이" },

    // 🔵 Tier 3
    { tier: "t3", name: "Alps (EU)", lat: 46.5, lon: 10.5, note: "고지대·지역 관측" },
    { tier: "t3", name: "Pyrenees (EU)", lat: 42.7, lon: 0.3, note: "산악 지역 관측" },
    { tier: "t3", name: "Sicily Inland (Italy)", lat: 37.6, lon: 14.0, note: "도심탈출형" },
    { tier: "t3", name: "Tasmania (Australia)", lat: -42.0, lon: 147.0, note: "남반구 지역 관측" },
    { tier: "t3", name: "Hokkaido (Japan)", lat: 43.2, lon: 142.9, note: "한국인 공감도↑" },
    { tier: "t3", name: "Ladakh (India)", lat: 34.15, lon: 77.58, note: "고지대 관측" },
    { tier: "t3", name: "Ali, Tibet (China)", lat: 32.5, lon: 80.1, note: "고지대 관측 지역" },

    // 🇰🇷 Korea
    { tier: "t3", name: "Yeongyang Dark Sky Park (KR)", lat: 36.67, lon: 129.11, note: "국내 대표 밤하늘 보호구역" },
    { tier: "t3", name: "Hallasan (Jeju, KR)", lat: 33.36, lon: 126.53, note: "고지대·관측" },
    { tier: "t3", name: "Jirisan (KR)", lat: 35.33, lon: 127.73, note: "산악 관측 포인트" },
    { tier: "t3", name: "Taebaeksan (KR)", lat: 37.12, lon: 128.92, note: "겨울 하늘 시정 좋음" },
  ];

  function showTip(html, x, y) {
    if (!tip) return;
    tip.innerHTML = html;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.classList.add("is-show");
    tip.setAttribute("aria-hidden", "false");
  }
  function hideTip() {
    if (!tip) return;
    tip.classList.remove("is-show");
    tip.setAttribute("aria-hidden", "true");
  }

  function ensureSvgPinStyles(svgDoc) {
    if (svgDoc.getElementById("pinStyles")) return;
    const svg = svgDoc.querySelector("svg");
    if (!svg) return;

    const style = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
    style.setAttribute("id", "pinStyles");
    style.textContent = `
      .pin-dot{ stroke: rgba(255,255,255,0.20); stroke-width: 1; }
      .pin-glow{
        fill: none; stroke-width: 2; opacity: 0.55;
        transform-box: fill-box; transform-origin: center;
        filter: drop-shadow(0 0 10px rgba(120,180,255,0.35));
        animation: pinPulse 1.7s ease-in-out infinite;
      }
      @keyframes pinPulse{
        0%{ transform: scale(0.95); opacity: 0.35; }
        50%{ transform: scale(1.10); opacity: 0.70; }
        100%{ transform: scale(0.95); opacity: 0.35; }
      }
      .pin.t0 .pin-dot{ fill:#ff4d4d; } .pin.t0 .pin-glow{ stroke:#ff4d4d; }
      .pin.t1 .pin-dot{ fill:#ff9f2e; } .pin.t1 .pin-glow{ stroke:#ff9f2e; }
      .pin.t2 .pin-dot{ fill:#ffd84d; } .pin.t2 .pin-glow{ stroke:#ffd84d; }
      .pin.t3 .pin-dot{ fill:#67a8ff; } .pin.t3 .pin-glow{ stroke:#67a8ff; }
      .pin:hover .pin-dot{ stroke: rgba(255,255,255,0.45); stroke-width: 1.2; }
    `;
    svg.insertBefore(style, svg.firstChild);
  }

  obj.addEventListener("load", () => {
    const svgDoc = obj.contentDocument;
    if (!svgDoc) return;

    const svg = svgDoc.querySelector("svg");
    if (!svg) return;

    ensureSvgPinStyles(svgDoc);

    const geo = svg.getAttribute("geoViewBox");
    const vb = (svg.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);

    if (!geo || vb.length !== 4) {
      console.warn("world.svg needs geoViewBox + viewBox.");
      return;
    }

    const [minLon, minLat, maxLon, maxLat] = geo.trim().split(/\s+/).map(Number);
    const W = vb[2];
    const H = vb[3];
    // 핀 크기: SVG 폭(W)에 비례하도록 자동 스케일
    // w_map.svg가 360폭이면 dot≈2.5~3, glow≈8~10 정도가 적당
    const DOT_R  = Math.max(2.4, W * 0.0075);  // 360*0.0075=2.7
    const GLOW_R = Math.max(7.5, W * 0.025);   // 360*0.025=9

    let layer = svgDoc.getElementById("pinLayer");
    if (!layer) {
      layer = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
      layer.setAttribute("id", "pinLayer");
      svg.appendChild(layer);
    } else {
      layer.innerHTML = "";
    }

    function project(lat, lon) {
      const x = ((lon - minLon) / (maxLon - minLon)) * W;
      const y = ((maxLat - lat) / (maxLat - minLat)) * H;
      return { x, y };
    }

    SPOTS.forEach((s) => {
      const { x, y } = project(s.lat, s.lon);
      if (x < 0 || x > W || y < 0 || y > H) return;

      const g = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", `pin ${s.tier}`);
      g.style.cursor = "pointer";

      const glow = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
      glow.setAttribute("class", "pin-glow");
      glow.setAttribute("cx", x);
      glow.setAttribute("cy", y);
      glow.setAttribute("r", GLOW_R);

      const dot = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "pin-dot");
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", DOT_R);

      const title = svgDoc.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `${s.name} — ${s.note || ""}`;

      g.appendChild(title);
      g.appendChild(glow);
      g.appendChild(dot);
      layer.appendChild(g);

      const onEnter = () => {
        const rect = obj.getBoundingClientRect();
        const sx = rect.left + (x / W) * rect.width;
        const sy = rect.top + (y / H) * rect.height;

        showTip(
          `<b>${s.name}</b><br><span style="opacity:.8">${s.note || ""}</span>`,
          (sx - rect.left) + 12,
          (sy - rect.top) + 12
        );
      };

      g.addEventListener("mouseenter", onEnter);
      g.addEventListener("mouseleave", hideTip);
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        onEnter();
      });
    });

    svg.addEventListener("click", hideTip);
  });

  document.addEventListener("click", hideTip);
  window.addEventListener("scroll", hideTip, { passive: true });
})();

// ===============================
// My Star: dialog modals
// ===============================
(function () {
  const openers = Array.from(document.querySelectorAll("[data-open]"));
  if (!openers.length) return;

  function openDialog(id) {
    const dlg = document.getElementById(id);
    if (!dlg) return;

    // native <dialog>
    if (typeof dlg.showModal === "function") {
      dlg.showModal();

      // close when clicking backdrop area
      dlg.addEventListener("click", (e) => {
        const rect = dlg.getBoundingClientRect();
        const inDialog =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (!inDialog) dlg.close();
      }, { once: true });

      return;
    }

    // fallback (rare): just toggle class
    dlg.classList.add("is-open");
  }

  openers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-open");
      if (id) openDialog(id);
    });
  });
})();









