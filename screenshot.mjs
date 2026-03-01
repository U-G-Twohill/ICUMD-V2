import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const width = parseInt(process.argv[4]) || 1440;
const height = parseInt(process.argv[5]) || 900;
const dir = './screenshots';

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const next = existing.length + 1;
const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

// Scroll through the page to trigger IntersectionObserver reveals
await page.evaluate(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const h = document.body.scrollHeight;
  for (let i = 0; i < h; i += 300) {
    window.scrollTo(0, i);
    await delay(100);
  }
  window.scrollTo(0, 0);
  await delay(500);
  // Force reveal all elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    el.classList.add('revealed');
  });
  await delay(800);
});

await page.screenshot({ path: join(dir, filename), fullPage: true });
await browser.close();

console.log(`Saved: ${join(dir, filename)}`);
