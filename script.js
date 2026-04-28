/* ═══════════════════════════════════════════════
   VELORA — script.js  (One-Page Edition)
   Smooth Scroll · Active Nav · Carousel · Reveals
   Counter Animation · Pre-filled WhatsApp
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.getElementById('hamburger');
  const navLinksWrap = document.getElementById('navLinks');
  const fabTop  = document.getElementById('fabTop');

  // ── Section IDs in order ──
  const sections = ['hero','trusted','services','work','pricing','process','about','contact'];

  /* ════════════════════════════════
     SMOOTH SCROLL (all #anchor links)
  ════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = navbar ? navbar.offsetHeight + 10 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // close mobile menu
      navLinksWrap?.classList.remove('open');
      hamburger?.classList.remove('open');
    });
  });

  /* ════════════════════════════════
     HAMBURGER TOGGLE
  ════════════════════════════════ */
  if (hamburger && navLinksWrap) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      navLinksWrap.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinksWrap.contains(e.target)) {
        navLinksWrap.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  /* ════════════════════════════════
     ANIMATED COUNTERS
  ════════════════════════════════ */
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      function updateCounter() {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      }
      updateCounter();
    });
  }

  // Trigger counters when hero stats are visible
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(heroStats);
  }

  // Fallback: animate after short delay anyway
  setTimeout(() => {
    if (!countersAnimated) animateCounters();
  }, 1500);

  /* ════════════════════════════════
     SCROLL HANDLER
     - Nav shadow
     - Active link highlight (spy)
     - FAB top visibility
  ════════════════════════════════ */
  function onScroll() {
    const y = window.scrollY;

    // Nav shadow
    navbar?.classList.toggle('scrolled', y > 50);

    // Scroll-to-top button
    fabTop?.classList.toggle('visible', y > 400);

    // Active section spy
    let currentId = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const offset = navbar ? navbar.offsetHeight + 60 : 100;
      if (el.getBoundingClientRect().top <= offset) currentId = id;
    });

    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ════════════════════════════════
     SCROLL TO TOP
  ════════════════════════════════ */
  fabTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ════════════════════════════════
     SCROLL REVEAL
  ════════════════════════════════ */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => io.observe(el));
  }

  // Trigger hero immediately
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('in'));
  }, 80);

  /* ════════════════════════════════
     CAROUSEL
  ════════════════════════════════ */
  const track  = document.getElementById('carouselTrack');
  const dotsEl = document.getElementById('carouselDots');
  const prevBtn = document.querySelector('.c-prev');
  const nextBtn = document.querySelector('.c-next');

  if (track) {
    const cards = Array.from(track.querySelectorAll('.work-card'));
    const dots  = dotsEl ? Array.from(dotsEl.querySelectorAll('.c-dot')) : [];
    let current = 0;
    let auto;

    function perView() {
      if (window.innerWidth < 640)  return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    function maxIdx() { return Math.max(0, cards.length - perView()); }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIdx()));
      const gap       = 20;
      const cardW     = cards[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${current * (cardW + gap)}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
      clearInterval(auto);
      auto = setInterval(() => goTo(current >= maxIdx() ? 0 : current + 1), 3000);
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

    track.addEventListener('mouseenter', () => clearInterval(auto));
    track.addEventListener('mouseleave', startAuto);

    // Touch/swipe support
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { diff > 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
    }, { passive: true });

    window.addEventListener('resize', () => goTo(0));
    goTo(0);
    startAuto();
  }

  /* ════════════════════════════════
     CONTACT FORM
  ════════════════════════════════ */
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (form && submitBtn) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const orig = submitBtn.textContent;
      submitBtn.textContent = '✓  Message Sent!';
      submitBtn.style.background = 'linear-gradient(135deg,#34c759,#1a8738)';
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.textContent = orig;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        form.reset();
      }, 3500);
    });
  }

  /* ════════════════════════════════
     PARALLAX ORBS (subtle mouse)
  ════════════════════════════════ */
  const orbs = document.querySelectorAll('.orb');
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 28;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    orbs.forEach((o, i) => {
      const f = (i + 1) * 0.32;
      o.style.transform = `translate(${x*f}px,${y*f}px)`;
    });
  }, { passive: true });

  /* ════════════════════════════════
     HAMBURGER ANIMATION
  ════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
    .hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
    .hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
    .hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
  `;
  document.head.appendChild(style);

});