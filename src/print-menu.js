/**
 * All Star Eateries — coded letter print menu (Clover-driven)
 * Visual rebuild to match supplied reference comps.
 */

import { displayName, CATEGORY_TITLES } from "./menu-display.js";

const SIZE_PREFIX = /^(Extra\s+Large|Large|Medium|Small)\s+/i;
const SIZE_SUFFIX = /\s+(Extra\s+Large|Large|Medium|Small)$/i;

const BUSINESS = {
  name: "All Star Eateries",
  location: "Windsor, Ontario",
  address: "4739 Wyandotte St E",
  hoursWeek: "Mon–Sat 9:30 AM – 10 PM",
  hoursSun: "Sun 5:00 PM – 10 PM",
  phone: "(519) 944-5534",
  website: "allstareateries.com",
  logo: "/images/logo.png",
};

const ICONS = {
  pin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11h5v-2h-4V6h-2v7Z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.5.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.9 21 3 13.1 3 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.57 3.5a1 1 0 0 1-.25 1L6.6 10.8Z"/></svg>`,
  cup: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Zm12 1h2.5a2.5 2.5 0 0 1 0 5H16M7 20h8M8 4c.4 1 .4 2 0 3M11 3.5c.4 1 .4 2 0 3M14 4c.4 1 .4 2 0 3"/></svg>`,
  iced: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8 7h8l-1.2 12a2 2 0 0 1-2 1.8h-1.6a2 2 0 0 1-2-1.8L8 7Zm1-3h6M9.5 11h5M9.2 15h5.6"/></svg>`,
  can: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8 6h8v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6Zm1-2h6v2H9V4Z"/></svg>`,
  bottle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M10 2h4v3l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-3V2Zm0 0h4"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 2 4 14h6l-1 8 11-14h-6l-1-6Z"/></svg>`,
  drop: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2s6 7.2 6 12a6 6 0 1 1-12 0c0-4.8 6-12 6-12Z"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18c2.5 2.4 4 5.5 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.5-4-9s1.5-6.6 4-9Zm-8.5 8h17M3.5 14h17"/></svg>`,
  star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2 2.9 6.2L22 9.3l-5 4.8 1.2 7L12 17.8 5.8 21l1.2-7-5-4.8 7.1-1.1L12 2Z"/></svg>`,
  wheat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 21V8M12 8c-2-2-4.5-2.5-6-1 2 2 4.5 2.5 6 1Zm0 0c2-2 4.5-2.5 6-1-2 2-4.5 2.5-6 1Zm0 4c-2-2-4.5-2.5-6-1 2 2 4.5 2.5 6 1Zm0 0c2-2 4.5-2.5 6-1-2 2-4.5 2.5-6 1Z"/></svg>`,
  snow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 3v18M4.5 7.5l15 9M4.5 16.5l15-9M7.5 4.5l9 15M16.5 4.5l-9 15"/></svg>`,
  bean: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M8 6c4-3 10-1 10 5s-6 8-10 5S4 9 8 6Zm1 2c3 3 5 7 5 10"/></svg>`,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeSize(raw) {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Extra Large/i, "Extra Large");
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
  const seen = new Set();

  for (const item of category?.items || []) {
    const key = `${item.id || item.name}|${item.price}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const sized = parseSizedItem(item.name);
    if (!sized?.base) {
      singles.push({ name: item.name, price: item.price });
      continue;
    }
    if (!groups.has(sized.base)) groups.set(sized.base, { name: sized.base, sizes: {} });
    groups.get(sized.base).sizes[sized.size] = item.price;
  }

  const collapsed = [...groups.values()].filter((g) => Object.keys(g.sizes).length >= 2);
  const bases = new Set(collapsed.map((g) => g.name));
  for (const [base, group] of groups.entries()) {
    if (bases.has(base)) continue;
    const size = Object.keys(group.sizes)[0];
    singles.push({ name: `${size} ${base}`.trim(), price: group.sizes[size] });
  }

  collapsed.sort((a, b) => displayName(a.name).localeCompare(displayName(b.name)));
  singles.sort((a, b) => displayName(a.name).localeCompare(displayName(b.name)));
  return { collapsed, singles };
}

function splitColumns(items, count) {
  const cols = Array.from({ length: count }, () => []);
  items.forEach((item, i) => cols[i % count].push(item));
  return cols;
}

function getCat(map, id) {
  return map.get(id) || { id, name: id, items: [] };
}

function icon(name) {
  return `<span class="ico">${ICONS[name] || ""}</span>`;
}

function Badge({ label }) {
  return `<span class="badge">${icon("star")}<span>${escapeHtml(label)}</span></span>`;
}

function CategoryIcon({ name }) {
  return `<span class="ring">${icon(name)}</span>`;
}

function SectionHeading({ eyebrow, title, note, iconName }) {
  return `
    <header class="sec-head">
      ${iconName ? CategoryIcon({ name: iconName }) : ""}
      <div class="sec-head__text">
        ${eyebrow ? `<p class="sec-kicker">${escapeHtml(eyebrow)}</p>` : ""}
        <h2>${escapeHtml(title)}</h2>
        ${note ? `<p class="sec-note">${escapeHtml(note)}</p>` : ""}
        <svg class="wavy" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4c8-4 16 4 24 0s16 4 24 0 16 4 24 0 16 4 24 0 16 4 24 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </header>
  `;
}

function MenuRow({ name, price }) {
  return `
    <li class="row">
      <span class="row__name">${escapeHtml(displayName(name))}</span>
      <span class="row__rule" aria-hidden="true"></span>
      <span class="row__price">${escapeHtml(price || "")}</span>
    </li>
  `;
}

function MenuList(items, { fill = false } = {}) {
  if (!items.length) return "";
  return `<ul class="list${fill ? " list--fill" : ""}">${items.map((item) => MenuRow(item)).join("")}</ul>`;
}

function SizedDrinkRow({ name, sizes }, sizeKeys) {
  const cells = sizeKeys
    .map((key) => `<span class="drink__cell">${sizes[key] ? escapeHtml(sizes[key]) : ""}</span>`)
    .join("");
  return `
    <li class="drink">
      <span class="drink__name">${escapeHtml(displayName(name))}</span>
      <span class="drink__rule" aria-hidden="true"></span>
      ${cells}
    </li>
  `;
}

function SizedDrinkSection({ eyebrow, title, iconName, sizeLabels, sizeKeys, groups }) {
  const heads = sizeLabels
    .map((s) => `<span class="drink__cell drink__cell--head">${escapeHtml(s)}</span>`)
    .join("");
  return `
    <section class="drink-sec">
      ${SectionHeading({ eyebrow, title, iconName })}
      <div class="drink drink--head" aria-hidden="true">
        <span></span><span></span>${heads}
      </div>
      <ul class="drink-list">
        ${groups.map((g) => SizedDrinkRow(g, sizeKeys)).join("")}
      </ul>
    </section>
  `;
}

function PageFooter({ index, total, leftHtml, className = "" }) {
  return `
    <footer class="band ${className}">
      ${leftHtml || `<span class="band__mark">${icon("star")}<em>All Star</em></span>`}
      <span class="band__site">${icon("globe")}${escapeHtml(BUSINESS.website.toUpperCase())}</span>
      <span class="band__page">${index + 1} / ${total}${index === 1 ? ` ${icon("star")}` : ""}</span>
    </footer>
  `;
}

function renderPage1(map, index, total) {
  const african = collapseCategory(getCat(map, "african-cuisine")).singles;
  const american = collapseCategory(getCat(map, "american-cuisine")).singles;
  const bakery = collapseCategory(getCat(map, "bakery")).singles;
  const bakeryCols = splitColumns(bakery, 3);

  return `
    <article class="menu-page menu-page--food">
      <div class="paper-grain" aria-hidden="true"></div>
      <div class="motif motif--geo" aria-hidden="true"></div>

      <header class="hdr hdr--food">
        <div class="hdr__corner">
          <img class="hdr__logo" src="${escapeHtml(BUSINESS.logo)}" alt="" width="92" height="92" />
        </div>
        <div class="hdr__brand">
          <p class="hdr__place">${icon("star")}<span>${escapeHtml(BUSINESS.location)}</span>${icon("star")}</p>
          <h1>${escapeHtml(BUSINESS.name)}</h1>
          <p class="hdr__tag">African Cuisine <i>·</i> Bakery <i>·</i> Coffee</p>
        </div>
        <div class="hdr__meta">
          <p>${icon("pin")}<span>${escapeHtml(BUSINESS.address)}</span></p>
          <p>${icon("clock")}<span>${escapeHtml(BUSINESS.hoursWeek)}</span></p>
          <p class="hdr__meta-sub">${escapeHtml(BUSINESS.hoursSun)}</p>
          <p class="hdr__phone">${icon("phone")}<strong>${escapeHtml(BUSINESS.phone)}</strong></p>
        </div>
      </header>

      <div class="food-grid">
        <section class="panel panel--african">
          ${Badge({ label: "House Specialty" })}
          <h2>${CATEGORY_TITLES["african-cuisine"]}</h2>
          <p class="lede">Traditional soups, rice plates and comforting favourites — the heart of our kitchen.</p>
          <svg class="wavy" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4c8-4 16 4 24 0s16 4 24 0 16 4 24 0 16 4 24 0 16 4 24 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          ${MenuList(african, { fill: true })}
        </section>

        <aside class="food-rail">
          <figure class="hero hero--jollof">
            <div class="hero__frame">
              <img src="/images/menu/jollof-rice-plate.png" alt="Signature jollof plate" />
            </div>
            <figcaption><span class="brush-cap">Signature jollof plate</span></figcaption>
          </figure>
          <section class="panel panel--american">
            ${Badge({ label: "Classics" })}
            <h2>${CATEGORY_TITLES["american-cuisine"]}</h2>
            ${MenuList(american, { fill: true })}
          </section>
        </aside>
      </div>

      <section class="bakery">
        <figure class="hero hero--pastry">
          <img src="/images/menu/apple-fritter.png" alt="Fresh apple fritter" />
          <div class="stamp stamp--bake">
            <span>Baked with Care</span>
            ${icon("wheat")}
          </div>
        </figure>
        <div class="bakery__body">
          <p class="sec-kicker">Pastry Case</p>
          <h2>${CATEGORY_TITLES.bakery}</h2>
          <p class="script-line">Baked fresh daily</p>
          <div class="bakery__cols">
            ${bakeryCols
              .map((col) => `<div class="bakery__col">${MenuList(col)}</div>`)
              .join("")}
          </div>
        </div>
      </section>

      ${PageFooter({
        index,
        total,
        leftHtml: `<span class="band__mark">${icon("star")}<em>All Star</em></span>`,
      })}
    </article>
  `;
}

function renderPage2(map, index, total) {
  const hot = collapseCategory(getCat(map, "hot-beverages")).collapsed;
  const iced = collapseCategory(getCat(map, "flavored-ice-latte")).collapsed;

  return `
    <article class="menu-page menu-page--coffee">
      <div class="paper-grain" aria-hidden="true"></div>
      <p class="spine" aria-hidden="true">Specialty Café Bar</p>
      <div class="motif motif--leaf" aria-hidden="true"></div>

      <header class="hdr hdr--coffee">
        <div class="hdr__corner hdr__corner--angle">
          <img class="hdr__logo" src="${escapeHtml(BUSINESS.logo)}" alt="" width="84" height="84" />
        </div>
        <div class="hdr__brand hdr__brand--coffee">
          <p class="hdr__eyebrow">All Star Eateries</p>
          <h1>Coffee &amp; Lattes</h1>
          <p class="hdr__tag">Specialty Café Bar <i>·</i> Flavoured Iced Drinks</p>
          <span class="hdr__star">${icon("star")}</span>
        </div>
        <div class="hdr__right">
          <p class="hdr__phone">${icon("phone")}<strong>${escapeHtml(BUSINESS.phone)}</strong></p>
          <div class="seal">
            ${icon("bean")}
            <span>Premium Coffee<br />Brewed Fresh</span>
          </div>
        </div>
      </header>

      <div class="coffee-grid">
        <div class="coffee-main">
          ${SizedDrinkSection({
            eyebrow: "Espresso Bar",
            title: CATEGORY_TITLES["hot-beverages"],
            iconName: "cup",
            sizeLabels: ["S", "M", "L"],
            sizeKeys: ["Small", "Medium", "Large"],
            groups: hot,
          })}
          <div class="sec-rule" aria-hidden="true"></div>
          ${SizedDrinkSection({
            eyebrow: "Iced Favourites",
            title: CATEGORY_TITLES["flavored-ice-latte"],
            iconName: "iced",
            sizeLabels: ["S", "L", "XL"],
            sizeKeys: ["Small", "Large", "Extra Large"],
            groups: iced,
          })}
        </div>
        <aside class="coffee-photo">
          <div class="coffee-photo__well">
            <img src="/images/menu/cafe-mocha.png" alt="Specialty coffee drink" />
            <div class="coffee-photo__cap">
              ${icon("star")}
              <strong>Brewed</strong>
              <span>To Order</span>
            </div>
          </div>
        </aside>
      </div>

      ${PageFooter({
        index,
        total,
        leftHtml: `<span class="band__care"><em>Brewed with care.</em><small>Served with pride.</small></span>`,
      })}
    </article>
  `;
}

function ColdColumn({ eyebrow, title, iconName, items }) {
  return `
    <section class="cold-col">
      ${CategoryIcon({ name: iconName })}
      <p class="sec-kicker">· ${escapeHtml(eyebrow)} ·</p>
      <h2>${escapeHtml(title)}</h2>
      <svg class="wavy" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4c8-4 16 4 24 0s16 4 24 0 16 4 24 0 16 4 24 0 16 4 24 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      ${MenuList(items, { fill: true })}
    </section>
  `;
}

function renderPage3(map, index, total) {
  const cans = collapseCategory(getCat(map, "pops-can")).singles;
  const bottles = collapseCategory(getCat(map, "pops-bottle")).singles;
  const energy = collapseCategory(getCat(map, "energy-drinks")).singles;
  const water = collapseCategory(getCat(map, "bottled-water")).singles;

  return `
    <article class="menu-page menu-page--cold">
      <div class="paper-grain" aria-hidden="true"></div>

      <header class="hdr hdr--cold">
        <div class="hdr__lock">
          <img class="hdr__logo hdr__logo--sm" src="${escapeHtml(BUSINESS.logo)}" alt="" width="58" height="58" />
          <div>
            <strong>${escapeHtml(BUSINESS.name)}</strong>
            <p class="hdr__tag hdr__tag--sm">African Cuisine · Bakery · Coffee</p>
          </div>
        </div>
        <div class="hdr__divider" aria-hidden="true"></div>
        <div class="hdr__title">
          <p class="hdr__place">${icon("star")}</p>
          <h1>Cold Drinks</h1>
          <p class="hdr__tag">Chilled Pops · Energy · Bottled Water</p>
        </div>
        <div class="hdr__meta">
          <p>${icon("phone")}<strong>${escapeHtml(BUSINESS.phone)}</strong></p>
          <p>${icon("pin")}<span>${escapeHtml(BUSINESS.address)}</span></p>
          <p>${icon("clock")}<span>${escapeHtml(BUSINESS.hoursWeek)}</span></p>
          <p class="hdr__meta-sub">${escapeHtml(BUSINESS.hoursSun)}</p>
        </div>
      </header>

      <div class="cold-grid">
        ${ColdColumn({
          eyebrow: "Cans",
          title: CATEGORY_TITLES["pops-can"],
          iconName: "can",
          items: cans,
        })}
        ${ColdColumn({
          eyebrow: "Bottles",
          title: CATEGORY_TITLES["pops-bottle"],
          iconName: "bottle",
          items: bottles,
        })}
        ${ColdColumn({
          eyebrow: "Boost",
          title: CATEGORY_TITLES["energy-drinks"],
          iconName: "bolt",
          items: energy,
        })}
        <aside class="cold-rail">
          <figure class="hero hero--chip">
            <img src="/images/menu/pepsi-can.png" alt="" />
            <div class="stamp stamp--ice">
              <span>Ice Cold Always</span>
              ${icon("snow")}
            </div>
          </figure>
          <section class="cold-col cold-col--water">
            ${CategoryIcon({ name: "drop" })}
            <p class="sec-kicker">· Hydration ·</p>
            <h2>${CATEGORY_TITLES["bottled-water"]}</h2>
            <svg class="wavy" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4c8-4 16 4 24 0s16 4 24 0 16 4 24 0 16 4 24 0 16 4 24 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
            ${MenuList(water, { fill: true })}
          </section>
        </aside>
      </div>

      <aside class="order">
        <div class="order__art" aria-hidden="true"></div>
        <div class="order__left">
          <span class="ring ring--gold">${icon("bag")}</span>
          <div>
            <p class="sec-kicker sec-kicker--light">Order Online</p>
            <h2>Pickup ready</h2>
            <p>${escapeHtml(BUSINESS.address)}</p>
            <p>${escapeHtml(BUSINESS.phone)}</p>
            <p class="order__url">${escapeHtml(BUSINESS.website)}</p>
          </div>
        </div>
        <div class="order__split" aria-hidden="true"></div>
        <div class="order__right">
          <img class="order__qr" src="/images/order-qr.png" alt="Scan to order online" width="128" height="128" />
          <div class="order__cta">
            <p class="order__script">Scan to order online</p>
            <p class="order__fast">Fast &amp; Easy <span class="order__arrow">←</span></p>
          </div>
        </div>
      </aside>

      <footer class="band band--slim">
        <span class="band__mark">${icon("star")}<span>All Star</span></span>
        <span class="band__site">${escapeHtml(BUSINESS.website.toUpperCase())}</span>
        <span class="band__page">${index + 1} / ${total}<i class="dots" aria-hidden="true"></i></span>
      </footer>
    </article>
  `;
}

async function main() {
  const root = document.getElementById("print-menu-root");
  if (!root) return;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}menu-data.json`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Failed to load menu (${response.status})`);
    const menuData = await response.json();
    const map = new Map(menuData.categories.map((c) => [c.id, c]));

    root.innerHTML = [
      renderPage1(map, 0, 3),
      renderPage2(map, 1, 3),
      renderPage3(map, 2, 3),
    ].join("");
    document.getElementById("print-menu-status")?.remove();
  } catch (error) {
    root.innerHTML = `<p class="print-error">Could not load the menu from Clover. ${escapeHtml(error.message)}</p>`;
  }
}

document.getElementById("print-btn")?.addEventListener("click", () => window.print());
main();
