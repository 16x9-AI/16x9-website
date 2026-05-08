/* 16x9 · animation runtime */
(() => {
  const html = document.documentElement;
  const body = document.body;
  body.classList.remove('no-js');
  body.classList.add('js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
   * Smooth scroll for in-page anchors
   * -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ----------------------------------------------------------
   * Scroll progress bar
   * -------------------------------------------------------- */
  const progressBar = document.querySelector('.scroll-progress__bar');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${pct / 100})`;
  };

  /* ----------------------------------------------------------
   * Global nav scroll state
   * -------------------------------------------------------- */
  const gNav = document.querySelector('.global-nav');
  const onNavScroll = () => {
    if (!gNav) return;
    gNav.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  /* ----------------------------------------------------------
   * Global nav active link
   * -------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.global-nav__links a');
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const navMap = new Map(sections.map((sec, i) => [sec, navLinks[i]]));
  if (sections.length) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('is-active'));
          const link = navMap.get(entry.target);
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => navObs.observe(s));
  }

  /* ----------------------------------------------------------
   * Reveal-on-scroll
   * -------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-revealed'));
  }

  /* ----------------------------------------------------------
   * Stagger words inside data-reveal-stagger
   * -------------------------------------------------------- */
  document.querySelectorAll('[data-reveal-stagger] .word').forEach((w, i) => {
    w.style.setProperty('--word-i', i);
  });

  /* ----------------------------------------------------------
   * Animated number counters
   * -------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (!reduce && counters.length) {
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1400;
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          const ease = 1 - Math.pow(1 - p, 3);
          const v = Math.round(end * ease);
          el.textContent = v + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => countObs.observe(c));
  }

  /* ----------------------------------------------------------
   * Parallax (rAF-driven)
   * -------------------------------------------------------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  let scrollY = window.scrollY;
  let raf = false;
  const updateParallax = () => {
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const k = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translate3d(0, ${(-center * k).toFixed(1)}px, 0)`;
    });
    raf = false;
  };
  const requestUpdate = () => {
    if (!raf) {
      raf = true;
      requestAnimationFrame(() => {
        onScrollProgress();
        onNavScroll();
        if (!reduce) updateParallax();
      });
    }
  };

  /* ----------------------------------------------------------
   * Hero gradient orb follows cursor / touch / drift on idle
   * -------------------------------------------------------- */
  const hero = document.querySelector('.hero');
  if (hero && !reduce) {
    let mx = 50, my = 50;
    let cx = 50, cy = 50;
    let lerping = false;
    let lastInput = 0;
    const lerp = (t) => {
      // If no recent user input, drift gently in a slow circle
      if (t - lastInput > 1500) {
        const phase = t / 4000;
        mx = 50 + Math.cos(phase) * 28;
        my = 50 + Math.sin(phase) * 22;
      }
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      hero.style.setProperty('--mx', cx + '%');
      hero.style.setProperty('--my', cy + '%');
      requestAnimationFrame(lerp);
    };
    requestAnimationFrame(lerp);

    const setFromEvent = (clientX, clientY) => {
      const r = hero.getBoundingClientRect();
      mx = ((clientX - r.left) / r.width) * 100;
      my = ((clientY - r.top) / r.height) * 100;
      lastInput = performance.now();
    };
    hero.addEventListener('pointermove', e => setFromEvent(e.clientX, e.clientY));
    hero.addEventListener('touchmove', e => {
      if (e.touches.length) setFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  /* ----------------------------------------------------------
   * Magnetic CTA buttons
   * -------------------------------------------------------- */
  if (!reduce) {
    document.querySelectorAll('.btn--magnetic').forEach(btn => {
      const strength = 18;
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
   * Card tilt on hover (subtle)
   * -------------------------------------------------------- */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const max = 4;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        card.style.transform = `perspective(900px) rotateX(${(-dy * max).toFixed(2)}deg) rotateY(${(dx * max).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
   * Engine sticky-stack scroll progress (fade + scale)
   * -------------------------------------------------------- */
  const stackedEngines = document.querySelectorAll('.engine--sticky');
  const updateStack = () => {
    stackedEngines.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      const passed = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / total));
      // when card is being covered by the next, scale it down + dim
      const next = stackedEngines[i + 1];
      if (next) {
        const nextRect = next.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(1, (window.innerHeight - nextRect.top) / window.innerHeight));
        el.style.setProperty('--stack-scale', (1 - overlap * 0.06).toFixed(3));
        el.style.setProperty('--stack-opacity', (1 - overlap * 0.4).toFixed(3));
      } else {
        el.style.setProperty('--stack-scale', 1);
        el.style.setProperty('--stack-opacity', 1);
      }
    });
  };

  /* ----------------------------------------------------------
   * Master scroll listener
   * -------------------------------------------------------- */
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    requestUpdate();
    if (!reduce) updateStack();
  }, { passive: true });
  window.addEventListener('resize', requestUpdate);
  requestUpdate();
  updateStack();

  /* Marquee runs at constant CSS speed (no JS interference) */

  /* ----------------------------------------------------------
   * Touch / no-hover: scroll-driven card highlight
   * Each card flips to its dark state as it crosses viewport center,
   * mimicking the hover effect that desktop users get with the mouse.
   * -------------------------------------------------------- */
  const noHover = !window.matchMedia('(hover: hover)').matches;
  if (noHover && 'IntersectionObserver' in window) {
    body.classList.add('is-touch');
    const focusables = document.querySelectorAll('.card, .product-card, .stat-card, .gallery-tile');
    const focusObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      });
    }, {
      rootMargin: '-35% 0px -35% 0px',
      threshold: 0
    });
    focusables.forEach(el => focusObs.observe(el));
  }

  /* ----------------------------------------------------------
   * Reveal cascade: items inside a grid stagger their entrance
   * -------------------------------------------------------- */
  document.querySelectorAll('.card-grid, .product-grid, .stat-grid, .gallery-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--reveal-delay', (i * 90) + 'ms');
    });
  });

  /* ==========================================================
   * BentoTile — cinematic curtain reveal
   *
   * Each [data-bento] starts as a 1:1 square and expands to its
   * target aspect ratio (16:9 or 9:16) as it scrolls into view.
   * The expansion is driven by scroll position (not time), so the
   * user controls the pacing. This is the literal "16x9" concept:
   * imagery unfurls into a cinematic frame.
   * ========================================================== */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, p) => a + (b - a) * p;
  const RATIOS = { '16x9': 16 / 9, '9x16': 9 / 16 };

  const bentoTiles = Array.from(document.querySelectorAll('[data-bento]'));

  function updateBento() {
    const vh = window.innerHeight;
    bentoTiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      const visibleFromBottom = vh - rect.top;
      const adjusted = visibleFromBottom / (rect.height + vh * 0.2);
      const progress = Math.max(0, Math.min(1, adjusted));
      const p = easeOut(progress);

      const ratio = tile.dataset.bento || '16x9';
      const target = RATIOS[ratio] || 16 / 9;
      const isLandscape = ratio === '16x9';
      const containerSized = tile.dataset.bentoMode === 'container';

      if (containerSized) {
        if (isLandscape) {
          tile.style.width = lerp(56.25, 100, p) + '%';
          tile.style.height = '100%';
        } else {
          tile.style.width = '100%';
          tile.style.height = lerp(56.25, 100, p) + '%';
        }
      } else {
        const ar = lerp(1, target, p);
        tile.style.aspectRatio = ar.toFixed(4);
        if (isLandscape) {
          tile.style.maxWidth = lerp(56.25, 100, p) + '%';
          tile.style.maxHeight = '100%';
        } else {
          tile.style.maxWidth = '100%';
          tile.style.maxHeight = lerp(56.25, 100, p) + '%';
        }
      }

      tile.style.opacity = Math.min(1, progress * 3);
    });
  }

  if (bentoTiles.length) {
    if (reduce) {
      // Respect reduced-motion: snap to final state, no scroll-linked anim
      bentoTiles.forEach(tile => {
        const ratio = tile.dataset.bento || '16x9';
        const target = RATIOS[ratio] || 16 / 9;
        const isLandscape = ratio === '16x9';
        if (tile.dataset.bentoMode === 'container') {
          tile.style.width = '100%';
          tile.style.height = '100%';
        } else {
          tile.style.aspectRatio = target.toFixed(4);
          tile.style.maxWidth = '100%';
          tile.style.maxHeight = isLandscape ? '100%' : '100%';
        }
        tile.style.opacity = 1;
      });
    } else {
      window.addEventListener('scroll', updateBento, { passive: true });
      window.addEventListener('resize', updateBento, { passive: true });
      updateBento();
      // Run again after layout settles + after images load
      requestAnimationFrame(updateBento);
      window.addEventListener('load', updateBento);
    }
  }

  /* ----------------------------------------------------------
   * Mobile navigation
   * -------------------------------------------------------- */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav__close');
  const mobileNavBackdrop = document.querySelector('.mobile-nav__backdrop');

  if (hamburger && mobileNav) {
    const openMobileNav = () => {
      mobileNav.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      body.style.overflow = 'hidden';
    };
    const closeMobileNav = () => {
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
    };
    hamburger.addEventListener('click', openMobileNav);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
    if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });
  }

  /* ----------------------------------------------------------
   * Services tab switcher
   * -------------------------------------------------------- */
  const svcTabList = document.querySelector('.svc-tabs');
  if (svcTabList) {
    const tabs = Array.from(svcTabList.querySelectorAll('.svc-tab'));
    const panels = Array.from(document.querySelectorAll('.svc-panel'));

    const activateTab = (tab) => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => {
        p.classList.remove('is-active');
        p.hidden = true;
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = false;
        panel.classList.add('is-active');
      }
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
    });

    svcTabList.addEventListener('keydown', e => {
      const idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(document.activeElement); }
    });
  }

  /* ==========================================================
   * Cookie consent + analytics loader
   * ========================================================== */
  const CONSENT_KEY = 'cookie_consent_v1';
  const banner = document.getElementById('cookieBanner');
  const cfg = window.SITE_ANALYTICS || {};

  function loadClarity(id) {
    if (!id || id === 'YOUR_CLARITY_ID') return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", id);
  }

  function loadGA4(id) {
    if (!id || id.indexOf('G-XXXX') === 0) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
    bindConversionTracking();
  }

  function bindConversionTracking() {
    const form = document.querySelector('.contact-form');
    if (form && !form.dataset.tracked) {
      form.dataset.tracked = '1';
      form.addEventListener('submit', function() {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'contact_form_submit', {
            event_category: 'engagement',
            event_label: 'contact'
          });
        }
      });
    }
    document.querySelectorAll('.btn--blue, .btn--dark, .global-nav__cta').forEach(function(btn) {
      if (btn.dataset.tracked) return;
      btn.dataset.tracked = '1';
      btn.addEventListener('click', function() {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'cta_click', {
            event_category: 'engagement',
            event_label: btn.textContent.trim().slice(0, 40)
          });
        }
      });
    });
  }

  function activateAnalytics() {
    loadClarity(cfg.clarityId);
    loadGA4(cfg.ga4Id);
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => { banner.hidden = true; }, 400);
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch(e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch(e) {}
  }

  const existing = getConsent();
  if (existing === 'accepted') {
    activateAnalytics();
  } else if (existing === 'rejected') {
    /* user said no, do nothing */
  } else {
    /* first visit: show banner shortly after page settles */
    setTimeout(showBanner, 800);
  }

  if (banner) {
    banner.addEventListener('click', function(e) {
      const action = e.target.getAttribute && e.target.getAttribute('data-cookie-action');
      if (!action) return;
      if (action === 'accept') {
        setConsent('accepted');
        hideBanner();
        activateAnalytics();
      } else if (action === 'reject') {
        setConsent('rejected');
        hideBanner();
      }
    });
  }
})();
