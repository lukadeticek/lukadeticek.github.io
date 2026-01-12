/* ============================================================
   Luka Detiček — site JS (FULL, with film reel mobile fix)
   ============================================================ */

/* 0) Mark JS + load nudge */
(function () {
  document.documentElement.classList.add('js');
  window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('loaded');
  });
})();

/* 1) is-home flag */
(function () {
  var p = location.pathname.replace(/\/+$/, '');
  if (p === '' || p === '/' || /\/index\.html?$/.test(p)) {
    document.body.classList.add('is-home');
  }
})();

/* 2) Reveal on scroll */
(function () {
  const revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-inview'));
  }
})();

/* 2b) Hero portrait in-view animation */
(function () {
  const portrait = document.querySelector('.hero-portrait');
  if (!portrait) return;

  const trigger = () => {
    portrait.classList.remove('is-animating');
    void portrait.offsetWidth;
    portrait.classList.add('is-animating');
  };

  if ('IntersectionObserver' in window) {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          portrait.classList.remove('is-out');
          trigger();
        } else {
          portrait.classList.add('is-out');
        }
      });
    }, { rootMargin: '0px 0px -35% 0px', threshold: 0.01 });
    io.observe(hero);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      portrait.classList.remove('is-out');
      trigger();
    });
  }
})();

/* 3) :has() fallback for gallery invert */
(function () {
  const supportsHas = CSS && CSS.supports && CSS.supports(':has(*)');
  if (supportsHas) return;
  const docEl = document.documentElement;
  const cards = document.querySelectorAll('.gallery .card');
  const on = () => docEl.classList.add('invert');
  const off = () => docEl.classList.remove('invert');
  cards.forEach((card) => {
    card.addEventListener('mouseenter', on);
    card.addEventListener('mouseleave', off);
    card.addEventListener('focus', on, true);
    card.addEventListener('blur', off, true);
  });
})();

