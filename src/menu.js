import { setupOrderLinks, setupHeaderScroll, setupNavToggle, setupMenuTabs } from "./site.js";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderMenuItem(item) {
  const description = item.description
    ? `<p>${escapeHtml(item.description)}</p>`
    : "";
  const price = item.price ? `<span class="menu-item__price">${escapeHtml(item.price)}</span>` : "";
  const thumb = item.image
    ? `<div class="menu-item__thumb"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" /></div>`
    : "";

  return `
    <article class="menu-item${thumb ? "" : " menu-item--text-only"}">
      ${thumb}
      <div class="menu-item__content">
        <div><h3>${escapeHtml(item.name)}</h3>${description}</div>
        ${price}
      </div>
    </article>
  `;
}

function renderMenu(data) {
  const tabsContainer = document.getElementById("menu-tabs-inner");
  const sectionsContainer = document.getElementById("menu-sections");

  if (!tabsContainer || !sectionsContainer || !data?.categories?.length) return false;

  tabsContainer.innerHTML = data.categories
    .map(
      (category, index) =>
        `<a class="menu-tab${index === 0 ? " is-active" : ""}" href="#${escapeHtml(category.id)}">${escapeHtml(category.name)}</a>`
    )
    .join("");

  sectionsContainer.innerHTML = data.categories
    .map(
      (category, index) => `
        <section id="${escapeHtml(category.id)}" class="menu-category${index % 2 === 0 ? " section--alt" : ""}">
          <div class="inner">
            <div class="section-head">
              <h2>${escapeHtml(category.name)}</h2>
            </div>
            <div class="menu-items">
              ${category.items.map(renderMenuItem).join("")}
            </div>
          </div>
        </section>
      `
    )
    .join("");

  return true;
}

async function loadPosMenu() {
  const sectionsContainer = document.getElementById("menu-sections");
  if (!sectionsContainer) return;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}menu-data.json`, { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    if (data.source !== "clover" || !renderMenu(data)) return;
  } catch {
    // Keep the static fallback menu when POS data is unavailable.
  } finally {
    setupMenuTabs();
  }
}

setupOrderLinks();
setupHeaderScroll();
setupNavToggle();
loadPosMenu();
