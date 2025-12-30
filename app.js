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
  const navLinks = Array.from(document.querySelectorAll('.nav__links a, .nav__mobile a'));

  function setActive(id) {
    navLinks.forEach(a => {
      // href가 #id 로 끝나거나 #id 포함하면 active
      const href = a.getAttribute("href") || "";
      const active = href.endsWith(`#${id}`) || href.includes(`#${id}`);
      a.classList.toggle("is-active", active);
    });
  }

  // 초기 active (hash가 있으면 그걸 우선)
  if (location.hash) setActive(location.hash.replace("#", ""));
  else if (sections[0]) setActive(sections[0].id);

  // 스크롤 시 현재 섹션 판단
  const onScroll = () => {
    const y = window.scrollY + 120; // sticky nav 높이 보정
    let current = sections[0]?.id;

    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    if (current) setActive(current);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", () => {
    if (location.hash) setActive(location.hash.replace("#", ""));
  });
  onScroll();
})();
