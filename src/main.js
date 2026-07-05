const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".nav-toggle");
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

setupOrderLinks();

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    setNavOpen(open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 721px)").matches) {
      setNavOpen(false);
    }
  });
}
