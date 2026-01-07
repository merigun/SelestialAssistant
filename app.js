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

// ===== Map tooltip for pins =====
(function () {
  const tip = document.getElementById("mapTip");
  const pins = document.querySelectorAll(".pin");
  if (!tip || !pins.length) return;

  function showTip(el, clientX, clientY) {
    const name = el.getAttribute("data-name") || "";
    tip.textContent = name;
    tip.classList.add("is-on");
    tip.setAttribute("aria-hidden", "false");

    const wrap = el.parentElement.getBoundingClientRect();
    // 툴팁 위치: 커서 기준
    const x = clientX - wrap.left + 12;
    const y = clientY - wrap.top + 12;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  }

  function hideTip() {
    tip.classList.remove("is-on");
    tip.setAttribute("aria-hidden", "true");
  }

  pins.forEach(p => {
    p.addEventListener("mouseenter", (e) => showTip(p, e.clientX, e.clientY));
    p.addEventListener("mousemove", (e) => showTip(p, e.clientX, e.clientY));
    p.addEventListener("mouseleave", hideTip);

    // 모바일: 탭하면 보이게(한번 더 탭하면 닫기)
    p.addEventListener("click", (e) => {
      e.preventDefault();
      const on = tip.classList.contains("is-on");
      if (on) hideTip();
      else showTip(p, e.clientX || 0, e.clientY || 0);
    });
  });

  // 바깥 클릭하면 닫기(모바일)
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("pin")) hideTip();
  });
})();

