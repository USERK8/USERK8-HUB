(function () {
  'use strict';

  const MEDIA_BASE = '../../assets/';

  const mediaCatalog = [
    { file: 'death-ray-render-1.png', title: 'AH-64 Tactical Capture', tag: 'DEATH RAY // 3D' },
    { file: 'f22-img100012.png',      title: 'F-22 Raptor — Dusk Intercept', tag: 'AEROSPACE // 3D' },
    { file: 'house-2-img.png',        title: 'Dead Zone Outpost Compound', tag: 'ENVIRONMENT // 3D' },
    { file: 'frame_001.png',          title: 'Sequence Frame 001', tag: 'CINEMATIC // STILL' },
    { file: 'gc-edit-1.jpg',          title: 'Visual Grade Study', tag: 'COMPOSITING' },
    { file: 'edit-view-ps.png',       title: 'Viewport & Post Pipeline', tag: 'WORKFLOW' },
    { file: 'trailer-clip-1.mp4',     title: 'Tactical Sequence Reel', tag: 'MOTION // MP4' },
    { file: 'final_phone.mp4',        title: 'Hardware Showcase Motion', tag: 'MOTION // MP4' },
    { file: 'f22-img10001.png',       title: 'F-22 Twin-Tail Silhouette', tag: 'AEROSPACE // 3D' },
    { file: 'render-4.png',           title: 'Lighting & Surface Study IV', tag: '3D RENDER' },
    { file: 'userk8_wallpaper.png',   title: 'Garuda Zen OS Rig Wallpaper', tag: 'SYSTEM // RIG' },
    { file: 'render-9.jpeg',          title: 'Atmospheric Render IX', tag: '3D RENDER' },
    { file: 'render-2.png',           title: 'Scene Study II', tag: '3D RENDER' },
    { file: 'render-6.png',           title: 'Linux Engineering Desk Frame', tag: 'WORKSPACE // 3D' },
    { file: 'userk8.mp4',             title: 'userk8__ Signature Finale', tag: 'FINALE // MP4' }
  ];

  const items = mediaCatalog.map((entry, idx) => ({
    index: idx,
    src: MEDIA_BASE + entry.file,
    file: entry.file,
    title: entry.title,
    tag: entry.tag,
    type: /\.(mp4|webm|mov)$/i.test(entry.file) ? 'video' : 'image'
  }));

  const IMAGE_DURATION = 10000;

  const style = document.createElement('style');
  style.textContent = `
    #rendersWidget {
      position: fixed;
      bottom: 26px;
      left: 26px;
      z-index: 90;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 16px 10px 12px;
      border-radius: 20px;
      background: rgba(8, 15, 28, 0.78);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(223, 244, 255, 0.16);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.25s ease, box-shadow 0.25s ease;
      user-select: none;
    }
    #rendersWidget:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 240, 230, 0.55);
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.75), 0 0 26px rgba(0, 240, 230, 0.18);
    }
    .rw-stack {
      position: relative;
      width: 58px;
      height: 52px;
      flex-shrink: 0;
    }
    #rendersWidget .stack-img {
      position: absolute;
      top: 2px;
      left: 5px;
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 10px;
      border: 1.5px solid rgba(223, 244, 255, 0.35);
      background: #0b1526;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.65);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease;
    }
    #rendersWidget .stack-img:nth-child(1) { transform: rotate(-9deg) translate(-6px, 3px); z-index: 1; }
    #rendersWidget .stack-img:nth-child(2) { transform: rotate(6deg) translate(6px, -2px); z-index: 2; }
    #rendersWidget .stack-img:nth-child(3) { transform: rotate(-1deg); z-index: 3; border-color: rgba(0, 240, 230, 0.65); }

    #rendersWidget:hover .stack-img:nth-child(1) { transform: rotate(-16deg) translate(-13px, 5px); }
    #rendersWidget:hover .stack-img:nth-child(2) { transform: rotate(13deg) translate(13px, -5px); }
    #rendersWidget:hover .stack-img:nth-child(3) { transform: rotate(-2deg) scale(1.08); }

    .rw-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .rw-eyebrow {
      font-family: 'DM Mono', monospace;
      font-size: 0.64rem;
      letter-spacing: 0.16em;
      color: #00f0e6;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .rw-title {
      font-family: 'Space Grotesk', 'Sora', sans-serif;
      font-size: 0.86rem;
      font-weight: 600;
      color: #f2f8ff;
      white-space: nowrap;
    }
    .rw-count {
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(0, 240, 230, 0.16);
      border: 1px solid rgba(0, 240, 230, 0.4);
      color: #dff4ff;
      font-size: 0.62rem;
    }

    #rendersModal {
      position: fixed;
      inset: 0;
      z-index: 10010;
      background: rgba(3, 6, 12, 0.96);
      -webkit-backdrop-filter: blur(26px);
      backdrop-filter: blur(26px);
      display: none;
      flex-direction: column;
      opacity: 0;
      transition: opacity 0.28s ease;
    }
    #rendersModal.open { display: flex; }
    #rendersModal.visible { opacity: 1; }

    .rm-ambient {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.22;
      filter: blur(70px) saturate(160%);
      transform: scale(1.15);
      background-position: center;
      background-size: cover;
      transition: background-image 0.45s ease;
    }

    .rm-topbar {
      position: relative;
      z-index: 3;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 22px 10px;
    }
    .rm-progress-track {
      width: 100%;
      height: 3px;
      display: flex;
      gap: 4px;
    }
    .rm-progress-seg {
      flex: 1;
      height: 100%;
      background: rgba(223, 244, 255, 0.16);
      border-radius: 999px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .rm-progress-seg .fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #00f0e6, #dff4ff);
      box-shadow: 0 0 8px rgba(0, 240, 230, 0.8);
    }

    .rm-hud-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .rm-caption-group {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .rm-slide-counter {
      font-family: 'DM Mono', monospace;
      font-size: 0.75rem;
      color: #00f0e6;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(0, 240, 230, 0.1);
      border: 1px solid rgba(0, 240, 230, 0.3);
      white-space: nowrap;
    }
    .rm-slide-info {
      min-width: 0;
    }
    .rm-slide-title {
      font-family: 'Space Grotesk', 'Sora', sans-serif;
      font-size: 0.98rem;
      font-weight: 600;
      color: #f2f8ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rm-slide-tag {
      font-family: 'DM Mono', monospace;
      font-size: 0.66rem;
      letter-spacing: 0.12em;
      color: #8ea6c2;
    }

    .rm-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .rm-btn {
      background: rgba(223, 244, 255, 0.07);
      border: 1px solid rgba(223, 244, 255, 0.18);
      color: #dff4ff;
      height: 36px;
      min-width: 36px;
      padding: 0 10px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: 'DM Mono', monospace;
      font-size: 0.82rem;
      transition: all 0.2s ease;
    }
    .rm-btn:hover {
      background: rgba(0, 240, 230, 0.16);
      border-color: rgba(0, 240, 230, 0.55);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .rm-stage {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 8px 76px 12px;
      min-height: 0;
    }
    #rmMediaHolder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rm-stage img,
    .rm-stage video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 14px;
      border: 1px solid rgba(223, 244, 255, 0.14);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.78);
      animation: rmMediaReveal 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes rmMediaReveal {
      from { opacity: 0; transform: scale(0.975); }
      to   { opacity: 1; transform: scale(1); }
    }

    .rm-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(8, 16, 30, 0.72);
      border: 1px solid rgba(223, 244, 255, 0.2);
      color: #dff4ff;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.4rem;
      z-index: 5;
      transition: all 0.22s ease;
    }
    .rm-nav:hover {
      background: rgba(0, 240, 230, 0.2);
      border-color: #00f0e6;
      color: #fff;
      transform: translateY(-50%) scale(1.06);
    }
    .rm-prev { left: 18px; }
    .rm-next { right: 18px; }

    .rm-filmstrip {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 20px 18px;
      overflow-x: auto;
    }
    .rm-pill-dot {
      height: 28px;
      padding: 0 10px;
      border-radius: 8px;
      background: rgba(223, 244, 255, 0.05);
      border: 1px solid rgba(223, 244, 255, 0.12);
      color: #8ea6c2;
      font-family: 'DM Mono', monospace;
      font-size: 0.68rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .rm-pill-dot:hover {
      border-color: rgba(223, 244, 255, 0.35);
      color: #fff;
    }
    .rm-pill-dot.active {
      background: rgba(0, 240, 230, 0.16);
      border-color: #00f0e6;
      color: #dff4ff;
      box-shadow: 0 0 14px rgba(0, 240, 230, 0.24);
    }

    @media (max-width: 680px) {
      #rendersWidget {
        bottom: 18px;
        left: 16px;
        padding: 8px 12px 8px 10px;
        gap: 10px;
      }
      .rw-stack { width: 46px; height: 42px; }
      #rendersWidget .stack-img { width: 38px; height: 38px; }
      .rw-title { font-size: 0.78rem; }
      .rm-stage { padding: 8px 14px; }
      .rm-nav { width: 38px; height: 38px; font-size: 1.15rem; }
      .rm-prev { left: 10px; }
      .rm-next { right: 10px; }
      .rm-filmstrip { justify-content: flex-start; }
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div');
  widget.id = 'rendersWidget';
  widget.setAttribute('role', 'button');
  widget.setAttribute('tabindex', '0');
  widget.setAttribute('aria-label', 'Open 15-item 3D Renders and Motion Vault');

  const EMPTY_PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const thumbs = items.filter(i => i.type === 'image').slice(0, 3);
  widget.innerHTML = `
    <div class="rw-stack" aria-hidden="true">
      ${thumbs.map(i => `<img class="stack-img" src="${EMPTY_PX}" data-src="${i.src}" alt="" decoding="async">`).join('')}
    </div>
    <div class="rw-meta">
      <div class="rw-eyebrow"><span>VAULT</span><span class="rw-count">${items.length}</span></div>
      <div class="rw-title">3D Renders &amp; Reels</div>
    </div>
  `;
  document.body.appendChild(widget);

  const loadThumbs = () => {
    widget.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(loadThumbs, { timeout: 2000 });
  else setTimeout(loadThumbs, 1200);

  const modal = document.createElement('div');
  modal.id = 'rendersModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="rm-ambient" id="rmAmbient"></div>
    <div class="rm-topbar">
      <div class="rm-progress-track" id="rmTrack"></div>
      <div class="rm-hud-row">
        <div class="rm-caption-group">
          <span class="rm-slide-counter" id="rmCounter">01 / 15</span>
          <div class="rm-slide-info">
            <div class="rm-slide-title" id="rmSlideTitle">Render</div>
            <div class="rm-slide-tag" id="rmSlideTag">3D RENDER</div>
          </div>
        </div>
        <div class="rm-controls">
          <button type="button" class="rm-btn" id="rmPlayPause" title="Play / Pause (Space)">⏸</button>
          <button type="button" class="rm-btn" id="rmMute" title="Mute / Unmute Video (M)">🔇</button>
          <button type="button" class="rm-btn" id="rmClose" title="Close Vault (Esc)">✕</button>
        </div>
      </div>
    </div>
    <div class="rm-stage" id="rmStage">
      <button type="button" class="rm-nav rm-prev" id="rmPrev" aria-label="Previous slide">‹</button>
      <div id="rmMediaHolder"></div>
      <button type="button" class="rm-nav rm-next" id="rmNext" aria-label="Next slide">›</button>
    </div>
    <div class="rm-filmstrip" id="rmFilmstrip"></div>
  `;
  document.body.appendChild(modal);

  const ambientEl = modal.querySelector('#rmAmbient');
  const trackEl = modal.querySelector('#rmTrack');
  const filmstripEl = modal.querySelector('#rmFilmstrip');
  const counterEl = modal.querySelector('#rmCounter');
  const titleEl = modal.querySelector('#rmSlideTitle');
  const tagEl = modal.querySelector('#rmSlideTag');
  const mediaHolder = modal.querySelector('#rmMediaHolder');
  const playPauseBtn = modal.querySelector('#rmPlayPause');
  const muteBtn = modal.querySelector('#rmMute');
  const closeBtn = modal.querySelector('#rmClose');
  const prevBtn = modal.querySelector('#rmPrev');
  const nextBtn = modal.querySelector('#rmNext');
  const stageEl = modal.querySelector('#rmStage');

  items.forEach((item, idx) => {
    const seg = document.createElement('div');
    seg.className = 'rm-progress-seg';
    seg.title = item.title;
    seg.innerHTML = '<div class="fill"></div>';
    seg.addEventListener('click', () => loadSlide(idx));
    trackEl.appendChild(seg);

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'rm-pill-dot';
    pill.innerHTML = `<span>${String(idx + 1).padStart(2, '0')}</span><span>${item.type === 'video' ? '▶' : '◈'}</span>`;
    pill.title = item.title;
    pill.addEventListener('click', () => loadSlide(idx));
    filmstripEl.appendChild(pill);
  });

  const segs = Array.from(trackEl.querySelectorAll('.rm-progress-seg'));
  const pills = Array.from(filmstripEl.querySelectorAll('.rm-pill-dot'));

  let currentIndex = 0;
  let playing = true;
  let muted = true;
  let rafId = null;
  let elapsedMs = 0;
  let currentDuration = IMAGE_DURATION;
  let activeVideoEl = null;

  function releaseVideo(v) {
    if (!v) return;
    try {
      v.pause();
      v.removeAttribute('src');
      v.load();
    } catch (_) {}
  }

  function setFill(pct) {
    if (segs[currentIndex]) {
      segs[currentIndex].querySelector('.fill').style.width = (pct * 100) + '%';
    }
  }

  function openModal(startIndex) {
    if (window.UserK8Audio) window.UserK8Audio.open();
    currentIndex = typeof startIndex === 'number' ? Math.max(0, Math.min(items.length - 1, startIndex)) : 0;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('visible'));
    document.addEventListener('keydown', onKeydown);
    loadSlide(currentIndex);
  }

  function closeModal() {
    modal.classList.remove('visible');
    document.removeEventListener('keydown', onKeydown);
    stopTicker();
    if (activeVideoEl) {
      releaseVideo(activeVideoEl);
      activeVideoEl = null;
    }
    document.body.style.overflow = '';
    if (location.hash === '#renders') {
      history.replaceState(null, '', location.pathname + location.search);
    }
    setTimeout(() => modal.classList.remove('open'), 260);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key.toLowerCase() === 'm') toggleMute();
  }

  function loadSlide(index) {
    stopTicker();
    if (activeVideoEl) {
      releaseVideo(activeVideoEl);
      activeVideoEl = null;
    }
    currentIndex = index;
    mediaHolder.innerHTML = '';

    segs.forEach((s, i) => {
      s.querySelector('.fill').style.width = i < index ? '100%' : '0%';
    });
    pills.forEach((p, i) => {
      const active = i === index;
      p.classList.toggle('active', active);
      if (active) p.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });

    const item = items[index];
    counterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    titleEl.textContent = item.title;
    tagEl.textContent = `${item.tag} · ${item.file}`;

    playing = true;
    playPauseBtn.textContent = '⏸';

    if (item.type === 'image') {
      ambientEl.style.backgroundImage = `url("${item.src}")`;
      const img = document.createElement('img');
      img.decoding = 'async';
      img.src = item.src;
      img.alt = item.title;
      mediaHolder.appendChild(img);
      currentDuration = IMAGE_DURATION;
      elapsedMs = 0;
      startImageTicker();
    } else {
      ambientEl.style.backgroundImage = 'none';
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = item.src;
      video.muted = muted;
      video.playsInline = true;
      video.autoplay = true;
      mediaHolder.appendChild(video);
      activeVideoEl = video;
      currentDuration = 10000;
      video.addEventListener('loadedmetadata', () => {
        currentDuration = (video.duration || 10) * 1000;
      });
      video.addEventListener('ended', goNext);
      video.play().catch(() => {});
      startVideoTicker();
    }
  }

  function startImageTicker() {
    let last = null;
    function tick(ts) {
      if (last === null) last = ts;
      const dt = ts - last;
      last = ts;
      if (playing) elapsedMs += dt;
      const pct = Math.min(elapsedMs / currentDuration, 1);
      setFill(pct);
      if (pct >= 1) { goNext(); return; }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function startVideoTicker() {
    function tick() {
      if (activeVideoEl) {
        const pct = Math.min((activeVideoEl.currentTime * 1000) / currentDuration, 1);
        setFill(pct);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopTicker() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function goNext() {
    if (window.UserK8Audio) window.UserK8Audio.click();
    if (currentIndex < items.length - 1) loadSlide(currentIndex + 1);
    else closeModal();
  }

  function goPrev() {
    if (window.UserK8Audio) window.UserK8Audio.click();
    if (currentIndex > 0) loadSlide(currentIndex - 1);
  }

  function togglePlay() {
    playing = !playing;
    playPauseBtn.textContent = playing ? '⏸' : '▶';
    if (activeVideoEl) {
      if (playing) activeVideoEl.play().catch(() => {});
      else activeVideoEl.pause();
    }
  }

  function toggleMute() {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    if (activeVideoEl) activeVideoEl.muted = muted;
  }

  let touchStartX = 0;
  stageEl.addEventListener('touchstart', e => {
    if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
  }, { passive: true });
  stageEl.addEventListener('touchend', e => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }, { passive: true });

  widget.addEventListener('mouseenter', () => {
    if (window.UserK8Audio) window.UserK8Audio.hover();
  });
  widget.addEventListener('click', () => openModal(0));
  widget.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(0);
    }
  });

  closeBtn.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
  playPauseBtn.addEventListener('click', togglePlay);
  muteBtn.addEventListener('click', toggleMute);

  window.UserK8Renders = {
    open: openModal,
    close: closeModal,
    count: items.length
  };

  if (location.hash === '#renders') {
    setTimeout(() => openModal(0), 220);
  }
  window.addEventListener('hashchange', () => {
    if (location.hash === '#renders') openModal(0);
  });
})();