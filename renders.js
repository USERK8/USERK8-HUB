/* ── userk8__ Renders Gallery ──────────────────────────────────────────
   Drop this file next to index.html and add:
     <script src="renders.js" defer></script>
   Change MEDIA_BASE below if you put the image/video files in a subfolder.
   ------------------------------------------------------------------- */
(function () {
  const MEDIA_BASE = ''; // e.g. 'renders/' if files live in a subfolder

  // order = your list, with userk8.mp4 pinned to the very end
  const mediaFiles = [
    'death-ray-render-1.png',
    'f22-img100012.png',
    'house-2-img.png',
    'frame_001.png',
    'gc-edit-1.jpg',
    'edit-view-ps.png',
    'trailer-clip-1.mp4',
    'final_phone.mp4',
    'f22-img10001.png',
    'render-4.png',
    'userk8_wallpaper.png',
    'render-9.jpeg',
    'render-2.png',
    'render-6.png',
    'userk8.mp4'
  ];

  const items = mediaFiles.map(name => ({
    src: MEDIA_BASE + name,
    type: /\.(mp4|webm|mov)$/i.test(name) ? 'video' : 'image'
  }));

  const IMAGE_DURATION = 10000; // ms per image

  /* ── styles ── */
  const style = document.createElement('style');
  style.textContent = `
    #rendersWidget {
      position: fixed; top: 130px; left: 24px; z-index: 20;
      width: 88px; height: 88px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    #rendersWidget .stack-img {
      position: absolute; width: 72px; height: 72px;
      object-fit: cover; border-radius: 10px;
      border: 2px solid rgba(0,255,247,0.5);
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    #rendersWidget .stack-img:nth-child(2) { transform: rotate(-8deg) translate(-6px, 4px); z-index: 1; }
    #rendersWidget .stack-img:nth-child(3) { transform: rotate(5deg) translate(5px, -3px); z-index: 2; }
    #rendersWidget .stack-img:nth-child(4) { transform: rotate(-2deg); z-index: 3; }
    #rendersWidget:hover .stack-img:nth-child(2) { transform: rotate(-14deg) translate(-12px, 8px); }
    #rendersWidget:hover .stack-img:nth-child(3) { transform: rotate(10deg) translate(10px, -6px); }
    #rendersWidget:hover .stack-img:nth-child(4) { transform: rotate(-3deg) scale(1.05); }
    #rendersWidget .stack-count {
      position: absolute; bottom: -6px; right: -6px; z-index: 4;
      background: #00fff7; color: #000; font-weight: 800;
      font-size: 0.65rem; padding: 3px 7px; border-radius: 20px;
      font-family: 'Segoe UI', sans-serif;
      box-shadow: 0 0 10px rgba(0,255,247,0.6);
    }
    #rendersWidget .stack-label {
      position: absolute; top: -22px; left: 0; z-index: 4;
      font-size: 0.6rem; letter-spacing: 2px; color: #00fff7;
      opacity: 0.75; font-family: 'Segoe UI', sans-serif; white-space: nowrap;
    }
    #rendersModal {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0,0,0,0.96);
      display: none; flex-direction: column;
      opacity: 0; transition: opacity 0.25s ease;
    }
    #rendersModal.open { display: flex; }
    #rendersModal.visible { opacity: 1; }
    .rm-topbar { display: flex; align-items: center; gap: 12px; padding: 16px 20px 10px; }
    .rm-progress-track { flex: 1; height: 4px; display: flex; gap: 3px; }
    .rm-progress-seg { flex: 1; height: 100%; background: rgba(255,255,255,0.15); border-radius: 4px; position: relative; overflow: hidden; }
    .rm-progress-seg .fill { position: absolute; top:0; left:0; height:100%; width:0%; background: #00fff7; }
    .rm-btn {
      background: rgba(255,255,255,0.08); border: 1px solid rgba(0,255,247,0.4);
      color: #00fff7; width: 34px; height: 34px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1rem; flex-shrink: 0;
      transition: background 0.2s, transform 0.2s;
    }
    .rm-btn:hover { background: rgba(0,255,247,0.15); transform: translateY(-1px); }
    .rm-stage { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 10px 70px 30px; }
    .rm-stage img, .rm-stage video { max-width: 100%; max-height: 100%; border-radius: 10px; box-shadow: 0 0 40px rgba(0,255,247,0.12); }
    .rm-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.5); border: 1px solid rgba(0,255,247,0.35);
      color: #00fff7; width: 46px; height: 46px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1.3rem; z-index: 5;
      transition: background 0.2s;
    }
    .rm-nav:hover { background: rgba(0,255,247,0.18); }
    .rm-prev { left: 16px; }
    .rm-next { right: 16px; }
    @media (max-width: 600px) {
      #rendersWidget { top: 110px; left: 16px; width: 68px; height: 68px; }
      #rendersWidget .stack-img { width: 56px; height: 56px; }
      .rm-stage { padding: 10px 46px 20px; }
      .rm-nav { width: 38px; height: 38px; font-size: 1.1rem; }
    }
  `;
  document.head.appendChild(style);

  /* ── widget (photo stack trigger) ── */
  const widget = document.createElement('div');
  widget.id = 'rendersWidget';
  const thumbs = items.filter(i => i.type === 'image').slice(0, 3);
  widget.innerHTML =
    '<span class="stack-label">RENDERS</span>' +
    thumbs.map(i => `<img class="stack-img" data-src="${i.src}" alt="" decoding="async">`).join('') +
    `<span class="stack-count">${items.length}</span>`;
  document.body.appendChild(widget);

  // don't pay the full-resolution decode cost for these tiny 72px thumbnails
  // until the browser is actually idle — they're not critical on first paint
  const loadThumbs = () => {
    widget.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(loadThumbs, { timeout: 2000 });
  else setTimeout(loadThumbs, 1200);

  /* ── modal / lightbox ── */
  const modal = document.createElement('div');
  modal.id = 'rendersModal';
  modal.innerHTML = `
    <div class="rm-topbar">
      <div class="rm-progress-track" id="rmTrack"></div>
      <div class="rm-btn" id="rmPlayPause" title="Play/Pause">⏸</div>
      <div class="rm-btn" id="rmMute" title="Mute/Unmute">🔇</div>
      <div class="rm-btn" id="rmClose" title="Close (Esc)">✕</div>
    </div>
    <div class="rm-stage">
      <div class="rm-nav rm-prev" id="rmPrev" title="Previous (←)">‹</div>
      <div id="rmMediaHolder"></div>
      <div class="rm-nav rm-next" id="rmNext" title="Next (→)">›</div>
    </div>
  `;
  document.body.appendChild(modal);

  const trackEl = modal.querySelector('#rmTrack');
  items.forEach(() => {
    const seg = document.createElement('div');
    seg.className = 'rm-progress-seg';
    seg.innerHTML = '<div class="fill"></div>';
    trackEl.appendChild(seg);
  });
  const segs = Array.from(trackEl.querySelectorAll('.rm-progress-seg'));

  const mediaHolder = modal.querySelector('#rmMediaHolder');
  const playPauseBtn = modal.querySelector('#rmPlayPause');
  const muteBtn = modal.querySelector('#rmMute');
  const closeBtn = modal.querySelector('#rmClose');
  const prevBtn = modal.querySelector('#rmPrev');
  const nextBtn = modal.querySelector('#rmNext');

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
      v.load(); // forces the browser to actually drop the decoded/buffered frames
    } catch (e) { /* no-op */ }
  }

  function setFill(pct) {
    segs[currentIndex].querySelector('.fill').style.width = (pct * 100) + '%';
  }

  function openModal(startIndex) {
    currentIndex = startIndex || 0;
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
    if (activeVideoEl) { releaseVideo(activeVideoEl); activeVideoEl = null; }
    document.body.style.overflow = '';
    setTimeout(() => modal.classList.remove('open'), 250);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  }

  function loadSlide(index) {
    stopTicker();
    if (activeVideoEl) { releaseVideo(activeVideoEl); activeVideoEl = null; }
    mediaHolder.innerHTML = '';
    segs.forEach((s, i) => {
      s.querySelector('.fill').style.width = i < index ? '100%' : '0%';
    });

    const item = items[index];
    playing = true;
    playPauseBtn.textContent = '⏸';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.decoding = 'async';
      img.src = item.src;
      img.alt = '';
      mediaHolder.appendChild(img);
      currentDuration = IMAGE_DURATION;
      elapsedMs = 0;
      startImageTicker();
    } else {
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
    if (currentIndex < items.length - 1) loadSlide(++currentIndex);
    else closeModal();
  }
  function goPrev() {
    if (currentIndex > 0) loadSlide(--currentIndex);
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

  widget.addEventListener('click', () => openModal(0));
  closeBtn.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
  playPauseBtn.addEventListener('click', togglePlay);
  muteBtn.addEventListener('click', toggleMute);
})();
