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
    kicker: "Comfort plates · soups · fresh bakery",
    tone: "food",
    layout: "split",
    categories: ["foods", "bakery"],
  },
  {
    title: "Hot & Iced",
    kicker: "Coffee, chocolate & flavoured lattes",
    tone: "coffee",
    layout: "stack",
    categories: ["hot-beverages", "flavored-ice-latte"],
  },
  {
    title: "Cold Drinks",
    kicker: "Pops · energy · bottled water",
    tone: "chill",
    layout: "tiles",
    categories: ["pops-can", "pops-bottle", "energy-drinks", "bottled-water"],
  },
];

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
  return cleaned.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/Extra Large/i, "Extra Large");
}

function parseSizedItem(name) {
  const prefix = name.match(SIZE_PREFIX);
  if (prefix) {
    return { size: normalizeSize(prefix[1]), base: name.slice(prefix[0].length).trim() };
  }
  const suffix = name.match(SIZE_SUFFIX);
  if (suffix) {
    return { size: normalizeSize(suffix[1]), base: name.slice(0, -suffix[0].length).trim() };
  }
  return null;
}

function collapseCategory(category) {
  const groups = new Map();
  const singles = [];

  for (const item of category.items) {
    const sized = parseSizedItem(item.name);
    if (!sized?.base) {
      singles.push({ name: item.name, price: item.price, description: item.description });
      continue;
    }
    if (!groups.has(sized.base)) {
      groups.set(sized.base, { name: sized.base, description: item.description, sizes: {} });
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

function shortName(name) {
  return name
    .replace(/,\s*Fried Plantain,\s*Salad\s*&\s*/gi, " · ")
    .replace(/\s*&\s*Swallow/gi, " & swallow")
    .replace(/Crispy Chicken Tender With Cheesy Wedges/gi, "Chicken Tender & Cheesy Wedges")
    .replace(/Coffee \(original\/dark roast\)/gi, "Coffee (original / dark)")
    .replace(/Canadab Dry/gi, "Canada Dry")
    .replace(/Cappucinno/gi, "Cappuccino")
    .replace(/Expresso Style/gi, "Espresso Style")
    .replace(/Bottle water/gi, "Bottled Water");
}

function renderItemRow(item) {
  return `
    <li class="pm-item">
      <span class="pm-item__name">${escapeHtml(shortName(item.name))}</span>
      <span class="pm-item__lead" aria-hidden="true"></span>
      <span class="pm-item__price">${item.price ? escapeHtml(item.price) : ""}</span>
    </li>
  `;
}

function renderMatrix(groups, usedSizes) {
  if (!groups.length) return "";
  const head = usedSizes.map((size) => `<th>${escapeHtml(size.replace("Extra Large", "XL"))}</th>`).join("");
  const body = groups
    .map((group) => {
      const cells = usedSizes
        .map((size) => `<td>${group.sizes[size] ? escapeHtml(group.sizes[size]) : "—"}</td>`)
        .join("");
      return `<tr><th scope="row">${escapeHtml(shortName(group.name))}</th>${cells}</tr>`;
    })
    .join("");

  return `
    <table class="pm-matrix">
      <thead><tr><th scope="col"></th>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderPanel(category) {
  const { collapsed, singles, usedSizes } = collapseCategory(category);
  return `
    <section class="pm-panel">
      <header class="pm-panel__head">
        <h2>${escapeHtml(category.name)}</h2>
        <div class="pm-panel__ornament" aria-hidden="true">★</div>
      </header>
      ${renderMatrix(collapsed, usedSizes)}
      ${singles.length ? `<ul class="pm-list">${singles.map(renderItemRow).join("")}</ul>` : ""}
    </section>
  `;
}

function renderPage(page, index, total, categoriesById, updatedAt) {
  const panels = page.categories
    .map((id) => categoriesById.get(id))
    .filter(Boolean)
    .map(renderPanel)
    .join("");

  const dateLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })
    : "";

  const gallery =
    page.layout === "split"
      ? `
      <div class="pm-gallery" aria-hidden="true">
        <img src="/images/menu/jollof-rice-plate.png" alt="" />
        <img src="/images/menu/egusi-fufu.png" alt="" />
        <img src="/images/menu/maple-bacon-donut.png" alt="" />
        <img src="/images/menu/caramel-iced-latte.png" alt="" />
      </div>`
      : page.layout === "stack"
        ? `
      <div class="pm-gallery pm-gallery--narrow" aria-hidden="true">
        <img src="/images/menu/cafe-mocha.png" alt="" />
        <img src="/images/menu/vanilla-iced-latte.png" alt="" />
        <img src="/images/menu/hot-chocolate.png" alt="" />
      </div>`
        : `
      <div class="pm-gallery pm-gallery--narrow" aria-hidden="true">
        <img src="/images/menu/pepsi-can.png" alt="" />
        <img src="/images/menu/monster.png" alt="" />
        <img src="/images/menu/fiji-water.png" alt="" />
      </div>`;

  return `
    <article class="pm-page pm-page--${escapeHtml(page.tone)} pm-page--${escapeHtml(page.layout)}">
      <div class="pm-page__border" aria-hidden="true"></div>

      <header class="pm-masthead">
        <div class="pm-masthead__brand">
          <img src="/images/logo.png" alt="" class="pm-masthead__logo" />
          <div>
            <p class="pm-masthead__eyebrow">All Star Eateries · Windsor, Ontario</p>
            <h1>${escapeHtml(page.title)}</h1>
            <p class="pm-masthead__kicker">${escapeHtml(page.kicker)}</p>
          </div>
        </div>
        <div class="pm-masthead__visit">
          <p><strong>4739 Wyandotte St E</strong></p>
          <p>Mon–Sat 9:30 AM – 10 PM</p>
          <p>Sun 5:00 PM – 10 PM</p>
          <p class="pm-masthead__phone">(519) 944-5534</p>
        </div>
      </header>

      ${gallery}
      <div class="pm-page__content">${panels}</div>

      <footer class="pm-foot">
        <span>allstareateries.com · Order online for pickup</span>
        <span>Page ${index + 1} / ${total}${dateLabel ? ` · ${dateLabel}` : ""}</span>
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
      title: "More Menu",
      kicker: "From the kitchen",
      tone: "food",
      layout: "stack",
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
