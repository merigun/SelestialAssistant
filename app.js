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
  });
})();
