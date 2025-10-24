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


  // Hide the contact button when the contact section is in view
  document.addEventListener("DOMContentLoaded", () => {
    const contactButton = document.querySelector(".contact-button");
    const contactSection = document.querySelector("#contact");

    if (!contactButton || !contactSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            contactButton.classList.add("is-hidden");
          } else {
            contactButton.classList.remove("is-hidden");
          }
        });
      },
      {
        root: null,
        threshold: 0.2, // triggers when 20% of contact section is visible
      }
    );

    observer.observe(contactSection);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const rail = document.querySelector(".contact-rail");
    const contact = document.querySelector("#contact");
    if (!rail || !contact) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          rail.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.25 } // hide when 25% of contact is visible
    );

    io.observe(contact);
  });

document.addEventListener("DOMContentLoaded", () => {
  const rail = document.querySelector(".contact-rail");
  const contact = document.querySelector("#contact");
  if (!rail) return;

  
  // Apply on load + on scroll
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- 2) Hide when contact section is visible --- */
  if (contact && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          rail.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.25 } // hide when 25% of contact is in view
    );
    io.observe(contact);
  }
});
// Add is-home on the root or /index.html so CSS can target it
  (function () {
    var p = location.pathname.replace(/\/+$/, "");
    if (p === "" || p === "/" || /\/index\.html?$/.test(p)) {
      document.body.classList.add("is-home");
    }
  })();

  document.addEventListener("DOMContentLoaded", () => {
  const rail = document.querySelector(".contact-rail");
  const contact = document.querySelector("#contact");
  if (!rail) return;

  const isHome = document.body.classList.contains("is-home");

  // Ensure it's NOT hidden on load for the home page
  rail.classList.remove("is-near-top", "at-top");

  /* --- Hide when NEAR TOP (only on non-home pages) --- */
  if (!isHome) {
    const TOP_FADE_DISTANCE = 500;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        rail.classList.toggle("is-near-top", y < TOP_FADE_DISTANCE);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Hide when the CONTACT section is visible (all pages) --- */
  if (contact && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          rail.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.25 }
    );
    io.observe(contact);
  }
});