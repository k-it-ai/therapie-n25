const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const header = document.querySelector<HTMLElement>('[data-header]');
const callBtn = document.querySelector<HTMLElement>('[data-call]');
const hero = document.querySelector<HTMLElement>('[data-carousel]');
const footer = document.querySelector<HTMLElement>('.site-footer');

/* ---------- Mobile menu ---------- */
const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
const burgerLabel = document.querySelector<HTMLElement>('[data-burger-label]');

function setMenu(open: boolean) {
  if (!burger || !nav) return;
  burger.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.documentElement.classList.toggle('menu-open', open);
  // keep keyboard focus inside the open menu
  for (const el of document.querySelectorAll<HTMLElement>('main, footer, .skip-link, [data-call]')) el.inert = open;
  if (burgerLabel) burgerLabel.textContent = (open ? burger.dataset.labelClose : burger.dataset.labelOpen) ?? '';
  if (open) nav.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
}
burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    burger.focus();
  }
});
window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* Keep the current section when switching language */
document.querySelector<HTMLAnchorElement>('[data-lang-link]')?.addEventListener('click', (e) => {
  const link = e.currentTarget as HTMLAnchorElement;
  const active = document.querySelector<HTMLAnchorElement>('[data-nav-link][aria-current="true"]');
  if (active && hero) {
    e.preventDefault();
    window.location.href = link.pathname + '#' + active.dataset.navLink;
  }
});

/* ---------- Active nav item ---------- */
// A menu item is underlined once its section heading reaches the upper third of the screen;
// none while the hero is still in view.
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
const headings = navLinks
  .map((a) => document.getElementById(`${a.dataset.navLink}-title`))
  .filter((el): el is HTMLElement => !!el);
let activeId: string | undefined;
function updateActiveNav() {
  const line = window.innerHeight * 0.35;
  const passed = headings.filter((h) => h.getBoundingClientRect().top <= line);
  const id = passed.at(-1)?.id.replace(/-title$/, '');
  if (id === activeId) return;
  activeId = id;
  navLinks.forEach((a) => a.setAttribute('aria-current', String(a.dataset.navLink === id)));
}

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  reveals.forEach((el) => io.observe(el));
}

/* ---------- Scroll-linked effects: spine, parallax, header, call button ---------- */
const spine = document.querySelector<HTMLElement>('[data-spine]');
const heroLayer = document.querySelector<HTMLElement>('[data-parallax-hero]');
const parallaxFrames = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
let ticking = false;

function onScroll() {
  ticking = false;
  const y = window.scrollY;
  const vh = window.innerHeight;

  header?.classList.toggle('is-scrolled', y > 10);
  updateActiveNav();
  if (callBtn) {
    const threshold = hero ? hero.offsetHeight * 0.6 : 200;
    // hide again over the footer: it shows the number and the designer credit sits there
    const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
    callBtn.classList.toggle('is-visible', y > threshold && footerTop > vh - 40);
  }

  if (reduceMotion) return;

  if (spine) {
    const r = spine.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    spine.style.setProperty('--spine', progress.toFixed(4));
  }

  if (heroLayer && hero && y < hero.offsetHeight * 1.2) {
    heroLayer.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
  }

  for (const frame of parallaxFrames) {
    const r = frame.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) continue;
    // -1 (frame at bottom of screen) .. 1 (frame at top)
    const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
    const img = frame.querySelector('img');
    img?.style.setProperty('--shift', `${(t * r.height * 0.035).toFixed(1)}px`);
  }
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Hero carousel (5 s) ---------- */
if (hero) {
  const allSlides = [...hero.querySelectorAll<HTMLElement>('[data-slide]')];
  const allDots = [...hero.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const pauseBtn = hero.querySelector<HTMLButtonElement>('[data-pause]');
  // Wide screens and phones use different photo sets; only cycle the visible one.
  let slides: HTMLElement[] = [];
  let dots: HTMLButtonElement[] = [];
  let index = 0;
  let timer: number | undefined;
  let paused = reduceMotion;

  const show = (i: number) => {
    if (!slides.length) return;
    index = (i + slides.length) % slides.length;
    allSlides.forEach((s) => {
      const on = s === slides[index];
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', String(!on));
    });
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === index)));
    const next = slides[(index + 1) % slides.length]?.querySelector('img');
    if (next) next.loading = 'eager';
  };
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!paused && slides.length > 1) timer = window.setInterval(() => show(index + 1), 5000);
  };
  // Pick the set by screen width (computed styles may not be ready yet -> blank slides).
  const phoneQuery = window.matchMedia('(max-width: 699px)');
  const collect = () => {
    const set = phoneQuery.matches ? 'tall' : 'wide';
    slides = allSlides.filter((s) => s.matches(`.slide--both, .slide--${set}`));
    dots = allDots.filter((d) => d.matches(`.dot--both, .dot--${set}`));
    show(0);
    start();
  };

  allDots.forEach((d) =>
    d.addEventListener('click', () => {
      show(dots.indexOf(d));
      start();
    }),
  );
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.classList.toggle('is-paused', paused);
    pauseBtn.setAttribute('aria-label', (paused ? pauseBtn.dataset.labelPlay : pauseBtn.dataset.labelPause) ?? '');
    paused ? stop() : start();
  });
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  phoneQuery.addEventListener('change', collect);
  if (paused) {
    pauseBtn?.classList.add('is-paused');
    pauseBtn?.setAttribute('aria-label', pauseBtn.dataset.labelPlay ?? '');
  }

  // Swipe on touch screens
  let x0: number | null = null;
  hero.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) {
      show(index + (dx < 0 ? 1 : -1));
      start();
    }
    x0 = null;
  });

  collect();
}

