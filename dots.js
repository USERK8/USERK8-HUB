(() => {
  const CONFIG = {
    spacing: 30,
    baseRadius: 1.9,
    influence: 90,
    push: 16,
    ease: 0.05,
    color: '255,255,255',
    baseAlpha: 0.16,
    ringHotScale: 1.7
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) CONFIG.ease = 1;

  const canvas = document.getElementById('dots');
  const ctx = canvas.getContext('2d');
  const ring = document.getElementById('ring');
  const main = document.querySelector('main');

  let w = 0, h = 0, n = 0, hx, hy, px, py;
  const client = { x: -9999, y: -9999 };
  let rx = -9999, ry = -9999, rs = 1, rsTarget = 1;

  function build() {
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = document.documentElement.clientWidth;
    h = Math.max(innerHeight, main.offsetHeight);
    while (w * h * dpr * dpr > 12e6 && dpr > 1) dpr -= 0.25;
    dpr = Math.max(1, dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = CONFIG.spacing;
    const cols = Math.ceil(w / s) + 1, rows = Math.ceil(h / s) + 1;
    n = cols * rows;
    hx = new Float32Array(n); hy = new Float32Array(n);
    px = new Float32Array(n); py = new Float32Array(n);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        hx[i] = px[i] = c * s;
        hy[i] = py[i] = r * s;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const mx = client.x + window.scrollX;
    const my = client.y + window.scrollY;
    const top = window.scrollY - 40, bottom = window.scrollY + innerHeight + 40;
    const R = CONFIG.influence, P = CONFIG.push, E = CONFIG.ease;

    for (let i = 0; i < n; i++) {
      if (hy[i] < top || hy[i] > bottom) { px[i] = hx[i]; py[i] = hy[i]; continue; }
      const dx = hx[i] - mx, dy = hy[i] - my;
      const d = Math.hypot(dx, dy);
      let tx = hx[i], ty = hy[i], near = 0;
      if (d < R) {
        near = 1 - d / R;
        const push = near * near * P;
        const ux = d > 0.01 ? dx / d : 1;
        const uy = d > 0.01 ? dy / d : 0;
        tx += ux * push;
        ty += uy * push;
      }
      px[i] += (tx - px[i]) * E;
      py[i] += (ty - py[i]) * E;
      ctx.fillStyle = 'rgba(' + CONFIG.color + ',' + (CONFIG.baseAlpha + near * 0.22) + ')';
      ctx.beginPath();
      ctx.arc(px[i], py[i], CONFIG.baseRadius + near * 0.5, 0, 6.2832);
      ctx.fill();
    }

    rx += (client.x - rx) * 0.4;
    ry += (client.y - ry) * 0.4;
    rs += (rsTarget - rs) * 0.2;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(' + rs + ')';

    requestAnimationFrame(draw);
  }

  function track(e) {
    client.x = e.clientX; client.y = e.clientY;
    if (e.pointerType === 'touch') {
      ring.classList.remove('show');
    } else {
      if (!ring.classList.contains('show')) { rx = client.x; ry = client.y; }
      ring.classList.add('show');
    }
  }

  function release(e) {
    if (e.pointerType === 'touch') { client.x = client.y = -9999; }
  }

  addEventListener('pointermove', track, { passive: true });
  addEventListener('pointerdown', track, { passive: true });
  addEventListener('pointerup', release, { passive: true });
  addEventListener('pointercancel', release, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    client.x = client.y = -9999;
    ring.classList.remove('show');
  });
  document.addEventListener('pointerover', (e) => {
    const hot = e.target.closest && e.target.closest('a');
    rsTarget = hot ? CONFIG.ringHotScale : 1;
  });

  let pending = false;
  function queueBuild() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; build(); });
  }
  addEventListener('resize', queueBuild);
  if ('ResizeObserver' in window) new ResizeObserver(queueBuild).observe(main);

  build();
  requestAnimationFrame(draw);
})();
