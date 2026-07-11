/**
 * Download branded drink product photos for menu fallbacks.
 * Uses DuckDuckGo image search + Wikimedia fallbacks, then resizes to 512px PNG.
 *
 * Usage: node scripts/fetch-drink-images.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/images/menu");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const DRINKS = {
  aandw: "A&W root beer can product",
  "canada-dry-can": "Canada Dry ginger ale can product",
  "coca-cola-can": "Coca Cola classic can product photo",
  "dr-pepper": "Dr Pepper soda can product photo",
  "fanta-orange-can": "Fanta orange soda can product photo",
  "mountain-dew-can": "Mountain Dew can product photo",
  "pepsi-can": "Pepsi cola can product photo",
  "sprite-can": "Sprite soda can product photo",
  "7up-bottle": "7UP soda bottle product photo",
  "canadab-dry": "Canada Dry ginger ale bottle product photo",
  "coca-cola-bottle": "Coca Cola bottle product photo",
  "diet-coke-bottle": "Diet Coke bottle product photo",
  "fanta-orange-bottle": "Fanta orange bottle product photo",
  "g-zero": "Gatorade Zero bottle product photo",
  "mountain-dew-bottle": "Mountain Dew bottle product photo",
  "pepsi-bottle": "Pepsi bottle product photo",
  "sprite-bottle": "Sprite bottle product photo",
  "5-hour-energy": "5 hour energy shot bottle product photo",
  bang: "Bang energy drink can product photo",
  celsius: "Celsius energy drink can product photo",
  monster: "Monster energy drink can product photo",
  nos: "NOS energy drink can product photo",
  "prime-energy": "Prime energy drink can product photo",
  "red-bull": "Red Bull energy drink can product photo",
  rockstar: "Rockstar energy drink can product photo",
  aquafina: "Aquafina water bottle product photo",
  "aquafina-small": "Aquafina water bottle product photo",
  "bottle-water": "generic bottled water product photo",
  "eva-water": "Eva bottled water Nigeria product photo",
  evian: "Evian water bottle product photo",
  "fiji-water": "Fiji water bottle product photo",
  "nestle-pure-life": "Nestle Pure Life water bottle product photo",
  "smart-water": "Smartwater bottle product photo",
};

const WIKI = {
  "coca-cola-can":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Coca-Cola_330ml_can.jpg/500px-Coca-Cola_330ml_can.jpg",
  "dr-pepper":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Dr_Pepper_0%2C33l_Dose_Classic.png/500px-Dr_Pepper_0%2C33l_Dose_Classic.png",
  "pepsi-can":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Pepsi_lime_330ml_can-front_PNr%C2%B00852.jpg/500px-Pepsi_lime_330ml_can-front_PNr%C2%B00852.jpg",
  "canada-dry-can":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Canada_dry_1.jpg/500px-Canada_dry_1.jpg",
  "canadab-dry":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Canada_dry_1.jpg/500px-Canada_dry_1.jpg",
  "red-bull":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Red_Bull_Energy_Drink%2C_Dongguan%2C_China_1_May_2024.jpg/500px-Red_Bull_Energy_Drink%2C_Dongguan%2C_China_1_May_2024.jpg",
  "fiji-water":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Fiji_water_bottle.jpg/500px-Fiji_water_bottle.jpg",
  monster:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Monster_Energy_drink_%28cropped%29.jpg/500px-Monster_Energy_drink_%28cropped%29.jpg",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getVqd(query) {
  const url = `https://duckduckgo.com/?${new URLSearchParams({ q: query, iax: "images", ia: "images" })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const m = html.match(/vqd=([\d-]+)/);
  return m?.[1] ?? null;
}

async function ddgImages(query, vqd) {
  const params = new URLSearchParams({
    l: "us-en",
    o: "json",
    q: query,
    vqd,
    f: ",,,,,",
    p: "1",
  });
  const res = await fetch(`https://duckduckgo.com/i.js?${params}`, {
    headers: { "User-Agent": UA, Referer: "https://duckduckgo.com/" },
  });
  const data = await res.json();
  return data.results ?? [];
}

function scoreResult(r) {
  const url = (r.image ?? "").toLowerCase();
  const title = (r.title ?? "").toLowerCase();
  const bad = ["logo.svg", "icon", "banner", "nutrition", "clipart", "vector"];
  if (bad.some((b) => url.includes(b) || title.includes(b))) return -1;
  let s = 0;
  for (const g of ["can", "bottle", "product", "drink", "soda", "water", "energy"]) {
    if (url.includes(g) || title.includes(g)) s += 2;
  }
  if (["amazon", "walmart", "target", "kroger"].some((d) => url.includes(d))) s += 3;
  if (/\.(jpg|jpeg|png|webp)$/.test(url)) s += 2;
  return s;
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error("image too small");
  writeFileSync(dest, buf);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const tmp = resolve(outDir, ".tmp-download");
  const ok = [];
  const fail = [];

  for (const [slug, query] of Object.entries(DRINKS)) {
    const dest = resolve(outDir, `${slug}.png`);
    process.stdout.write(`${slug}… `);

    const urls = [];
    if (WIKI[slug]) urls.push(WIKI[slug]);
    try {
      const vqd = await getVqd(query);
      if (vqd) {
        const results = await ddgImages(query, vqd);
        for (const r of results.sort((a, b) => scoreResult(b) - scoreResult(a)).slice(0, 8)) {
          if (scoreResult(r) >= 2 && r.image) urls.push(r.image);
        }
      }
    } catch {
      /* search optional */
    }

    let saved = false;
    for (const url of [...new Set(urls)]) {
      try {
        await download(url, tmp);
        execSync(`sips -s format png -Z 512 "${tmp}" --out "${dest}"`, { stdio: "ignore" });
        console.log("OK");
        ok.push(slug);
        saved = true;
        break;
      } catch {
        /* try next */
      }
    }
    if (!saved) {
      console.log("FAIL");
      fail.push(slug);
    }
    await sleep(1500);
  }

  if (existsSync(tmp)) execSync(`rm -f "${tmp}"`);
  console.log(`\nDone: ${ok.length} ok, ${fail.length} failed`);
  if (fail.length) console.log("Failed:", fail.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
