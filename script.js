// Hotel galleries: drop photos into images/ using the filenames in index.html.
// Missing photos are removed; if a hotel has none, a placeholder is shown.
document.querySelectorAll('.gallery').forEach((gallery) => {
  const imgs = [...gallery.querySelectorAll('img')];
  let pending = imgs.length;

  const settle = () => {
    pending -= 1;
    if (pending > 0) return;
    const shown = gallery.querySelectorAll('img');
    if (shown.length === 0) {
      gallery.classList.add('gallery--empty');
      gallery.innerHTML =
        `<p><strong>${gallery.dataset.hotel} 相片</strong>相片可以喺酒店官網或者訂房網站睇。</p>`;
    } else if (shown.length === 1) {
      gallery.style.gridTemplateRows = '1fr';
    } else if (shown.length === 2) {
      shown[1].style.gridColumn = '1 / -1';
    }
  };

  imgs.forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
    const fail = () => { img.remove(); settle(); };
    if (img.complete) {
      img.naturalWidth ? settle() : fail();
    } else {
      img.addEventListener('load', settle, { once: true });
      img.addEventListener('error', fail, { once: true });
    }
  });
});

// Tap a photo to see it full size.
const lightbox = document.createElement('dialog');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<img alt="">';
document.body.append(lightbox);
lightbox.addEventListener('click', () => lightbox.close());
document.addEventListener('click', (e) => {
  const img = e.target.closest('.gallery img');
  if (!img || typeof lightbox.showModal !== 'function') return;
  const big = lightbox.querySelector('img');
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  lightbox.showModal();
});

// Booking checklist, remembered on this device only.
const STORE = 'algarve-todo';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE)) || {}; } catch {}
document.querySelectorAll('.todo input[data-key]').forEach((box) => {
  box.checked = !!saved[box.dataset.key];
  box.addEventListener('change', () => {
    saved[box.dataset.key] = box.checked;
    try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch {}
  });
});

// Plan A / Plan B: tap the bottom-right corner to peel Plan A back and show Plan B.
document.querySelectorAll('.flip').forEach((flip) => {
  const top = flip.querySelector('.flip__page--top');
  const under = flip.querySelector('.flip__page--under');
  const corner = flip.querySelector('.flip__corner');
  const back = flip.querySelector('.flip__back');
  const REST = 72;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let anim = 0;

  const turn = (toB) => {
    cancelAnimationFrame(anim);
    const full = flip.offsetWidth + flip.offsetHeight;
    const from = toB ? REST : full;
    const to = toB ? full : REST;
    const done = () => {
      flip.style.setProperty('--p', to + 'px');
      flip.classList.remove('is-turning');
      flip.classList.toggle('is-b', toB);
      top.inert = toB;
      under.inert = !toB;
      corner.setAttribute('aria-expanded', toB);
      (toB ? back : corner).focus({ preventScroll: true });
      if (!toB) flip.style.removeProperty('--p');
    };
    if (reduce.matches) return done();
    flip.classList.remove('is-b');
    flip.classList.add('is-turning');
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 700, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      flip.style.setProperty('--p', from + (to - from) * e + 'px');
      if (t < 1) anim = requestAnimationFrame(step);
      else done();
    };
    anim = requestAnimationFrame(step);
  };

  corner.addEventListener('click', () => turn(true));
  back.addEventListener('click', () => turn(false));
});
