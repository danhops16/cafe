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

function buildMenuData(categories, images) {
  const menuCategories = categories
    .filter((category) => category.name)
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((category, index) => {
      const items = (category.items?.elements ?? [])
        .filter((item) => item.hidden !== true && item.available !== false)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description?.trim() || null,
          price: formatPrice(item.price),
          image: resolveLocalImage(item.name, images),
        }));

      return {
        id: slugify(category.name) || `category-${index + 1}`,
        name: category.name,
        items,
      };
    })
    .filter((category) => category.items.length > 0);

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
  const categories = await fetchAllElements(baseUrl, merchantId, "categories", token, "items");
  const menuData = buildMenuData(categories, images);

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
