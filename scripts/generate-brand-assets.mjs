/**
 * Generates every BookYourSlot logo/favicon/email asset from font files,
 * writing over the legacy Cal.com asset filenames so no code changes are
 * needed when the brand changes.
 *
 * Run from the repo root:
 *   npx -y -p fontkit -p png-to-ico node scripts/generate-brand-assets.mjs
 *
 * Fonts: uses apps/web/fonts/brand/howells-script.(woff2|otf|ttf) for the
 * wordmark and monogram when present (licensed Envato file, supplied
 * manually), otherwise falls back to Cal Sans so the pipeline always works.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const fontkit = require("fontkit");
const pngToIcoModule = require("png-to-ico");
const pngToIco = pngToIcoModule.default ?? pngToIcoModule;
const sharp = require(path.resolve("node_modules/sharp"));

const PUB = path.resolve("apps/web/public");
const WORD = "BookYourSlot";
const INK = "#292929";
const TILE_BG = "#111111";

const brandFontCandidates = [
  "apps/web/fonts/brand/howells-script.woff2",
  "apps/web/fonts/brand/howells-script.otf",
  "apps/web/fonts/brand/howells-script.ttf",
];
const fallbackFont = "apps/web/fonts/CalSans-SemiBold.woff2";
const fontPath = brandFontCandidates.find((p) => existsSync(p)) ?? fallbackFont;
const font = fontkit.openSync(path.resolve(fontPath));
console.log(`Using font: ${fontPath} (${font.fullName ?? font.postscriptName})`);

/** Outline `text` at `fontSize`, returning svg path data + tight bbox. */
function outline(text, fontSize) {
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(text);
  let penX = 0;
  let d = "";
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const pt = (x, y, dx, dy) => {
    // Font coords are y-up; SVG is y-down (flip around 0, offset later via bbox)
    const px = (penX + dx + x) * scale;
    const py = -(dy + y) * scale;
    box.minX = Math.min(box.minX, px);
    box.maxX = Math.max(box.maxX, px);
    box.minY = Math.min(box.minY, py);
    box.maxY = Math.max(box.maxY, py);
    return `${px.toFixed(2)} ${py.toFixed(2)}`;
  };
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    for (const cmd of glyph.path.commands) {
      const a = cmd.args;
      const dx = pos.xOffset ?? 0;
      const dy = pos.yOffset ?? 0;
      if (cmd.command === "moveTo") d += `M${pt(a[0], a[1], dx, dy)}`;
      else if (cmd.command === "lineTo") d += `L${pt(a[0], a[1], dx, dy)}`;
      else if (cmd.command === "quadraticCurveTo")
        d += `Q${pt(a[0], a[1], dx, dy)} ${pt(a[2], a[3], dx, dy)}`;
      else if (cmd.command === "bezierCurveTo")
        d += `C${pt(a[0], a[1], dx, dy)} ${pt(a[2], a[3], dx, dy)} ${pt(a[4], a[5], dx, dy)}`;
      else if (cmd.command === "closePath") d += "Z";
    }
    penX += pos.xAdvance;
  });
  return { d, ...box, width: box.maxX - box.minX, height: box.maxY - box.minY };
}

function wordmarkSvg(fill, targetHeight = 26) {
  const o = outline(WORD, 100);
  const k = targetHeight / o.height;
  const w = +(o.width * k).toFixed(2);
  return `<svg width="${w}" height="${targetHeight}" viewBox="0 0 ${w} ${targetHeight}" fill="none" xmlns="http://www.w3.org/2000/svg"><path transform="translate(${(-o.minX * k).toFixed(2)} ${(-o.minY * k).toFixed(2)}) scale(${k.toFixed(4)})" d="${o.d}" fill="${fill}"/></svg>`;
}

/** Monogram "B" tile. bg=null renders the glyph alone on transparency. */
function tileSvg(size, { bg = TILE_BG, fg = "#FFFFFF", radiusRatio = 0.214, glyphRatio = 0.58 } = {}) {
  const o = outline("B", 100);
  const k = (size * glyphRatio) / o.height;
  const tx = (size - o.width * k) / 2 - o.minX * k;
  const ty = (size - o.height * k) / 2 - o.minY * k;
  const rect = bg
    ? `<rect width="${size}" height="${size}" rx="${(size * radiusRatio).toFixed(1)}" fill="${bg}"/>`
    : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">${rect}<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})" d="${o.d}" fill="${fg}"/></svg>`;
}

async function svgToPng(svg, file, { width, height } = {}) {
  let img = sharp(Buffer.from(svg), { density: 300 });
  if (width) img = img.resize(width, height ?? width, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await img.png().toFile(path.join(PUB, file));
  console.log(`  ${file}`);
}

// --- word SVGs (same filenames the app already references) ---
writeFileSync(path.join(PUB, "calcom-logo-white-word.svg"), wordmarkSvg("#FFFFFF"));
writeFileSync(path.join(PUB, "cal-logo-word-dark.svg"), wordmarkSvg("#FFFFFF"));
writeFileSync(path.join(PUB, "cal-logo-word-black.svg"), wordmarkSvg(INK));
writeFileSync(path.join(PUB, "cal-logo-word.svg"), wordmarkSvg(INK));
writeFileSync(path.join(PUB, "cal-com-icon.svg"), tileSvg(56, { radiusRatio: 12 / 56 }));
writeFileSync(path.join(PUB, "cal-com-icon-white.svg"), tileSvg(56, { bg: null }));
writeFileSync(path.join(PUB, "safari-pinned-tab.svg"), tileSvg(700, { bg: null, fg: "#000000", glyphRatio: 0.8 }));
console.log("  word + monogram SVGs");

// --- raster tiles ---
const tiles = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-256x256.png", 256],
  ["android-chrome-384x384.png", 384],
  ["android-chrome-512x512.png", 512],
];
// mstile background color comes from browserconfig.xml, so glyph-only + alpha
const mstiles = [
  ["mstile-70x70.png", 128, 128],
  ["mstile-144x144.png", 144, 144],
  ["mstile-150x150.png", 150, 150],
  ["mstile-310x150.png", 558, 270],
  ["mstile-310x310.png", 558, 558],
];

const run = async () => {
  for (const [file, size] of tiles) await svgToPng(tileSvg(1024), file, { width: size });
  for (const [file, w, h] of mstiles)
    await svgToPng(tileSvg(1024, { bg: null, glyphRatio: 0.5 }), file, { width: w, height: h });

  // email logo: fixed 123x38 (email tables are fixed-width)
  await svgToPng(wordmarkSvg(INK, 200), "emails/logo.png", { width: 123, height: 38 });

  // favicon.ico from the 16 + 32 pngs
  const ico = await pngToIco([
    path.join(PUB, "favicon-16x16.png"),
    path.join(PUB, "favicon-32x32.png"),
  ]);
  writeFileSync(path.join(PUB, "favicon.ico"), ico);
  console.log("  favicon.ico");
  console.log("Done.");
};

mkdirSync(path.join(PUB, "emails"), { recursive: true });
await run();
