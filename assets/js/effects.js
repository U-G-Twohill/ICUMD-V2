// /assets/js/effects.js
const q = (sel, root=document) => root.querySelector(sel);
const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const getColors = (host) => {
  // read colors from data-colors or CSS var list
  const ds = (host.dataset.colors || '').trim();
  if (ds) return ds.split(',').map(s => s.trim());
  // fallback palette
  return ['#e11d48','#ea580c','#facc15','#16a34a','#0ea5e9','#6366f1','#a855f7'];
};

function initLayer(host) {
  let layer = q(':scope > .fx-layer', host);
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'fx-layer';
    host.prepend(layer);
  }
  return layer;
}

/* ---------- Effect initializers ---------- */
const initChroma = (host) => {
  host.classList.add('fx-host','fx--chromaShift');
  initLayer(host);
  return () => {}; // nothing to clean
};

const initGradientRiver = (host) => {
  host.classList.add('fx-host','fx--gradientRiver');
  initLayer(host);
  return () => {};
};

const initAurora = (host) => {
  host.classList.add('fx-host','fx--aurora');
  const layer = initLayer(host);

  // Allow any number of colors → generate a band per color
  const colors = (host.dataset.auroraColors || 'jade,azure,orchid')
    .split(',').map(x => x.trim().toLowerCase());

  // Color map plus fallback to CSS variable names
  const colorMap = {
    jade:   'linear-gradient(90deg, transparent, var(--vivid-jade), transparent)',
    azure:  'linear-gradient(90deg, transparent, var(--vivid-azure), transparent)',
    orchid: 'linear-gradient(90deg, transparent, var(--vivid-orchid), transparent)',
    ruby:   'linear-gradient(90deg, transparent, var(--vivid-ruby), transparent)',
    flame:  'linear-gradient(90deg, transparent, var(--vivid-flame), transparent)',
    gold:   'linear-gradient(90deg, transparent, var(--vivid-gold), transparent)',
    indigo: 'linear-gradient(90deg, transparent, var(--vivid-indigo), transparent)',
    silver: 'linear-gradient(90deg, transparent, var(--spectral-silver), transparent)'
  };

  const bands = colors.map((name, i) => {
    const band = document.createElement('div');
    band.className = 'aurora-band';
    band.style.top = `${10 + i*15}%`;
    band.style.background = colorMap[name] || `linear-gradient(90deg, transparent, ${name}, transparent)`;
    band.style.animationDelay = `${i*2}s`;
    layer.appendChild(band);
    return band;
  });

  return () => bands.forEach(b => b.remove());
};

const initBubbles = (host) => {
  host.classList.add('fx-host','fx--bubbles');
  const layer = initLayer(host);
  const colors = getColors(host);
  const min = parseInt(getComputedStyle(host).getPropertyValue('--bubble-min')) || 16;
  const max = parseInt(getComputedStyle(host).getPropertyValue('--bubble-max')) || 40;
  const interval = parseInt(getComputedStyle(host).getPropertyValue('--bubble-interval')) || 1200;

  let alive = true, timer = null;

  const spawn = () => {
    if (!alive) return;
    const size = Math.round(min + Math.random()*(max-min));
    const b = document.createElement('div');
    b.className = 'bubble';
    b.style.width = b.style.height = `${size}px`;
    b.style.left = `${Math.random()*100}%`;
    b.style.bottom = '0';
    b.style.background = colors[Math.floor(Math.random()*colors.length)];
    b.style.animationDelay = `${(Math.random()*1.5).toFixed(2)}s`;
    layer.appendChild(b);
    setTimeout(() => b.remove(), 10000);
  };

  // ensure bubbles start visible right away
  const start = () => { spawn(); timer = setInterval(spawn, interval); };
  const stop  = () => { clearInterval(timer); timer = null; };

  start();
  return () => { alive = false; stop(); layer.querySelectorAll('.bubble').forEach(b => b.remove()); };
};

/* ---------- Registry & Auto-init ---------- */
const REGISTRY = {
  'chroma': initChroma,
  'river': initGradientRiver,
  'aurora': initAurora,
  'bubbles': initBubbles,
};

// Observe visibility for perf
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const host = entry.target;
    if (entry.isIntersecting) {
      if (!host._fxDispose) {
        const type = host.dataset.effect;
        const init = REGISTRY[type];
        if (init) host._fxDispose = init(host);
      }
    } else {
      if (host._fxDispose) { host._fxDispose(); host._fxDispose = null; }
    }
  });
}, { root: null, threshold: 0 });

qa('[data-effect]').forEach(el => io.observe(el));

// Respect reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--fx-speed', '0.01'); // essentially stop
}
