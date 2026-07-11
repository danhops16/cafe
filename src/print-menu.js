const SIZE_ORDER = ["Small", "Medium", "Large", "Extra Large"];
const SIZE_ALIASES = {
  xl: "Extra Large",
  "extra-large": "Extra Large",
  "x-large": "Extra Large",
  sm: "Small",
  md: "Medium",
  med: "Medium",
  lg: "Large",
};

const SIZE_PREFIX = /^(Extra\s+Large|Large|Medium|Small)\s+/i;
const SIZE_SUFFIX = /\s+(Extra\s+Large|Large|Medium|Small)$/i;

const PAGE_PLAN = [
  {
    title: "Food & Bakery",
    kicker: "Plates, soups & sweets",
    tone: "food",
    categories: ["foods", "bakery"],
  },
  {
    title: "Hot & Iced Drinks",
    kicker: "Brewed fresh to order",
    tone: "coffee",
    categories: ["hot-beverages", "flavored-ice-latte"],
  },
  {
    title: "Cold Drinks",
    kicker: "Cans, bottles & chillers",
    tone: "chill",
    categories: ["pops-can", "pops-bottle", "energy-drinks", "bottled-water"],
  },
];

const CATEGORY_MARKS = {
  foods: "Foods",
  bakery: "Bakery",
  "hot-beverages": "Hot",
  "flavored-ice-latte": "Iced",
  "pops-can": "Cans",
  "pops-bottle": "Bottles",
  "energy-drinks": "Energy",
  "bottled-water": "Water",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeSize(raw) {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  const key = cleaned.toLowerCase().replace(/\s+/g, "-");
  if (SIZE_ALIASES[key]) return SIZE_ALIASES[key];

  const titled = cleaned.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return titled.replace(/Extra Large/i, "Extra Large");
}

function parseSizedItem(name) {
  const prefix = name.match(SIZE_PREFIX);
  if (prefix) {
    return {
      size: normalizeSize(prefix[1]),
      base: name.slice(prefix[0].length).trim(),
    };
  }

  const suffix = name.match(SIZE_SUFFIX);
  if (suffix) {
    return {
      size: normalizeSize(suffix[1]),
      base: name.slice(0, -suffix[0].length).trim(),
    };
  }

  return null;
}

function collapseCategory(category) {
  const groups = new Map();
  const singles = [];

  for (const item of category.items) {
    const sized = parseSizedItem(item.name);
    if (!sized || !sized.base) {
      singles.push({
        name: item.name,
        price: item.price,
        description: item.description,
      });
      continue;
    }

    if (!groups.has(sized.base)) {
      groups.set(sized.base, {
        name: sized.base,
        description: item.description,
        sizes: {},
      });
    }

    groups.get(sized.base).sizes[sized.size] = item.price;
  }

  const collapsed = [...groups.values()].filter((group) => Object.keys(group.sizes).length >= 2);
  const collapsedBases = new Set(collapsed.map((group) => group.name));

  for (const [base, group] of groups.entries()) {
    if (collapsedBases.has(base)) continue;
    const size = Object.keys(group.sizes)[0];
    singles.push({
      name: `${size} ${base}`.trim(),
      price: group.sizes[size],
      description: group.description,
    });
  }

  collapsed.sort((a, b) => a.name.localeCompare(b.name));
  singles.sort((a, b) => a.name.localeCompare(b.name));

  const usedSizes = SIZE_ORDER.filter((size) => collapsed.some((group) => group.sizes[size]));

  return { collapsed, singles, usedSizes };
}

function renderItemRow(item) {
  return `
    <div class="print-row">
      <div class="print-row__name">
        <span>${escapeHtml(item.name)}</span>
        ${item.description ? `<small>${escapeHtml(item.description)}</small>` : ""}
      </div>
      <span class="print-row__dots" aria-hidden="true"></span>
      <div class="print-row__price">${item.price ? escapeHtml(item.price) : ""}</div>
    </div>
  `;
}

function renderMatrix(groups, usedSizes) {
  if (!groups.length) return "";

  const head = usedSizes.map((size) => `<th>${escapeHtml(size)}</th>`).join("");
  const body = groups
    .map((group) => {
      const cells = usedSizes
        .map((size) => {
          const price = group.sizes[size];
          return `<td>${price ? escapeHtml(price) : "<span class=\"print-price-empty\">—</span>"}</td>`;
        })
        .join("");
      return `
        <tr>
          <th scope="row">
            ${escapeHtml(group.name)}
            ${group.description ? `<small>${escapeHtml(group.description)}</small>` : ""}
          </th>
          ${cells}
        </tr>
      `;
    })
    .join("");

  return `
    <table class="print-matrix">
      <thead>
        <tr>
          <th scope="col">Drink</th>
          ${head}
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderCategory(category) {
  const { collapsed, singles, usedSizes } = collapseCategory(category);
  const compact = ["foods", "bakery", "pops-can", "pops-bottle", "energy-drinks", "bottled-water"].includes(
    category.id
  );
  const mark = CATEGORY_MARKS[category.id] || category.name.slice(0, 6);

  return `
    <section class="print-category ${compact ? "print-category--compact" : ""}">
      <div class="print-category__head">
        <span class="print-category__mark">${escapeHtml(mark)}</span>
        <h2>${escapeHtml(category.name)}</h2>
        <span class="print-category__rule" aria-hidden="true"></span>
      </div>
      ${renderMatrix(collapsed, usedSizes)}
      ${
        singles.length
          ? `<div class="print-list ${compact ? "print-list--grid" : ""}">${singles.map(renderItemRow).join("")}</div>`
          : ""
      }
    </section>
  `;
}

function renderPage(page, index, total, categoriesById, updatedAt) {
  const sections = page.categories
    .map((id) => categoriesById.get(id))
    .filter(Boolean)
    .map(renderCategory)
    .join("");

  const dateLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return `
    <article class="print-page print-page--${escapeHtml(page.tone || "food")}" style="--page-i: ${index}">
      <div class="print-page__frame" aria-hidden="true"></div>
      <header class="print-page__header">
        <div class="print-page__brand">
          <div class="print-page__logo-wrap">
            <img src="/images/logo.png" alt="All Star Eateries" class="print-page__logo" />
          </div>
          <div>
            <p class="print-page__eyebrow">All Star Eateries · Windsor</p>
            <h1>${escapeHtml(page.title)}</h1>
            <p class="print-page__kicker">${escapeHtml(page.kicker || "")}</p>
          </div>
        </div>
        <div class="print-page__meta">
          <p class="print-page__meta-label">Visit</p>
          <p>4739 Wyandotte St E</p>
          <p>Mon–Sat 9:30 AM–10 PM</p>
          <p>Sun 5:00 PM–10:00 PM</p>
          <p class="print-page__phone">(519) 944-5534</p>
        </div>
      </header>
      <div class="print-page__body">${sections}</div>
      <footer class="print-page__footer">
        <span class="print-page__footer-brand">allstareateries.com · Order online for pickup</span>
        <span>Page ${index + 1} of ${total}${dateLabel ? ` · Menu as of ${dateLabel}` : ""}</span>
      </footer>
    </article>
  `;
}

function buildPages(menuData) {
  const categoriesById = new Map(menuData.categories.map((category) => [category.id, category]));
  const planned = PAGE_PLAN.map((page) => ({
    ...page,
    categories: page.categories.filter((id) => categoriesById.has(id)),
  })).filter((page) => page.categories.length);

  const used = new Set(planned.flatMap((page) => page.categories));
  const leftover = menuData.categories.filter((category) => !used.has(category.id)).map((c) => c.id);
  if (leftover.length) {
    planned.push({
      title: "More from the Menu",
      kicker: "Fresh from the POS",
      tone: "food",
      categories: leftover,
    });
  }

  return planned;
}

async function main() {
  const root = document.getElementById("print-menu-root");
  if (!root) return;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}menu-data.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load menu (${response.status})`);
    const menuData = await response.json();
    const pages = buildPages(menuData);
    const categoriesById = new Map(menuData.categories.map((category) => [category.id, category]));

    root.innerHTML = pages
      .map((page, index) => renderPage(page, index, pages.length, categoriesById, menuData.updatedAt))
      .join("");

    document.getElementById("print-menu-status")?.remove();
  } catch (error) {
    root.innerHTML = `<p class="print-error">Could not load the menu. ${escapeHtml(error.message)}</p>`;
  }
}

document.getElementById("print-btn")?.addEventListener("click", () => window.print());
main();
