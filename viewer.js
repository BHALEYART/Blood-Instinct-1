(function () {
  'use strict';

  // ---- Pages -------------------------------------------------------------
  // To add pages: drop panelN.jpg in the repo root, then run the image script
  // in the README (or add matching files to web/ and thumbs/), and add the
  // base name here.
  const PAGES = [
    'cover1',
    'panel1', 'panel2', 'panel3', 'panel4', 'panel5',
    'panel6', 'panel7', 'panel8', 'panel9', 'panel10',
    'panel11', 'panel12', 'panel13', 'panel14', 'panel15',
    'panel16', 'panel17', 'panel18', 'panel19', 'panel20'
  ];

  const TITLE = 'Blood Instinct #1';
  const STORE_KEY = 'bi1:state';
  const END = PAGES.length; // virtual index for the end card

  const webSrc = (n) => `web/${n}.webp`;
  const fullSrc = (n) => `${n}.jpg`;
  const thumbSrc = (n) => `thumbs/${n}.webp`;
  const label = (i) => (i === 0 ? 'Cover' : i === END ? 'The End' : `Page ${i}`);
  // "Page " is wrapped so small screens can show a compact "3 of 20"
  const counterHTML = (i) => (i === 0 || i === END ? label(i) : `<span class="word">Page </span>${i} of ${END - 1}`);

  // ---- Elements ----------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const body = document.body;
  const img = $('pageImg');
  const frame = $('frame');
  const pageView = $('pageView');
  const scrollView = $('scrollView');
  const endCard = $('endCard');
  const counter = $('counter');
  const progressFill = $('progressFill');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const zoomBtn = $('zoomBtn');
  const modeBtn = $('modeBtn');
  const gridBtn = $('gridBtn');
  const grid = $('grid');
  const gridList = $('gridList');

  // ---- State -------------------------------------------------------------
  const saved = load();
  let index = 0;
  let zoomed = false;
  let scrollMode = !!saved.scroll;
  let loadToken = 0;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ page: index, scroll: scrollMode })); } catch (e) { /* storage unavailable */ }
  }

  function indexFromHash() {
    const m = location.hash.match(/^#(?:page-)?(\d+|cover|end)$/i);
    if (!m) return null;
    const v = m[1].toLowerCase();
    if (v === 'cover') return 0;
    if (v === 'end') return END;
    return clamp(parseInt(v, 10));
  }
  const hashFor = (i) => (i === 0 ? '#cover' : i === END ? '#end' : `#page-${i}`);
  const clamp = (i) => Math.max(0, Math.min(END, i));

  // ---- Preloading --------------------------------------------------------
  const cache = new Map();
  function preload(i) {
    if (i < 0 || i >= END || cache.has(i)) return;
    const im = new Image();
    im.decoding = 'async';
    im.src = webSrc(PAGES[i]);
    cache.set(i, im);
  }

  // ---- Render ------------------------------------------------------------
  function updateChrome() {
    counter.innerHTML = counterHTML(index);
    document.title = index === 0 ? TITLE : `${label(index)} — ${TITLE}`;
    progressFill.style.width = `${(Math.min(index, END - 1) / (END - 1)) * 100}%`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === END;
    gridList.querySelectorAll('button').forEach((b, i) => {
      if (i === index) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  function show(i, opts = {}) {
    i = clamp(i);
    const changed = i !== index;
    index = i;

    if (!scrollMode) {
      const atEnd = index === END;
      endCard.hidden = !atEnd;
      pageView.hidden = atEnd;
      if (!atEnd) setImage();
      if (changed) window.scrollTo(0, 0);
    } else if (opts.scroll) {
      const target = index === END ? endCard : scrollView.children[index];
      if (target) target.scrollIntoView({ block: 'start' });
    }

    updateChrome();
    if (opts.history !== false) {
      const h = hashFor(index);
      if (location.hash !== h) history[opts.replace ? 'replaceState' : 'pushState'](null, '', h);
    }
    save();
    preload(index + 1); preload(index + 2); preload(index - 1);
  }

  function setImage() {
    const name = PAGES[index];
    const src = zoomed ? fullSrc(name) : webSrc(name);
    img.alt = `${TITLE} — ${label(index)}`;
    if (img.getAttribute('src') === src && img.complete) return;
    const token = ++loadToken;
    frame.classList.add('loading');
    const done = () => { if (token === loadToken) frame.classList.remove('loading'); };
    img.onload = done;
    img.onerror = done;
    img.src = src;
  }

  const next = () => show(index + 1);
  const prev = () => show(index - 1);

  // ---- Zoom --------------------------------------------------------------
  function setZoom(on) {
    if (scrollMode && on) return;
    zoomed = on;
    body.classList.toggle('zoomed', on);
    zoomBtn.setAttribute('aria-pressed', String(on));
    if (index < END) setImage();
  }

  // ---- Scroll mode -------------------------------------------------------
  let scrollBuilt = false;
  let observer = null;

  function buildScroll() {
    if (scrollBuilt) return;
    scrollBuilt = true;
    const frag = document.createDocumentFragment();
    PAGES.forEach((name, i) => {
      const im = document.createElement('img');
      im.src = webSrc(name);
      im.alt = `${TITLE} — ${label(i)}`;
      im.width = 1200; im.height = 1632;
      im.loading = i < 2 ? 'eager' : 'lazy';
      im.decoding = 'async';
      im.dataset.index = i;
      frag.appendChild(im);
    });
    scrollView.appendChild(frag);
  }

  function watchScroll() {
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
      // Track whichever page crosses the middle of the viewport
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = e.target === endCard ? END : Number(e.target.dataset.index);
        if (i !== index) show(i, { replace: true });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    scrollView.querySelectorAll('img').forEach((im) => observer.observe(im));
    observer.observe(endCard);
  }

  function setScrollMode(on) {
    scrollMode = on;
    if (on) setZoom(false);
    body.classList.toggle('scroll-mode', on);
    modeBtn.setAttribute('aria-pressed', String(on));
    zoomBtn.disabled = on;
    scrollView.hidden = !on;
    if (observer) { observer.disconnect(); observer = null; }
    if (on) {
      buildScroll();
      endCard.hidden = false;
      pageView.hidden = false;
      // Move the end card below the strip
      scrollView.after(endCard);
      requestAnimationFrame(() => {
        show(index, { scroll: true, replace: true });
        watchScroll();
      });
    } else {
      show(index, { replace: true });
    }
    save();
  }

  // ---- Page grid ---------------------------------------------------------
  function buildGrid() {
    const frag = document.createDocumentFragment();
    PAGES.forEach((name, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<img src="${thumbSrc(name)}" alt="" width="220" height="299" loading="lazy"><span>${label(i)}</span>`;
      b.setAttribute('aria-label', `Go to ${label(i)}`);
      b.addEventListener('click', () => { closeGrid(); show(i, { scroll: true }); });
      li.appendChild(b);
      frag.appendChild(li);
    });
    gridList.appendChild(frag);
  }

  function openGrid() {
    grid.hidden = false;
    gridBtn.setAttribute('aria-expanded', 'true');
    const cur = gridList.querySelector('[aria-current="page"]') || gridList.querySelector('button');
    if (cur) { cur.focus(); cur.scrollIntoView({ block: 'center' }); }
  }
  function closeGrid() {
    grid.hidden = true;
    gridBtn.setAttribute('aria-expanded', 'false');
    gridBtn.focus();
  }

  // ---- Fullscreen --------------------------------------------------------
  function toggleFullscreen() {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }

  // ---- Events ------------------------------------------------------------
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  zoomBtn.addEventListener('click', () => setZoom(!zoomed));
  modeBtn.addEventListener('click', () => setScrollMode(!scrollMode));
  gridBtn.addEventListener('click', openGrid);
  $('gridClose').addEventListener('click', closeGrid);
  $('fsBtn').addEventListener('click', toggleFullscreen);
  $('restartBtn').addEventListener('click', () => show(0, { scroll: true }));

  // Tap/click the page: left third goes back, the rest goes forward
  frame.addEventListener('click', (e) => {
    if (swiped) return;
    const r = frame.getBoundingClientRect();
    (e.clientX - r.left < r.width / 3) ? prev() : next();
  });

  // Swipe (single-page mode, not zoomed so pinch/pan stays native)
  let sx = 0, sy = 0, swiped = false;
  pageView.addEventListener('touchstart', (e) => {
    swiped = false;
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  pageView.addEventListener('touchend', (e) => {
    if (zoomed || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      dx < 0 ? next() : prev();
      setTimeout(() => { swiped = false; }, 350);
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!grid.hidden) { if (e.key === 'Escape') closeGrid(); return; }
    if (e.target.closest('input, textarea')) return;
    switch (e.key) {
      case 'ArrowRight': case 'd': case 'D': case 'PageDown':
        if (!scrollMode) { e.preventDefault(); next(); } break;
      case 'ArrowLeft': case 'a': case 'A': case 'PageUp':
        if (!scrollMode) { e.preventDefault(); prev(); } break;
      case ' ':
        if (!scrollMode && !zoomed) { e.preventDefault(); e.shiftKey ? prev() : next(); } break;
      case 'Home': if (!scrollMode) { e.preventDefault(); show(0); } break;
      case 'End': if (!scrollMode) { e.preventDefault(); show(END - 1); } break;
      case 'z': case 'Z': setZoom(!zoomed); break;
      case 's': case 'S': setScrollMode(!scrollMode); break;
      case 'g': case 'G': openGrid(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape': if (zoomed) setZoom(false); break;
    }
  });

  window.addEventListener('popstate', () => {
    const i = indexFromHash();
    show(i === null ? 0 : i, { history: false, scroll: true });
  });

  // ---- Init --------------------------------------------------------------
  buildGrid();
  const fromHash = indexFromHash();
  const start = fromHash !== null ? fromHash
    : (Number.isInteger(saved.page) ? clamp(saved.page) : 0);
  index = start;
  if (scrollMode) setScrollMode(true);
  else show(start, { replace: true });
})();
