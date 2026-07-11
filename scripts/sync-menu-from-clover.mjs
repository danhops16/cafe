import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const menuImagesDir = resolve(root, "public/images/menu");
const outputPath = resolve(root, "public/menu-data.json");
const envPath = resolve(root, ".env");

function loadEnv() {
  if (!existsSync(envPath)) return {};

  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const IMAGE_ALIASES = {
  "cookies-and-cream": "cookies-cream-donut",
  "crispy-chicken-tender-and-cheesy-wedges": "chicken-tender-combo",
  "french-fries-and-ketchup": "fries",
  "pops-assorted-flavors": "pops",
  "latte-cappuccino": "latte-cappuccino",
  "coffee-espresso-style": "coffee-espresso",
  "cafe-mocha-mochaccino": "cafe-mocha",
  "hot-chocolate-hot-milk-chocolate": "hot-chocolate",
  "jollof-rice-plantains-salad-and-chicken": "jollof-rice-plate",
  "fried-rice-plantains-salad-and-chicken": "fried-rice-plate",
  "egusi-soup-and-fufu": "egusi-fufu",
  "fufu-and-vegetable-soup": "fufu-vegetable-soup",
  "crispy-chicken-tender-with-cheesy-wedges": "chicken-tender-combo",
  "egusi-soup-and-swallow": "egusi-fufu",
  "fried-rice-fried-plantain-salad-and-chicken": "fried-rice-plate",
  "jollof-rice-fried-plantain-salad-and-chicken": "jollof-rice-plate",
  "vegetable-soup-and-swallow": "fufu-vegetable-soup",
  "catfish-pepper-soup": "catfish-pepper-soup",
  canolli: "canolli",
  aandw: "aandw",
  "dr-pepper": "dr-pepper",
  "canadab-dry": "canadab-dry",
  bang: "bang",
  celsius: "celsius",
  monster: "monster",
  nos: "nos",
  rockstar: "rockstar",
  "5-hour-energy": "5-hour-energy",
  cappucinno: "latte-cappuccino",
  "coffee-original-dark-roast": "coffee-espresso",
  "expresso-style": "coffee-espresso",
  "french-vanilla": "allstar-french-vanilla",
  "hot-milk-chocolate": "hot-chocolate",
  latte: "latte-cappuccino",
  mochaccino: "cafe-mocha",
  "old-fashioned-plain": "old-fashioned-plain",
  "small-iced-caramel-latte": "caramel-iced-latte",
  "large-iced-caramel-latte": "caramel-iced-latte",
  "extra-large-iced-caramel-latte": "caramel-iced-latte",
  "small-iced-vanilla-latte": "vanilla-iced-latte",
  "large-iced-vanilla-latte": "vanilla-iced-latte",
  "extra-large-iced-vanilla-latte": "vanilla-iced-latte",
  "small-iced-chocolate-caramel-latte": "chocolate-caramel-iced-latte",
  "large-iced-chocolate-caramel-latte": "chocolate-caramel-iced-latte",
  "extra-large-iced-chocolate-caramel-latte": "chocolate-caramel-iced-latte",
  "small-iced-hazelnut-latte": "hazelnut-iced-latte",
  "large-iced-hazelnut-latte": "hazelnut-iced-latte",
  "extra-large-iced-hazelnut-latte": "hazelnut-iced-latte",
  "small-iced-salted-caramel-latte": "salted-caramel-iced-latte",
  "large-iced-salted-caramel-latte": "salted-caramel-iced-latte",
  "extra-large-iced-salted-caramel-latte": "salted-caramel-iced-latte",
  "iced-mocha-small": "iced-mocha",
  "iced-mocha-large": "iced-mocha",
  "iced-mocha-extra-large": "iced-mocha",
  "fried-rice-fried-plantain-salad-and-turkey": "fried-rice-turkey-plate",
  "jollof-rice-fried-plantain-salad-and-turkey": "jollof-rice-turkey-plate",
  "fried-turkey-wings": "fried-turkey-wings",
  "small-cafe-mocha": "cafe-mocha",
  "medium-cafe-mocha": "cafe-mocha",
  "large-cafe-mocha": "cafe-mocha",
  "small-mochaccino": "cafe-mocha",
  "medium-mochaccino": "cafe-mocha",
  "small-coffee-original-dark-roast": "coffee-espresso",
  "medium-coffee-original-dark-roast": "coffee-espresso",
  "large-coffee-original-dark-roast": "coffee-espresso",
  "small-expresso-style": "coffee-espresso",
  "medium-expresso-style": "coffee-espresso",
  "large-expresso-style": "coffee-espresso",
  "small-french-vanilla": "allstar-french-vanilla",
  "medium-french-vanilla": "allstar-french-vanilla",
  "large-french-vanilla": "allstar-french-vanilla",
  "small-french-vanilla-coffee": "french-vanilla-coffee",
  "medium-french-vanilla-coffee": "french-vanilla-coffee",
  "large-french-vanilla-coffee": "french-vanilla-coffee",
  "small-hot-chocolate": "hot-chocolate",
  "medium-hot-chocolate": "hot-chocolate",
  "large-hot-chocolate": "hot-chocolate",
  "small-hot-milk-chocolate": "hot-chocolate",
  "medium-hot-milk-chocolate": "hot-chocolate",
  "large-hot-milk-chocolate": "hot-chocolate",
  "small-cappucinno": "latte-cappuccino",
  "medium-cappucinno": "latte-cappuccino",
  "large-cappucinno": "latte-cappuccino",
  "small-latte": "latte-cappuccino",
  "medium-latte": "latte-cappuccino",
  "large-latte": "latte-cappuccino",
  "large-mochaccino": "cafe-mocha",
};

function listMenuImages() {
  if (!existsSync(menuImagesDir)) return new Set();

  return new Set(
    readdirSync(menuImagesDir)
      .filter((file) => file.endsWith(".png"))
      .map((file) => file.replace(/\.png$/, ""))
  );
}

function resolveLocalImage(name, images) {
  const slug = slugify(name);
  const candidates = [IMAGE_ALIASES[slug], slug, slug.replace(/-donut$/, ""), `${slug}-donut`].filter(Boolean);

  for (const candidate of candidates) {
    if (images.has(candidate)) {
      return `/images/menu/${candidate}.png`;
    }
  }

  return null;
}

const CLOVER_IMAGE_CDN = "https://cloverstatic.com/menu-assets/items";
const imageExistsCache = new Map();

function cloverImageCandidates(item) {
  const candidates = [];
  const imageFilename = item.menuItem?.imageFilename?.trim();

  if (imageFilename) {
    candidates.push(
      imageFilename.startsWith("http") ? imageFilename : `${CLOVER_IMAGE_CDN}/${imageFilename}`
    );
  }

  if (item.id) {
    candidates.push(`${CLOVER_IMAGE_CDN}/${item.id}_512x512.jpeg`);
    candidates.push(`${CLOVER_IMAGE_CDN}/${item.id}_120x120.jpeg`);
    candidates.push(`${CLOVER_IMAGE_CDN}/${item.id}_1500x1125.jpeg`);
  }

  return [...new Set(candidates)];
}

async function cloverImageExists(url) {
  if (imageExistsCache.has(url)) return imageExistsCache.get(url);

  try {
    const response = await fetch(url, { method: "HEAD" });
    const ok = response.ok;
    imageExistsCache.set(url, ok);
    return ok;
  } catch {
    imageExistsCache.set(url, false);
    return false;
  }
}

async function resolveItemImage(item, localImages) {
  const imageFilename = item.menuItem?.imageFilename?.trim();

  if (imageFilename) {
    return imageFilename.startsWith("http")
      ? imageFilename
      : `${CLOVER_IMAGE_CDN}/${imageFilename}`;
  }

  for (const url of cloverImageCandidates(item)) {
    if (await cloverImageExists(url)) {
      return url;
    }
  }

  return resolveLocalImage(item.name, localImages);
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Clover API ${response.status}: ${body}`);
  }

  return response.json();
}

async function fetchAllElements(baseUrl, merchantId, resource, token, expand) {
  const elements = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const expandParam = expand ? `&expand=${encodeURIComponent(expand)}` : "";
    const url = `${baseUrl}/v3/merchants/${merchantId}/${resource}?limit=${limit}&offset=${offset}${expandParam}`;
    const payload = await fetchJson(url, token);
    const batch = payload.elements ?? [];

    elements.push(...batch);

    if (batch.length < limit) break;
    offset += limit;
  }

  return elements;
}

function formatPrice(cents) {
  if (typeof cents !== "number" || cents <= 0) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

async function buildMenuData(categories, images) {
  const menuCategories = [];

  for (const [index, category] of categories
    .filter((entry) => entry.name)
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .entries()) {
    const items = await Promise.all(
      (category.items?.elements ?? [])
        .filter((item) => item.hidden !== true && item.available !== false)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
        .map(async (item) => ({
          id: item.id,
          name: item.name,
          description: item.description?.trim() || item.menuItem?.description?.trim() || null,
          price: formatPrice(item.price),
          image: await resolveItemImage(item, images),
        }))
    );

    if (!items.length) continue;

    menuCategories.push({
      id: slugify(category.name) || `category-${index + 1}`,
      name: category.name,
      items,
    });
  }

  return {
    source: "clover",
    updatedAt: new Date().toISOString(),
    categories: menuCategories,
  };
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  const merchantId = env.CLOVER_MERCHANT_ID?.trim();
  const token = env.CLOVER_API_TOKEN?.trim();
  const baseUrl = env.CLOVER_API_BASE?.trim() || "https://api.clover.com";

  if (!merchantId || !token) {
    console.log("Skipping Clover menu sync (CLOVER_MERCHANT_ID or CLOVER_API_TOKEN not set).");
    process.exit(0);
  }

  const images = listMenuImages();
  const categories = await fetchAllElements(baseUrl, merchantId, "categories", token, "items.menuItem");
  const menuData = await buildMenuData(categories, images);

  if (!menuData.categories.length) {
    throw new Error("No menu categories with items were returned from Clover.");
  }

  writeFileSync(outputPath, `${JSON.stringify(menuData, null, 2)}\n`, "utf8");
  console.log(`Synced ${menuData.categories.length} categories to public/menu-data.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
