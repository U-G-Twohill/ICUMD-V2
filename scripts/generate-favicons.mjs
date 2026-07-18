/**
 * Generates the site's favicon set from imgs/enhancedlogo.png.
 *
 * The source logo is ~90KB — far too heavy to serve as a favicon — so this
 * renders it down to the sizes browsers actually ask for. Re-run only if the
 * logo changes; the outputs are committed.
 *
 *   node scripts/generate-favicons.mjs
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import puppeteer from 'puppeteer';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'imgs', 'enhancedlogo.png');

const TARGETS = [
  { size: 32, file: 'favicon-32x32.png' },
  { size: 16, file: 'favicon-16x16.png' },
  { size: 180, file: 'apple-touch-icon.png' },
];

const dataUri = `data:image/png;base64,${readFileSync(SOURCE).toString('base64')}`;

const browser = await puppeteer.launch();
const page = await browser.newPage();

for (const { size, file } of TARGETS) {
  const png = await page.evaluate(
    async (src, size) => {
      const img = new Image();
      img.src = src;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      // Contain the logo within the square, preserving aspect ratio.
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

      return canvas.toDataURL('image/png').split(',')[1];
    },
    dataUri,
    size
  );

  const out = join(ROOT, file);
  writeFileSync(out, Buffer.from(png, 'base64'));
  console.log(`${file.padEnd(22)} ${String(readFileSync(out).length).padStart(6)} bytes`);
}

await browser.close();
