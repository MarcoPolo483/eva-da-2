/**
 * Example image optimizer using sharp.
 *
 * Usage (install sharp first):
 *   npm install --save-dev sharp
 *   node scripts/optimize-images.js
 *
 * This is a small example - adapt paths and sizes to your project. Running
 * this script is optional; you can also use dedicated image pipelines.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'public');
const outDir = path.join(__dirname, '..', 'src', 'assets', 'generated');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const conversions = [
  { suffix: '800', width: 800 },
  { suffix: '1600', width: 1600 }
];

async function convert(fileName) {
  const input = path.join(srcDir, fileName);
  const base = path.parse(fileName).name.replace(/\s+/g, '-').toLowerCase();

  for (const c of conversions) {
    const outWebp = path.join(outDir, `${base}-${c.suffix}.webp`);
    const outJpg = path.join(outDir, `${base}-${c.suffix}.jpg`);

    await sharp(input).resize(c.width).webp({ quality: 80 }).toFile(outWebp);
    await sharp(input).resize(c.width).jpeg({ quality: 80 }).toFile(outJpg);
    console.log('wrote', outWebp, outJpg);
  }
}

// Example: convert the two images you dropped in public/
convert('EVA 2025-11-09 163130.jpg').catch(console.error);
convert('GoC 2025-11-09 161451.jpg').catch(console.error);