/* 4) Popup links */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a.popup-link');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^(mailto:|tel:)/i.test(href)) return;
  e.preventDefault();
  const popupWidth = 1200, popupHeight = 600;
  const left = window.screen.width - popupWidth - 100;
  const top = Math.max((window.screen.height - popupHeight) / 2, 0);
  window.open(
    href,
    'popup',
    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=no,resizable=no`
  );
});

/* 5) Hide floating contact button when #contact visible */
document.addEventListener('DOMContentLoaded', () => {
  const contactButton = document.querySelector('.contact-button');
  const contactSection = document.querySelector('#contact');
  if (!contactButton || !contactSection) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => contactButton.classList.toggle('is-hidden', e.isIntersecting));
  }, { threshold: 0.2 });
  observer.observe(contactSection);
});

/* 6) Contact rail logic (consolidated) */
document.addEventListener('DOMContentLoaded', () => {
  const rail = document.querySelector('.contact-rail');
  const contact = document.querySelector('#contact');
  if (!rail) return;
  const isHome = document.body.classList.contains('is-home');
  rail.classList.remove('is-near-top', 'at-top');

  const TOP_FADE_DISTANCE = 500;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      if (!isHome) {
        rail.classList.toggle('is-near-top', y < TOP_FADE_DISTANCE);
      }
      ticking = false;
    });
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (contact && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => rail.classList.toggle('is-hidden', e.isIntersecting));
    }, { threshold: 0.25 });
    io.observe(contact);
  }
});

/* 7) FILM REEL — perfect loop (transform), hover speed, drag/swipe + mobile autoplay fix */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#filmReel');
  if (!root) return;

  const reel  = root.querySelector('.reel');        // container (no scroll)
  const track = root.querySelector('.reel__track'); // inline-flex row
  if (!reel || !track) return;

  /* ---- Tunables ---- */
  const BASE_SPEED_PX_S  = 60;   // >0 moves left; <0 moves right
  const HOVER_SPEED_PX_S = 130;  // same sign as base
  const RESUME_DELAY_MS  = 120;
  const RESPECT_PREFERS_REDUCED_MOTION = false;

  let speed = BASE_SPEED_PX_S;
  let phase = 0;  // 0..W
  let W = 0;      // width of ONE set (we clone to make A+A)
  let lastTs = 0;
  let playing = shouldPlay();
  let resumeTimer = null;

  function shouldPlay() {
    return !document.hidden && (
      RESPECT_PREFERS_REDUCED_MOTION
        ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : true
    );
  }

  /* --- Mobile autoplay helper: ensure videos try to play --- */
  const videos = track.querySelectorAll('video');

  function tryPlayAll() {
    videos.forEach((v) => {
      // force safe autoplay settings
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Ignore autoplay errors; user interaction fallback below
        });
      }
    });
  }

  // Initial attempt on load
  tryPlayAll();

  // Fallback: on first user interaction, retry autoplay (for strict mobile policies)
  const kickstart = () => {
    tryPlayAll();
    window.removeEventListener('touchstart', kickstart);
    window.removeEventListener('click', kickstart);
  };
  window.addEventListener('touchstart', kickstart, { once: true });
  window.addEventListener('click', kickstart, { once: true });

  // --- 1) Ensure we have EXACTLY A + A (clone for perfect loop) ---
  function ensureDuplicate() {
    const children = Array.from(track.children);
    if (children.length === 0) return;

    const half = Math.floor(children.length / 2);
    const isAlreadyDup =
      children.length % 2 === 0 &&
      children.slice(0, half).every((el, i) => {
        const a = el.getAttribute('src');
        const b = children[i + half]?.getAttribute('src');
        return a && b && a === b;
      });

    if (!isAlreadyDup) {
      const originals = Array.from(track.children);
      track.innerHTML = '';
      originals.forEach((n) => track.appendChild(n));
      originals.forEach((n) => track.appendChild(n.cloneNode(true)));
    }
  }

  // --- 2) Measure width of ONE set ---
  function measureW() {
    W = track.scrollWidth / 2;
  }

  // --- 3) Apply transform from phase (rounded to avoid seams) ---
  function applyTransform() {
    const x = -Math.round(phase * 1000) / 1000;
    track.style.transform = `translate3d(${x}px,0,0)`;
  }

  // --- 4) Animation loop ---
  function tick(ts) {
    if (!playing || W <= 0) {
      lastTs = 0;
      requestAnimationFrame(tick);
      return;
    }
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    phase += speed * dt;
    phase %= W;
    if (phase < 0) phase += W;

    applyTransform();
    requestAnimationFrame(tick);
  }

  // --- Hover speed (preserve direction) ---
  root.addEventListener('mouseenter', () => {
    speed = Math.sign(BASE_SPEED_PX_S || 1) * Math.abs(HOVER_SPEED_PX_S);
  });
  root.addEventListener('mouseleave', () => {
    speed = BASE_SPEED_PX_S;
  });

  // --- Visibility / reduced motion ---
  document.addEventListener('visibilitychange', () => {
    playing = shouldPlay();
    lastTs = 0;
  });

  if (RESPECT_PREFERS_REDUCED_MOTION) {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    mql.addEventListener?.('change', () => {
      playing = shouldPlay();
      lastTs = 0;
    });
  }

  // --- Resize observer: recompute W, keep continuity ---
  const ro = new ResizeObserver(() => {
    const prev = W;
    measureW();
    if (W > 0 && prev > 0 && W !== prev) {
      phase = ((phase % W) + W) % W;
      applyTransform();
    }
  });
  ro.observe(track);

  // Videos: re-measure once their dimensions are known
  videos.forEach((v) => {
    v.addEventListener('loadedmetadata', () => {
      measureW();
      applyTransform();
    }, { once: true });
  });

  // --- Drag / Swipe (edit phase directly) ---
  let isDown = false;
  let startX = 0;
  let startPhase = 0;
  let dragMoved = false;

  const pauseAuto = () => {
    playing = false;
    lastTs = 0;
  };

  const resumeAuto = () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      playing = shouldPlay();
      lastTs = 0;
    }, RESUME_DELAY_MS);
  };

  const down = (pageX) => {
    if (W <= 0) return;
    isDown = true;
    dragMoved = false;
    startX = pageX;
    startPhase = phase;
    reel.classList.add('is-dragging');
    pauseAuto();
  };

  const move = (pageX) => {
    if (!isDown || W <= 0) return;
    const dx = pageX - startX;
    if (Math.abs(dx) > 2) dragMoved = true;
    phase = ((startPhase - dx) % W + W) % W;
    applyTransform();
  };

  const up = () => {
    if (!isDown) return;
    isDown = false;
    reel.classList.remove('is-dragging');
    resumeAuto();
  };

  // Mouse
  reel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    down(e.pageX);
  });
  window.addEventListener('mousemove', (e) => move(e.pageX));
  window.addEventListener('mouseup', up);

  // Touch
  reel.addEventListener('touchstart', (e) => {
    if (e.touches[0]) down(e.touches[0].pageX);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) move(e.touches[0].pageX);
  }, { passive: true });
  window.addEventListener('touchend', up);

  // Defensive: prevent stray clicks after a drag
  track.addEventListener('click', (e) => {
    if (dragMoved) e.preventDefault();
  }, true);

  // Init
  ensureDuplicate();
  requestAnimationFrame(() => {
    measureW();
    applyTransform();
    requestAnimationFrame(tick);
  });
});
