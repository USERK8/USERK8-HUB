(() => {
  'use strict';

  const CONFIG = {
    spacing: 30,
    baseRadius: 2.1,
    influence: 110,
    push: 20,
    ease: 0.065,
    colorBase: [215, 238, 255],
    colorMid:  [0, 240, 230],
    colorHot:  [255, 159, 67],
    heatEase: 0.08,
    baseAlpha: 0.14,
    driftAmount: 5.5,
    driftSpeed: 0.72,
    ringHotScale: 1.65
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    CONFIG.ease = 1;
    CONFIG.driftAmount = 0;
  }

  const canvas = document.getElementById('dots');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ring = document.getElementById('ring');
  const main = document.querySelector('main') || document.body;

  let w = 0, h = 0, n = 0, hx, hy, px, py, ph, sp, heat;
  const client = { x: -9999, y: -9999 };
  let rx = -9999, ry = -9999, rs = 1, rsTarget = 1;
  const shockwaves = [];

  function build() {
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = document.documentElement.clientWidth;
    h = Math.max(window.innerHeight, main.offsetHeight + 120);
    while (w * h * dpr * dpr > 12e6 && dpr > 1) dpr -= 0.25;
    dpr = Math.max(1, dpr);

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = CONFIG.spacing;
    const cols = Math.ceil(w / s) + 1;
    const rows = Math.ceil(h / s) + 1;
    n = cols * rows;
    hx = new Float32Array(n); hy = new Float32Array(n);
    px = new Float32Array(n); py = new Float32Array(n);
    ph = new Float32Array(n); sp = new Float32Array(n);
    heat = new Float32Array(n);

    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        hx[i] = px[i] = c * s;
        hy[i] = py[i] = r * s;
        ph[i] = Math.random() * 6.2832;
        sp[i] = 0.5 + Math.random();
      }
    }
  }

  function spawnShockwave(pageX, pageY) {
    if (reduce) return;
    shockwaves.push({
      x: pageX,
      y: pageY,
      radius: 0,
      maxRadius: Math.hypot(w, window.innerHeight) * 0.72,
      strength: 1
    });
    if (shockwaves.length > 4) shockwaves.shift();
  }

  let lastTs = 0;
  function draw(time) {
    const dt = Math.min(0.05, ((time || 0) - lastTs) * 0.001 || 0.016);
    lastTs = time || 0;
    const t = (time || 0) * 0.001 * CONFIG.driftSpeed;
    const A = CONFIG.driftAmount;
    ctx.clearRect(0, 0, w, h);

    for (let s = shockwaves.length - 1; s >= 0; s--) {
      const sw = shockwaves[s];
      sw.radius += dt * 560;
      sw.strength = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.strength <= 0.01) shockwaves.splice(s, 1);
    }

    const mx = client.x + window.scrollX;
    const my = client.y + window.scrollY;
    const top = window.scrollY - 60;
    const bottom = window.scrollY + window.innerHeight + 60;
    const R = CONFIG.influence, P = CONFIG.push, E = CONFIG.ease;

    for (let i = 0; i < n; i++) {
      if (hy[i] < top || hy[i] > bottom) {
        px[i] = hx[i];
        py[i] = hy[i];
        heat[i] = 0;
        continue;
      }

      let tx = hx[i] + Math.sin(t * sp[i] + ph[i]) * A;
      let ty = hy[i] + Math.cos(t * sp[i] * 0.8 + ph[i] * 1.3) * A;
      let targetHeat = 0;

      const dx = hx[i] - mx;
      const dy = hy[i] - my;
      const d = Math.hypot(dx, dy);
      if (d < R) {
        const near = 1 - d / R;
        const push = near * near * P;
        const ux = d > 0.01 ? dx / d : 1;
        const uy = d > 0.01 ? dy / d : 0;
        tx += ux * push;
        ty += uy * push;
        targetHeat = near;
      }

      for (let s = 0; s < shockwaves.length; s++) {
        const sw = shockwaves[s];
        const sdx = hx[i] - sw.x;
        const sdy = hy[i] - sw.y;
        const sd = Math.hypot(sdx, sdy);
        const band = Math.abs(sd - sw.radius);
        if (band < 68) {
          const wave = (1 - band / 68) * sw.strength;
          const ux = sd > 0.01 ? sdx / sd : 1;
          const uy = sd > 0.01 ? sdy / sd : 0;
          tx += ux * wave * 24;
          ty += uy * wave * 24;
          if (wave * 1.25 > targetHeat) targetHeat = Math.min(1, wave * 1.25);
        }
      }

      px[i] += (tx - px[i]) * E;
      py[i] += (ty - py[i]) * E;
      heat[i] += (targetHeat - heat[i]) * CONFIG.heatEase;

      const k = Math.min(1, heat[i] * 1.35);
      let cr, cg, cb;
      if (k < 0.55) {
        const u = k / 0.55;
        cr = CONFIG.colorBase[0] + (CONFIG.colorMid[0] - CONFIG.colorBase[0]) * u;
        cg = CONFIG.colorBase[1] + (CONFIG.colorMid[1] - CONFIG.colorBase[1]) * u;
        cb = CONFIG.colorBase[2] + (CONFIG.colorMid[2] - CONFIG.colorBase[2]) * u;
      } else {
        const u = (k - 0.55) / 0.45;
        cr = CONFIG.colorMid[0] + (CONFIG.colorHot[0] - CONFIG.colorMid[0]) * u;
        cg = CONFIG.colorMid[1] + (CONFIG.colorHot[1] - CONFIG.colorMid[1]) * u;
        cb = CONFIG.colorMid[2] + (CONFIG.colorHot[2] - CONFIG.colorMid[2]) * u;
      }

      ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${(CONFIG.baseAlpha + k * 0.62).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px[i], py[i], CONFIG.baseRadius + k * 1.1, 0, 6.2832);
      ctx.fill();
    }

    if (ring) {
      rx += (client.x - rx) * 0.36;
      ry += (client.y - ry) * 0.36;
      rs += (rsTarget - rs) * 0.2;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) scale(${rs.toFixed(3)})`;
    }

    requestAnimationFrame(draw);
  }

  function track(e) {
    client.x = e.clientX;
    client.y = e.clientY;
    if (!ring) return;
    if (e.pointerType === 'touch') {
      ring.classList.remove('show');
    } else {
      if (!ring.classList.contains('show')) { rx = client.x; ry = client.y; }
      ring.classList.add('show');
    }
  }

  function release(e) {
    if (e.pointerType === 'touch') {
      client.x = client.y = -9999;
    }
  }

  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', e => {
    track(e);
    if (!e.target.closest('.orbital-nav, .cmd-backdrop')) {
      spawnShockwave(e.clientX + window.scrollX, e.clientY + window.scrollY);
      if (window.UserK8Audio) window.UserK8Audio.shockwave();
    }
  }, { passive: true });
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    client.x = client.y = -9999;
    if (ring) ring.classList.remove('show');
  });

  document.addEventListener('pointerover', e => {
    const hot = e.target.closest && e.target.closest('a, button, input');
    rsTarget = hot ? CONFIG.ringHotScale : 1;
  });

  let pending = false;
  function queueBuild() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      build();
    });
  }
  window.addEventListener('resize', queueBuild, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(queueBuild).observe(main);

  build();
  requestAnimationFrame(draw);
})();