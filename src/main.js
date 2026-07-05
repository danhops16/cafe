const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".nav-toggle");
const header = document.getElementById("site-header");
const year = document.getElementById("year");

const orderUrl = import.meta.env.VITE_CLOVER_ORDERING_URL?.trim();

if (year) {
  year.textContent = String(new Date().getFullYear());
}

function setupOrderLinks() {
  const links = document.querySelectorAll("[data-order-online]");

  if (!orderUrl) {
    links.forEach((link) => {
      const listItem = link.closest("li");
      if (listItem) {
        listItem.remove();
      } else {
        link.remove();
      }
    });
    return;
  }

  links.forEach((link) => {
    link.href = orderUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function setNavOpen(open) {
  if (!nav || !toggle) return;
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

function setupHeaderScroll() {
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupMenuTabs() {
  const tabs = document.querySelectorAll(".menu-tab");
  const sections = document.querySelectorAll(".menu-category");

  if (!tabs.length || !sections.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tabs.forEach((tab) => {
          tab.classList.toggle("is-active", tab.getAttribute("href") === `#${id}`);
        });
      });
    },
    {
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

setupOrderLinks();
setupHeaderScroll();
setupMenuTabs();

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    setNavOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 821px)").matches) {
      setNavOpen(false);
    }
  });
}