/* ---------- Lightbox ---------- */
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
if (dialog) {
  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  let group: HTMLAnchorElement[] = [];
  let pos = 0;
  let opener: HTMLElement | null = null;
  const open = (i: number) => {
    pos = (i + group.length) % group.length;
    const a = group[pos];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt ?? '';
    const multi = group.length > 1;
    dialog.querySelectorAll<HTMLElement>('.lb-nav').forEach((b) => (b.hidden = !multi));
    if (!dialog.open) dialog.showModal();
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      group = [...document.querySelectorAll<HTMLAnchorElement>(`[data-lightbox="${a.dataset.lightbox}"]`)];
      opener = a;
      open(group.indexOf(a));
    });
  });
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => open(pos - 1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => open(pos + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') open(pos + 1);
    if (e.key === 'ArrowLeft') open(pos - 1);
  });
}

/* ---------- Was wir tun on phones: tap a row to open photo + text ---------- */
const accQuery = window.matchMedia('(max-width: 899px)');
const accButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-acc-btn]')];
const syncAccordion = () => {
  for (const btn of accButtons) {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!);
    const open = btn.getAttribute('aria-expanded') === 'true';
    panel?.classList.toggle('is-open', open);
    // hidden panels must not be reachable with the keyboard; on desktop everything is shown
    if (panel) panel.inert = accQuery.matches && !open;
  }
};
accButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
    syncAccordion();
  }),
);
accQuery.addEventListener('change', syncAccordion);
syncAccordion();

/* ---------- "Route planen": open the map app that fits the device ----------
   Android: geo: opens the default map app. iOS/iPadOS 18.4+: geo-navigation: opens the default
   navigation app (Apple Maps, or e.g. Google Maps where iOS lets people choose). Older iOS: a menu
   offers Apple Maps or Google Maps. Mac: Apple Maps. Everything else: Google Maps in the browser. */
document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach((a) => {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch support tells them apart
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  // iOS version, or Safari's version where the OS version is frozen (iPad, iOS 26)
  const version = (re: RegExp) => {
    const m = ua.match(re);
    return m ? Number(m[1]) + Number(m[2]) / 100 : 0;
  };
  const geoNav = isIOS && Math.max(version(/OS (\d+)_(\d+)/), version(/Version\/(\d+)\.(\d+)/)) >= 18.04;
  const menu = a.parentElement?.querySelector<HTMLElement>('[data-route-menu]');
  if (/Android/.test(ua) && a.dataset.geo) {
    a.href = a.dataset.geo;
    a.removeAttribute('target');
  } else if (geoNav && a.dataset.geonav) {
    a.href = a.dataset.geonav;
    a.removeAttribute('target');
  } else if (isIOS && menu) {
    a.setAttribute('aria-haspopup', 'true');
    a.setAttribute('aria-controls', menu.id);
    a.setAttribute('aria-expanded', 'false');
    const toggle = (open: boolean) => {
      menu.hidden = !open;
      a.setAttribute('aria-expanded', String(open));
    };
    a.addEventListener('click', (e) => {
      e.preventDefault();
      toggle(menu.hidden);
    });
    menu.addEventListener('click', () => toggle(false));
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !a.parentElement!.contains(e.target as Node)) toggle(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        toggle(false);
        a.focus();
      }
    });
  } else if (/Macintosh/.test(ua) && a.dataset.apple) {
    a.href = a.dataset.apple;
  }
});
