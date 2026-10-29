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

// Plan A / Plan B tabs on Day 2.
document.querySelectorAll('.plans').forEach((plans) => {
  const tabs = [...plans.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next);
      next.focus();
    });
  });
});
