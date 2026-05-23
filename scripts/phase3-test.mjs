import puppeteer from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'http://localhost:3000';
const PAGES = [
  { path: '/',              preset: 'home' },
  { path: '/about.html',    preset: 'about' },
  { path: '/services.html', preset: 'services' },
  { path: '/design.html',   preset: 'design' },
  { path: '/portfolio.html',preset: 'portfolio' },
  { path: '/solutions.html',preset: 'solutions' },
  { path: '/contact.html',  preset: 'contact' },
  { path: '/faq.html',      preset: 'faq' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 375,  height: 812 },
];

const SHOT_DIR = './screenshots/phase3';
if (!existsSync(SHOT_DIR)) mkdirSync(SHOT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});
const results = [];

for (const vp of VIEWPORTS) {
  for (const p of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    const consoleMsgs = [];
    const networkFails = [];
    const presetFetches = [];

    page.on('console', msg => {
      consoleMsgs.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', err => {
      consoleMsgs.push({ type: 'pageerror', text: err.message });
    });
    page.on('requestfailed', req => {
      networkFails.push({ url: req.url(), error: req.failure()?.errorText });
    });
    page.on('response', res => {
      const url = res.url();
      if (url.includes('/presets/') && url.endsWith('.json')) {
        presetFetches.push({ url, status: res.status() });
      }
    });

    let loadErr = null;
    try {
      await page.goto(BASE + p.path, { waitUntil: 'networkidle0', timeout: 15000 });
      // Let shader init + RAF run
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      loadErr = e.message;
    }

    // Inspect DOM for canvas + the data-shader-preset attr
    const dom = await page.evaluate(() => {
      const hdr = document.querySelector('[data-shader-preset]');
      const canvas = document.querySelector('canvas');
      return {
        headerPreset: hdr?.getAttribute('data-shader-preset') || null,
        headerClass: hdr?.className || null,
        canvasFound: !!canvas,
        canvasW: canvas?.width || 0,
        canvasH: canvas?.height || 0,
        debugFlag: typeof window.__FieldShaderDebug,
      };
    }).catch(e => ({ error: e.message }));

    const shotPath = join(SHOT_DIR, `${vp.name}-${p.preset}.png`);
    try {
      await page.screenshot({ path: shotPath, fullPage: false });
    } catch {}

    results.push({
      viewport: vp.name,
      path: p.path,
      expectedPreset: p.preset,
      loadErr,
      dom,
      presetFetches,
      consoleMsgs,
      networkFails,
      screenshot: shotPath,
    });

    await page.close();
  }
}

await browser.close();

// Compact report
console.log('\n=== PHASE 3 TEST REPORT ===\n');
let allGood = true;
for (const r of results) {
  const lines = [];
  let pageOk = true;

  if (r.loadErr) { lines.push(`  LOAD ERROR: ${r.loadErr}`); pageOk = false; }
  if (r.dom?.error) { lines.push(`  DOM ERROR: ${r.dom.error}`); pageOk = false; }
  if (r.dom?.headerPreset !== r.expectedPreset) {
    lines.push(`  PRESET MISMATCH: expected "${r.expectedPreset}" got "${r.dom?.headerPreset}"`);
    pageOk = false;
  }
  if (!r.dom?.canvasFound) { lines.push(`  NO CANVAS RENDERED`); pageOk = false; }
  if (r.dom?.canvasFound && (r.dom.canvasW === 0 || r.dom.canvasH === 0)) {
    lines.push(`  CANVAS ZERO-SIZED: ${r.dom.canvasW}x${r.dom.canvasH}`);
    pageOk = false;
  }

  const presetFetch = r.presetFetches.find(f => f.url.endsWith(`/${r.expectedPreset}.json`));
  if (!presetFetch) {
    lines.push(`  NO PRESET FETCH for ${r.expectedPreset}.json`);
    pageOk = false;
  } else if (presetFetch.status !== 200) {
    lines.push(`  PRESET FETCH BAD STATUS: ${presetFetch.status}`);
    pageOk = false;
  }

  // Filter out swiftshader GPU-stall perf warnings (headless rendering artifacts) and favicon 404
  const errs = r.consoleMsgs.filter(m =>
    (m.type === 'error' || m.type === 'pageerror') &&
    !/Failed to load resource.*404/.test(m.text)
  );
  if (errs.length) {
    lines.push(`  CONSOLE ERRORS (${errs.length}):`);
    errs.slice(0, 5).forEach(e => lines.push(`    [${e.type}] ${e.text}`));
    pageOk = false;
  }

  const warns = r.consoleMsgs.filter(m =>
    (m.type === 'warning' || m.type === 'warn') &&
    !/GL Driver Message|GPU stall|swiftshader/i.test(m.text)
  );
  if (warns.length) {
    lines.push(`  CONSOLE WARNINGS (${warns.length}):`);
    warns.slice(0, 5).forEach(w => lines.push(`    ${w.text}`));
  }

  const netFails = r.networkFails.filter(f => !f.url.includes('favicon'));
  const ignored404s = r.consoleMsgs.filter(m =>
    (m.type === 'error' || m.type === 'pageerror') &&
    /Failed to load resource.*404/.test(m.text)
  );
  // strip favicon-style 404s from the error list (we don't have a separate URL for these)
  if (netFails.length) {
    lines.push(`  NETWORK FAILURES (${netFails.length}):`);
    netFails.slice(0, 5).forEach(f => lines.push(`    ${f.url} — ${f.error}`));
    pageOk = false;
  }

  const status = pageOk ? 'OK' : 'FAIL';
  if (!pageOk) allGood = false;
  console.log(`[${status}] ${r.viewport} ${r.path.padEnd(20)} preset=${r.dom?.headerPreset || '?'} canvas=${r.dom?.canvasW || 0}x${r.dom?.canvasH || 0}`);
  lines.forEach(l => console.log(l));
}

console.log('\n=== SUMMARY ===');
console.log(allGood ? 'ALL PAGES OK' : 'SOME PAGES FAILED');
process.exit(allGood ? 0 : 1);
