document.documentElement.classList.add('js');

const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const revealTargets = document.querySelectorAll(
  '.overview-intro, .page-title, .name-list, .commissions-wrap, .about-grid, .contact, .category-block, .photo, .video-frame-link'
);

revealTargets.forEach((target, index) => {
  target.classList.add('reveal-target');
  target.style.setProperty('--reveal-delay', `${Math.min(index % 6, 3) * 30}ms`);
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}

const sectionNavLinks = [...document.querySelectorAll('.commission-list a[href^="#"]')];
const sectionTargets = sectionNavLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sectionNavLinks.length && sectionTargets.length && 'IntersectionObserver' in window) {
  const setActiveLink = (sectionId) => {
    sectionNavLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${sectionId}`);
    });
  };

  setActiveLink(sectionTargets[0].id);

  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) setActiveLink(visibleEntry.target.id);
  }, { rootMargin: '-24% 0px -58% 0px', threshold: [0.08, 0.2, 0.45] });

  sectionTargets.forEach((section) => sectionObserver.observe(section));
}

const imageLinks = [...document.querySelectorAll('.photo[href]')].filter((link) => {
  const href = link.getAttribute('href') || '';
  return /\.(jpe?g|png|webp|gif)$/i.test(href);
});

if (imageLinks.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image gallery');
  lightbox.innerHTML = `
    <div class="lightbox__top">
      <span class="lightbox__counter"></span>
      <button class="lightbox__close" type="button">Close</button>
    </div>
    <div class="lightbox__stage">
      <img class="lightbox__image" alt="" />
    </div>
    <div class="lightbox__bottom">
      <span class="lightbox__caption"></span>
      <div class="lightbox__controls">
        <button class="lightbox__prev" type="button" aria-label="Previous image">Prev</button>
        <button class="lightbox__next" type="button" aria-label="Next image">Next</button>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.lightbox__image');
  const lightboxCounter = lightbox.querySelector('.lightbox__counter');
  const lightboxCaption = lightbox.querySelector('.lightbox__caption');
  const closeButton = lightbox.querySelector('.lightbox__close');
  const prevButton = lightbox.querySelector('.lightbox__prev');
  const nextButton = lightbox.querySelector('.lightbox__next');
  let activeIndex = 0;

  const setImage = (index) => {
    activeIndex = (index + imageLinks.length) % imageLinks.length;
    const activeLink = imageLinks[activeIndex];
    const activeImg = activeLink.querySelector('img');
    const caption = activeImg?.getAttribute('alt') || '';

    lightboxImage.src = activeLink.href;
    lightboxImage.alt = caption;
    lightboxCounter.textContent = `${activeIndex + 1} / ${imageLinks.length}`;
    lightboxCaption.textContent = caption;
  };

  const openLightbox = (index) => {
    setImage(index);
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    closeButton.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    imageLinks[activeIndex]?.focus({ preventScroll: true });
  };

  imageLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      openLightbox(index);
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => setImage(activeIndex - 1));
  nextButton.addEventListener('click', () => setImage(activeIndex + 1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') setImage(activeIndex - 1);
    if (event.key === 'ArrowRight') setImage(activeIndex + 1);
  });
}
