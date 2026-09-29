(() => {
  const links = [...document.querySelectorAll('[data-lightbox]')];
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Photograph viewer');
  dialog.innerHTML = '<button class="close" aria-label="Close photograph viewer">CLOSE ×</button><img alt=""><div class="viewer-nav"><button class="previous" aria-label="Previous photograph">← PREVIOUS</button><span class="viewer-count" aria-live="polite"></span><button class="next" aria-label="Next photograph">NEXT →</button></div>';
  document.body.append(dialog);
  let current = 0;
  function show(index) {
    current = (index + links.length) % links.length;
    const source = links[current].querySelector('img');
    const target = dialog.querySelector('img');
    target.src = source.src;
    target.alt = source.alt;
    dialog.querySelector('.viewer-count').textContent = `${current + 1} / ${links.length}`;
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); show(index); dialog.showModal(); document.body.style.overflow = 'hidden';
  }));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; links[current].focus(); });
  dialog.querySelector('.previous').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
  });
})();
