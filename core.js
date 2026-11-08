/* ═══════════════════════════════════════════════════════════════════════════
   USERK8__ // ORBITAL CORE ENGINE (core.js)
   Shared Navigation · Procedural Web Audio · Command Palette (⌘K) · 3D Tilt
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Procedural Web Audio Synthesizer (Zero External Assets) ───────── */
  const AudioEngine = (() => {
    let ctx = null;
    let enabled = sessionStorage.getItem('uk8_sfx') === '1';

    function ensureCtx() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }

    function tone(freq, type, duration, gainPeak, slideTo) {
      if (!enabled) return;
      const ac = ensureCtx();
      if (!ac) return;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainPeak || 0.035, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    }

    return {
      isEnabled: () => enabled,
      toggle() {
        enabled = !enabled;
        sessionStorage.setItem('uk8_sfx', enabled ? '1' : '0');
        if (enabled) {
          ensureCtx();
          tone(520, 'sine', 0.11, 0.04, 880);
          setTimeout(() => tone(1046, 'triangle', 0.16, 0.035, 1318), 65);
        }
        document.querySelectorAll('[data-sfx-toggle]').forEach(btn => {
          btn.classList.toggle('sfx-on', enabled);
          const lbl = btn.querySelector('.sfx-label');
          if (lbl) lbl.textContent = enabled ? 'SFX ON' : 'SFX';
        });
        window.UserK8Toast(enabled ? 'PROCEDURAL AUDIO // ONLINE' : 'PROCEDURAL AUDIO // MUTED');
        return enabled;
      },
      hover() {
        tone(980, 'sine', 0.045, 0.014, 1240);
      },
      click() {
        tone(620, 'triangle', 0.075, 0.035, 940);
      },
      open() {
        tone(440, 'sine', 0.14, 0.03, 660);
        setTimeout(() => tone(880, 'sine', 0.18, 0.025, 1174), 55);
      },
      launch() {
        if (!enabled) return;
        const ac = ensureCtx();
        if (!ac) return;
        const now = ac.currentTime;
        // Filtered noise thruster sweep
        const bufSize = ac.sampleRate * 1.1;
        const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ac.createBufferSource();
        noise.buffer = buf;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.95);
        filter.Q.value = 2.2;
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        noise.start(now);
      },
      shockwave() {
        tone(190, 'sine', 0.28, 0.05, 58);
        tone(760, 'triangle', 0.12, 0.02, 380);
      }
    };
  })();

  window.UserK8Audio = AudioEngine;

  /* ── 2. Toast Notification Utility ────────────────────────────────────── */
  let toastTimer = null;
  function showToast(msg) {
    let el = document.getElementById('orbitalToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'orbitalToast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
  }
  window.UserK8Toast = showToast;

  /* ── 3. Detect Active Page & Inject Unified Orbital Navigation ────────── */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const activeKey =
    path.includes('ph') ? 'hub' :
    path.includes('about') ? 'about' :
    path.includes('contact') ? 'crew' : 'orbit';

  const navPages = [
    { key: 'orbit', idx: '00', label: 'ORBIT', href: 'index.html' },
    { key: 'hub',   idx: '01', label: 'PROJECT HUB', href: 'ph.html' },
    { key: 'about', idx: '02', label: 'ABOUT', href: 'about_us.html' },
    { key: 'crew',  idx: '03', label: 'CREW', href: 'contact.html' }
  ];

  // Top scroll progress bar
  const progressEl = document.createElement('div');
  progressEl.id = 'orbitalScrollProgress';
  document.body.appendChild(progressEl);

  function updateScrollProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 10 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progressEl.style.width = pct.toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress, { passive: true });

  // Inject Navigation if placeholder or body ready
  const existingNav = document.querySelector('nav.orbital-nav');
  if (!existingNav) {
    const nav = document.createElement('nav');
    nav.className = 'orbital-nav';
    nav.setAttribute('aria-label', 'Primary Orbital Navigation');
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
    const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

    nav.innerHTML = `
      <a href="index.html" class="orbital-brand" id="navBrandHome">
        <span class="orbital-brand-beacon"></span>
        <span>USERK8__</span>
        <span class="orbital-brand-sub" id="orbitalClock">// ORBITAL</span>
      </a>
      <div class="orbital-links">
        ${navPages.map(p => `
          <a href="${p.href}" class="orbital-link ${p.key === activeKey ? 'active' : ''}" id="navLink-${p.key}">
            <span class="link-idx">${p.idx}</span>
            <span>${p.label}</span>
          </a>
        `).join('')}
      </div>
      <div class="orbital-actions">
        <button type="button" class="orbital-pill-btn ${AudioEngine.isEnabled() ? 'sfx-on' : ''}" data-sfx-toggle id="btnSfxToggle" title="Toggle Procedural Sci-Fi Audio">
          <span class="sfx-bars"><span></span><span></span><span></span></span>
          <span class="sfx-label">${AudioEngine.isEnabled() ? 'SFX ON' : 'SFX'}</span>
        </button>
        <button type="button" class="orbital-pill-btn" id="btnCmdPalette" title="Open Orbital Command Palette">
          <span>CMD</span>
          <span class="orbital-kbd">${shortcutLabel}</span>
        </button>
        <button type="button" class="orbital-menu-toggle" id="btnMobileMenu" aria-label="Toggle Menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="17" x2="20" y2="17"></line>
          </svg>
        </button>
      </div>
    `;
    document.body.prepend(nav);

    const drawer = document.createElement('div');
    drawer.className = 'orbital-mobile-drawer';
    drawer.id = 'orbitalMobileDrawer';
    drawer.innerHTML = navPages.map(p => `
      <a href="${p.href}" class="orbital-link ${p.key === activeKey ? 'active' : ''}">
        <span class="link-idx">${p.idx}</span>
        <span>${p.label}</span>
      </a>
    `).join('');
    document.body.appendChild(drawer);

    const menuBtn = document.getElementById('btnMobileMenu');
    menuBtn.addEventListener('click', () => {
      AudioEngine.click();
      drawer.classList.toggle('open');
    });
  }

  // Live UTC mission telemetry clock in navbar
  const clockEl = document.getElementById('orbitalClock');
  function tickClock() {
    if (!clockEl) return;
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `UTC ${hh}:${mm}:${ss}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  document.querySelectorAll('[data-sfx-toggle]').forEach(btn => {
    btn.addEventListener('click', () => AudioEngine.toggle());
  });

  /* ── 4. Universal Command Palette (⌘K / Ctrl+K) ───────────────────────── */
  const COMMANDS = [
    { group: 'Orbital Sectors', icon: '00', title: 'Orbit Command (Home)', sub: 'Galactic 3D engine, eight AI, DEATH RAY & terminal', badge: 'PAGE', action: () => go('index.html') },
    { group: 'Orbital Sectors', icon: '01', title: 'Project Hub', sub: 'Explore all 7 live deployments & reactive dot matrix', badge: 'PAGE', action: () => go('ph.html') },
    { group: 'Orbital Sectors', icon: '02', title: 'About & Garuda Rig', sub: 'Zero-G EVA astronaut, origin story & Linux telemetry', badge: 'PAGE', action: () => go('about_us.html') },
    { group: 'Orbital Sectors', icon: '03', title: 'Crew & Subspace Comms', sub: 'userk8, Sameer Mishra, Gaurav Sardar & direct channels', badge: 'PAGE', action: () => go('contact.html') },
    { group: 'Interactive Systems', icon: '◈', title: 'Open Renders Cinema (15)', sub: '3D vehicle art, Apache, F-22 Raptor, Linux rig & films', badge: 'VAULT', action: () => {
      if (window.UserK8Renders && window.UserK8Renders.open) window.UserK8Renders.open(0);
      else go('index.html#renders');
    }},
    { group: 'Interactive Systems', icon: '⚡', title: 'Engage Hyperjump Warp Surge', sub: 'Accelerate the 3D spiral galaxy into hyperspace streaks', badge: 'FX', action: () => {
      if (window.UserK8Galaxy && window.UserK8Galaxy.warp) window.UserK8Galaxy.warp();
      else go('index.html#warp');
    }},
    { group: 'Interactive Systems', icon: '♪', title: 'Toggle Procedural Sci-Fi Audio', sub: 'Synthesized Web Audio hover & thruster soundscape', badge: 'AUDIO', action: () => AudioEngine.toggle() },
    { group: 'Interactive Systems', icon: '✉', title: 'Copy userk8 Email Address', sub: 'userk8.dev@gmail.com', badge: 'COPY', action: () => {
      navigator.clipboard.writeText('userk8.dev@gmail.com').then(() => showToast('COPIED // userk8.dev@gmail.com')).catch(() => {});
    }},
    { group: 'Live Deployments', icon: 'AI', title: 'Launch eight AI', sub: 'On-device 1B parameter 4-bit quantized language model', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/eight-ai/') },
    { group: 'Live Deployments', icon: '3D', title: 'Launch 3D8 Studio', sub: 'Browser-based 3D viewer, mesh editor & exporter', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/3D8/') },
    { group: 'Live Deployments', icon: '</>', title: 'Launch Code Word', sub: 'Terminal-styled programming & cipher puzzle environment', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/CODE-WORD/') },
    { group: 'Live Deployments', icon: 'QB', title: 'Launch Quiz Bot', sub: 'Competitive knowledge engine & global leaderboard', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/QUIZ-BOT/') },
    { group: 'Live Deployments', icon: 'PT', title: 'Launch Periodic Table', sub: 'Interactive chemical element coordinate matrix', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/PERIODIC-TABLE/') },
    { group: 'Live Deployments', icon: 'TX', title: 'Launch Text Animation', sub: 'Kinetic string keyframe playground', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/text_animation/') },
    { group: 'Live Deployments', icon: '1Q', title: 'Launch One Question', sub: 'Minimalist interactive prompt experiment', badge: 'LIVE ↗', action: () => ext('https://userk8.github.io/A-QUESTION/') }
  ];

  function go(url) {
    const targetBase = url.split('#')[0];
    if (targetBase === path && url.includes('#')) {
      location.hash = url.split('#')[1];
      return;
    }
    location.href = url;
  }

  function ext(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const cmdBackdrop = document.createElement('div');
  cmdBackdrop.className = 'cmd-backdrop';
  cmdBackdrop.id = 'cmdPaletteBackdrop';
  cmdBackdrop.innerHTML = `
    <div class="cmd-dialog" role="dialog" aria-modal="true" aria-label="Orbital Command Palette">
      <div class="cmd-search-bar">
        <span class="cmd-prompt-glyph">&gt;_</span>
        <input type="text" class="cmd-input" id="cmdSearchInput" placeholder="Jump to sector, launch live app, or trigger warp..." autocomplete="off" spellcheck="false" />
        <span class="cmd-esc-hint" id="cmdCloseEsc">ESC</span>
      </div>
      <div class="cmd-list" id="cmdResultsList"></div>
      <div class="cmd-footer">
        <span>↑↓ Navigate · ↵ Execute</span>
        <span>USERK8__ ORBITAL OS v2.8</span>
      </div>
    </div>
  `;
  document.body.appendChild(cmdBackdrop);

  const cmdInput = document.getElementById('cmdSearchInput');
  const cmdList = document.getElementById('cmdResultsList');
  const cmdCloseEsc = document.getElementById('cmdCloseEsc');
  let filteredCmds = COMMANDS.slice();
  let selectedIdx = 0;
  let cmdOpen = false;

  function renderCmdList(query) {
    const q = (query || '').trim().toLowerCase();
    filteredCmds = COMMANDS.filter(c =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.sub.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
    );
    selectedIdx = 0;
    if (!filteredCmds.length) {
      cmdList.innerHTML = `<div style="padding:28px 16px;text-align:center;font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);">NO MATCHING ORBITAL SIGNAL FOR "${q.replace(/[<>&"]/g, '')}"</div>`;
      return;
    }
    let lastGroup = '';
    let html = '';
    filteredCmds.forEach((c, idx) => {
      if (c.group !== lastGroup) {
        lastGroup = c.group;
        html += `<div class="cmd-group-label">${c.group}</div>`;
      }
      html += `
        <div class="cmd-item ${idx === selectedIdx ? 'selected' : ''}" data-cmd-idx="${idx}">
          <div class="cmd-item-left">
            <div class="cmd-item-icon">${c.icon}</div>
            <div style="min-width:0;">
              <div class="cmd-item-title">${c.title}</div>
              <div class="cmd-item-sub">${c.sub}</div>
            </div>
          </div>
          <span class="cmd-item-badge">${c.badge}</span>
        </div>
      `;
    });
    cmdList.innerHTML = html;
  }

  function updateCmdSelection() {
    cmdList.querySelectorAll('.cmd-item').forEach((el, i) => {
      const active = i === selectedIdx;
      el.classList.toggle('selected', active);
      if (active) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function openCmdPalette() {
    if (cmdOpen) return;
    cmdOpen = true;
    AudioEngine.open();
    cmdInput.value = '';
    renderCmdList('');
    cmdBackdrop.classList.add('open');
    requestAnimationFrame(() => {
      cmdBackdrop.classList.add('visible');
      cmdInput.focus();
    });
  }

  function closeCmdPalette() {
    if (!cmdOpen) return;
    cmdOpen = false;
    cmdBackdrop.classList.remove('visible');
    setTimeout(() => cmdBackdrop.classList.remove('open'), 200);
  }

  window.UserK8Cmd = { open: openCmdPalette, close: closeCmdPalette };

  const btnCmd = document.getElementById('btnCmdPalette');
  if (btnCmd) btnCmd.addEventListener('click', openCmdPalette);
  cmdCloseEsc.addEventListener('click', closeCmdPalette);
  cmdBackdrop.addEventListener('click', e => {
    if (e.target === cmdBackdrop) closeCmdPalette();
  });

  cmdInput.addEventListener('input', () => renderCmdList(cmdInput.value));

  cmdList.addEventListener('mousemove', e => {
    const item = e.target.closest('.cmd-item');
    if (!item) return;
    const idx = Number(item.dataset.cmdIdx);
    if (idx !== selectedIdx) {
      selectedIdx = idx;
      updateCmdSelection();
    }
  });

  cmdList.addEventListener('click', e => {
    const item = e.target.closest('.cmd-item');
    if (!item) return;
    const cmd = filteredCmds[Number(item.dataset.cmdIdx)];
    if (cmd) {
      AudioEngine.click();
      closeCmdPalette();
      cmd.action();
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdOpen ? closeCmdPalette() : openCmdPalette();
      return;
    }
    if (!cmdOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCmdPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredCmds.length) {
        selectedIdx = (selectedIdx + 1) % filteredCmds.length;
        updateCmdSelection();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredCmds.length) {
        selectedIdx = (selectedIdx - 1 + filteredCmds.length) % filteredCmds.length;
        updateCmdSelection();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCmds[selectedIdx];
      if (cmd) {
        AudioEngine.click();
        closeCmdPalette();
        cmd.action();
      }
    }
  });

  /* ── 5. 3D Specular Tilt & Magnetic Button Physics ────────────────────── */
  function bindInteractiveSurfaces() {
    if (reduceMotion) return;

    document.querySelectorAll('[data-tilt]').forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = '1';
      const maxDeg = Number(card.dataset.tiltMax) || 5.5;

      card.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const nx = (x / rect.width) * 2 - 1;
        const ny = (y / rect.height) * 2 - 1;
        card.style.setProperty('--mx', x.toFixed(1) + 'px');
        card.style.setProperty('--my', y.toFixed(1) + 'px');
        card.style.setProperty('--sheen-opacity', '1');
        card.style.transform = `perspective(1100px) rotateX(${(-ny * maxDeg).toFixed(2)}deg) rotateY(${(nx * maxDeg).toFixed(2)}deg) translateY(-3px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--sheen-opacity', '0');
        card.style.transform = '';
      });
    });

    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      if (btn.dataset.magBound) return;
      btn.dataset.magBound = '1';
      const strength = Number(btn.dataset.magnetic) || 0.22;

      btn.addEventListener('pointerenter', () => AudioEngine.hover());
      btn.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── 6. Kinetic Text Scramble Utility ─────────────────────────────────── */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_<>[]*#';
  function scrambleText(el, finalStr, durationMs) {
    if (!el || reduceMotion) {
      if (el && finalStr) el.textContent = finalStr;
      return;
    }
    const target = finalStr || el.textContent;
    const total = durationMs || 680;
    const start = performance.now();

    function step(now) {
      const p = Math.min(1, (now - start) / total);
      const locked = Math.floor(p * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') out += ' ';
        else if (i < locked) out += target[i];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  window.UserK8Scramble = scrambleText;
  window.UserK8BindSurfaces = bindInteractiveSurfaces;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindInteractiveSurfaces();
      updateScrollProgress();
    });
  } else {
    bindInteractiveSurfaces();
    updateScrollProgress();
  }
})();
