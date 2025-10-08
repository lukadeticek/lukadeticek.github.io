/* Minimal, robust enhancements:
   - Mark that JS is available (for CSS fallbacks)
   - IntersectionObserver reveal for [data-reveal]
   - Color inversion fallback if :has() is unsupported
*/
(function () {
  // 0) Mark JS present ASAP (unblocks CSS fallbacks)
  document.documentElement.classList.add('js');

  const docEl = document.documentElement;

  // 1) Initial load nudge on hero
  window.addEventListener('DOMContentLoaded', () => {
    docEl.classList.add('loaded');
  });

  // 2) Reveal on scroll
  const revealEls = Array.prototype.slice.call(
    document.querySelectorAll('[data-reveal]')
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show immediately
    revealEls.forEach((el) => el.classList.add('is-inview'));
  }

  // 3) :has() fallback for site-wide inversion on gallery hover
  const supportsHas = CSS && CSS.supports && CSS.supports(':has(*)');

  if (!supportsHas) {
    const cards = document.querySelectorAll('.gallery .card');
    const on = () => docEl.classList.add('invert');
    const off = () => docEl.classList.remove('invert');

    cards.forEach((card) => {
      card.addEventListener('mouseenter', on);
      card.addEventListener('mouseleave', off);
      card.addEventListener('focus', on, true);
      card.addEventListener('blur', off, true);
    });
  }
})();



document.addEventListener('click', (e) => {
  const a = e.target.closest('a.popup-link');
  if (!a) return;

  const href = a.getAttribute('href') || '';
  if (/^(mailto:|tel:)/i.test(href)) return;

  e.preventDefault();

  // Popup size
  const popupWidth = 1200;
  const popupHeight = 600;

  // Calculate right-side position
  const left = window.screen.width - popupWidth - 100; // 20px margin from screen edge
  const top = Math.max((window.screen.height - popupHeight) / 2, 0);

  // Open the popup
  window.open(
    href,
    'popup',
    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=no,resizable=no`
  );
});