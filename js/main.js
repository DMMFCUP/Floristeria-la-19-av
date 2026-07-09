const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav__link');
const catalogoGrid = document.querySelector('#catalogoGrid');
const lightbox = document.querySelector('#lightbox');
const lightboxContent = document.querySelector('.lightbox__content');
const lightboxImage = document.querySelector('.lightbox__image');
const lightboxClose = document.querySelector('.lightbox__close');
const lightboxWhatsapp = document.querySelector('#lightboxWhatsapp');
const lightboxNumber = document.querySelector('#lightboxNumber');

const WHATSAPP_NUMBER = '50231362177';
const CATALOG_TOTAL = 25;
let lastFocusedElement = null;
let currentLightboxNumber = 1;
let swipeStartX = 0;
let swipeStartY = 0;
let isSwiping = false;

const closeMobileMenu = () => {
  if (!nav || !navToggle) return;

  nav.classList.remove('nav--open');
  navToggle.classList.remove('nav-toggle--active');
  navToggle.setAttribute('aria-expanded', 'false');
};

const updateHeaderOnScroll = () => {
  if (!header) return;

  header.classList.toggle('header--scrolled', window.scrollY > 60);
};

const updateActiveNavLink = () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach((link) => {
        link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
};

const createWhatsappUrl = (number) => {
  const message = `Hola, me interesa este ramo.\n\nRamo #${number}\n\n¿Cuál es su precio?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const normalizeCatalogNumber = (number) => {
  if (number < 1) return CATALOG_TOTAL;
  if (number > CATALOG_TOTAL) return 1;
  return number;
};

const getCatalogImageSrc = (number) => `./fotos/${number}.png`;

const updateLightboxImage = (number) => {
  if (!lightboxImage || !lightboxWhatsapp || !lightboxNumber) return;

  currentLightboxNumber = normalizeCatalogNumber(number);
  const imageSrc = getCatalogImageSrc(currentLightboxNumber);
  const imageAlt = `Ramo floral #${currentLightboxNumber}`;

  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageAlt;
  lightboxNumber.textContent = `#${currentLightboxNumber}`;
  lightboxWhatsapp.href = createWhatsappUrl(currentLightboxNumber);
};

const openLightbox = (number, triggerElement) => {
  if (!lightbox || !lightboxImage || !lightboxWhatsapp) return;

  lastFocusedElement = triggerElement;
  updateLightboxImage(number);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose?.focus();
};

const navigateLightbox = (direction) => {
  if (!lightbox?.classList.contains('is-open')) return;

  updateLightboxImage(currentLightboxNumber + direction);
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');

  window.setTimeout(() => {
    if (!lightbox.classList.contains('is-open')) {
      lightboxImage.src = '';
      lightboxImage.alt = '';
    }
  }, 300);

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const renderCatalog = () => {
  if (!catalogoGrid) return;

  const fragment = document.createDocumentFragment();

  for (let number = 1; number <= CATALOG_TOTAL; number += 1) {
    const button = document.createElement('button');
    const image = document.createElement('img');
    const src = getCatalogImageSrc(number);
    const alt = `Ramo floral #${number}`;

    button.type = 'button';
    button.className = 'catalogo__item';
    button.setAttribute('aria-label', `Abrir ramo #${number}`);

    image.src = src;
    image.alt = alt;
    image.className = 'catalogo__image';
    image.loading = 'lazy';

    button.appendChild(image);
    button.addEventListener('click', () => openLightbox(number, button));
    fragment.appendChild(button);
  }

  catalogoGrid.appendChild(fragment);
};

window.addEventListener('scroll', () => {
  updateHeaderOnScroll();
  updateActiveNavLink();
});

navToggle?.addEventListener('click', () => {
  if (!nav || !navToggle) return;

  const isOpen = nav.classList.toggle('nav--open');
  navToggle.classList.toggle('nav-toggle--active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

lightboxClose?.addEventListener('click', closeLightbox);

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

lightboxContent?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a, button')) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  swipeStartX = event.clientX;
  swipeStartY = event.clientY;
  isSwiping = true;
});

lightboxContent?.addEventListener('pointerup', (event) => {
  if (!isSwiping) return;

  const swipeDistanceX = event.clientX - swipeStartX;
  const swipeDistanceY = event.clientY - swipeStartY;
  const isHorizontalSwipe = Math.abs(swipeDistanceX) > 45 && Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) * 1.2;

  if (isHorizontalSwipe) {
    navigateLightbox(swipeDistanceX < 0 ? 1 : -1);
  }

  isSwiping = false;
});

lightboxContent?.addEventListener('pointercancel', () => {
  isSwiping = false;
});

document.addEventListener('keydown', (event) => {
  if (!lightbox?.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'ArrowLeft') {
    navigateLightbox(-1);
  }

  if (event.key === 'ArrowRight') {
    navigateLightbox(1);
  }
});

renderCatalog();
updateHeaderOnScroll();
updateActiveNavLink();
