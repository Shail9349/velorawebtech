/* ═══════════════════════════════════════════════
   VELORA — script.js  (One-Page Edition)
   Smooth Scroll · Active Nav · Carousel · Reveals
   Counter Animation · Pre-filled WhatsApp
   UPDATED: Fixed nav scroll offset
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
     SMOOTH SCROLL (all #anchor links) - FIXED OFFSET
  ════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      
      // Calculate offset based on navbar height with extra padding
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const offset = navbarHeight + 20;
      
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
      const offset = navbar ? navbar.offsetHeight + 80 : 120;
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
   CONTACT FORM - WORKING WITH WEB3FORMS
═══════════════════════════════════ */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('form-status');

if (form && submitBtn) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Sending...';
    submitBtn.disabled = true;
    
    if (formStatus) formStatus.innerHTML = '';
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Success!
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg,#34c759,#1a8738)';
        
        if (formStatus) {
          formStatus.innerHTML = '<div style="background:#34c75920; padding:12px; border-radius:12px; color:#34c759; font-size:0.85rem;">✓ Thank you! We\'ll get back to you within 24 hours.</div>';
        }
        
        form.reset();
        
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 4000);
        
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      // Error!
      submitBtn.textContent = '❌ Failed. Try again.';
      submitBtn.style.background = 'linear-gradient(135deg,#ff3b30,#d70015)';
      
      if (formStatus) {
        formStatus.innerHTML = '<div style="background:#ff3b3020; padding:12px; border-radius:12px; color:#ff3b30; font-size:0.85rem;">❌ Something went wrong. Please try again or WhatsApp us directly.</div>';
      }
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 4000);
    }
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
/* ══════════════════════════════════════
   PREMIUM WORK SHOWCASE - STACKED GALLERY
══════════════════════════════════════ */

class ShowcaseGallery {
  constructor(elementId) {
    this.stack = document.getElementById(elementId);
    this.items = Array.from(this.stack.querySelectorAll('.showcase-item'));
    this.currentIndex = 2; // Start with 3rd item as active (0-indexed)
    this.totalItems = this.items.length;
    this.autoSlideInterval = null;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.updatePositions();
    this.attachEvents();
    this.createDots();
    this.startAutoSlide();
  }
  
  updatePositions() {
    // Reset all positions
    this.items.forEach((item, idx) => {
      item.classList.remove('active', 'pos-2', 'pos-1', 'pos--1', 'pos--2', 'hidden');
      
      let position = idx - this.currentIndex;
      
      // Handle infinite loop wrapping
      if (position > 2) position = position - this.totalItems;
      if (position < -2) position = position + this.totalItems;
      
      // Assign position classes
      if (position === 0) {
        item.classList.add('active');
      } else if (position === 1) {
        item.classList.add('pos-2');
      } else if (position === -1) {
        item.classList.add('pos--2');
      } else if (position === 2) {
        item.classList.add('pos-1');
      } else if (position === -2) {
        item.classList.add('pos--1');
      } else {
        item.classList.add('hidden');
      }
    });
  }
  
  slideNext() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.totalItems;
    this.updatePositions();
    this.updateDots();
    setTimeout(() => { this.isAnimating = false; }, 500);
  }
  
  slidePrev() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
    this.updatePositions();
    this.updateDots();
    setTimeout(() => { this.isAnimating = false; }, 500);
  }
  
  goToSlide(index) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = index;
    this.updatePositions();
    this.updateDots();
    setTimeout(() => { this.isAnimating = false; }, 500);
  }
  
  attachEvents() {
    // Click on cards to open website
    this.items.forEach((item, idx) => {
      item.addEventListener('click', (e) => {
        // Don't trigger if clicking on active card (just open website)
        const url = item.getAttribute('data-url');
        if (url && url !== '#') {
          window.open(url, '_blank');
        }
      });
    });
    
    // Navigation buttons
    const prevBtn = document.querySelector('.showcase-prev');
    const nextBtn = document.querySelector('.showcase-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.slidePrev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.slideNext());
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.stack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.stack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.slideNext();
        else this.slidePrev();
        this.resetAutoSlide();
      }
    });
  }
  
  createDots() {
    const dotsContainer = document.getElementById('showcaseDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    const visibleCount = Math.min(this.totalItems, 7); // Show dots for first 7 items
    
    for (let i = 0; i < visibleCount; i++) {
      const dot = document.createElement('span');
      dot.classList.add('showcase-dot');
      if (i === this.currentIndex % visibleCount) dot.classList.add('active');
      dot.addEventListener('click', () => {
        this.goToSlide(i);
        this.resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }
  }
  
  updateDots() {
    const dots = document.querySelectorAll('.showcase-dot');
    const visibleCount = dots.length;
    const activeDotIndex = this.currentIndex % visibleCount;
    
    dots.forEach((dot, idx) => {
      if (idx === activeDotIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }
  
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.slideNext();
    }, 4000);
  }
  
  resetAutoSlide() {
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('showcaseStack')) {
    new ShowcaseGallery('showcaseStack');
  }
});
