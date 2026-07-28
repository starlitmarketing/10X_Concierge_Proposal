/* ==========================================================================
   10X Concierge Presentation Engine - Navigation, Scroll Indicator & Starlit Cursor
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const slides = Array.from(document.querySelectorAll('.slide'));
  const currentNumEl = document.getElementById('current-slide-num');
  const totalNumEl = document.getElementById('total-slide-num');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnOverview = document.getElementById('btn-overview');
  const btnCloseOverview = document.getElementById('btn-close-overview');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const overviewModal = document.getElementById('overview-modal');
  const overviewGrid = document.getElementById('overview-grid');

  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  // Set Total Slides Counter
  if (totalNumEl) {
    totalNumEl.textContent = String(totalSlides).padStart(2, '0');
  }

  // 1. Scroll Indicator Setup for Each Slide
  slides.forEach((slide) => {
    const hint = document.createElement('div');
    hint.className = 'scroll-down-hint';
    hint.innerHTML = `
      <span>Scroll for more</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    `;
    
    // Click indicator to auto scroll down
    hint.addEventListener('click', () => {
      slide.scrollBy({ top: 250, behavior: 'smooth' });
    });

    slide.appendChild(hint);

    // Scroll event listener to hide hint when scrolled to bottom
    slide.addEventListener('scroll', () => {
      updateSlideScrollHint(slide);
    });
  });

  function updateSlideScrollHint(slide) {
    if (!slide.classList.contains('active')) return;
    const hint = slide.querySelector('.scroll-down-hint');
    if (!hint) return;

    const isScrollable = slide.scrollHeight > slide.clientHeight + 20;
    const isAtBottom = slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 40;

    if (isScrollable && !isAtBottom) {
      hint.classList.add('visible');
    } else {
      hint.classList.remove('visible');
    }
  }

  window.addEventListener('resize', () => {
    const activeSlide = slides[currentSlideIndex];
    if (activeSlide) updateSlideScrollHint(activeSlide);
  });

  // 2. Navigation Core
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    const currentSlide = slides[currentSlideIndex];
    const targetSlide = slides[index];

    if (currentSlide && currentSlide !== targetSlide) {
      currentSlide.classList.add('exiting');
      setTimeout(() => {
        currentSlide.classList.remove('active', 'exiting');
      }, 350);
    }

    targetSlide.classList.add('active');
    targetSlide.scrollTop = 0; // Reset scroll to top
    currentSlideIndex = index;

    // Check Scroll Hint for target slide
    setTimeout(() => {
      updateSlideScrollHint(targetSlide);
    }, 400);

    // Update Counter
    if (currentNumEl) {
      currentNumEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }

    // Update Progress Bar
    if (progressBarFill) {
      const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
      progressBarFill.style.width = `${progressPercent}%`;
    }

    // Update URL Hash cleanly
    history.replaceState(null, null, `#slide-${currentSlideIndex + 1}`);

    // Update Overview Grid Active State
    updateOverviewActiveState();
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Button Click Listeners
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);

  // Logo Reset Listener
  const logoBtn = document.querySelector('.brand-logo-text');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(0);
    });
  }

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (overviewModal && overviewModal.classList.contains('open')) {
      if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') {
        toggleOverviewModal(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'Space':
      case 'PageDown':
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        prevSlide();
        break;
      case 'Home':
        goToSlide(0);
        break;
      case 'End':
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'o':
      case 'O':
        toggleOverviewModal(true);
        break;
    }
  });

  // Touch Swipe Gesture Navigation
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Horizontal Swipe detection (ignore vertical scrolls)
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        nextSlide(); // Swipe Left -> Next Slide
      } else {
        prevSlide(); // Swipe Right -> Prev Slide
      }
    }
  }, { passive: true });

  // 3. Mobile Touch Elevation Toggle for Cards
  const interactiveCards = document.querySelectorAll('.card-luxury, .process-step, .kpi-box, .bullet-item-card');
  interactiveCards.forEach(card => {
    card.addEventListener('touchstart', () => {
      interactiveCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
    }, { passive: true });
  });

  // 4. Overview Modal Builder
  function buildOverviewGrid() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = '';

    slides.forEach((slide, idx) => {
      const titleEl = slide.querySelector('.slide-title-main');
      const titleText = titleEl ? titleEl.innerText.replace('\n', ' ') : `Slide ${idx + 1}`;

      const thumb = document.createElement('div');
      thumb.className = `thumb-card ${idx === currentSlideIndex ? 'active' : ''}`;
      thumb.innerHTML = `
        <div class="thumb-num">SLIDE ${String(idx + 1).padStart(2, '0')}</div>
        <div class="thumb-title">${titleText}</div>
      `;

      thumb.addEventListener('click', () => {
        goToSlide(idx);
        toggleOverviewModal(false);
      });

      overviewGrid.appendChild(thumb);
    });
  }

  function updateOverviewActiveState() {
    const thumbs = document.querySelectorAll('.thumb-card');
    thumbs.forEach((thumb, idx) => {
      if (idx === currentSlideIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  function toggleOverviewModal(show) {
    if (!overviewModal) return;
    if (show) {
      buildOverviewGrid();
      overviewModal.classList.add('open');
    } else {
      overviewModal.classList.remove('open');
    }
  }

  if (btnOverview) btnOverview.addEventListener('click', () => toggleOverviewModal(true));
  if (btnCloseOverview) btnCloseOverview.addEventListener('click', () => toggleOverviewModal(false));

  // 5. Fullscreen Mode
  function toggleFullscreen() {
    if (!document.documentElement) return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // 6. Creative Animated Starlit Star Logo Cursor Follower (Desktop)
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor-follower';
    cursor.innerHTML = `
      <div class="cursor-starlit-wrapper">
        <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5 C50 32 68 50 95 50 C68 50 50 68 50 95 C50 68 32 50 5 50 C32 50 50 32 50 5 Z" fill="url(#starlitGoldGrad)" />
          <path d="M44 44 C44 48 48 52 52 52 C48 52 44 56 44 56 C44 52 40 48 44 44 Z" fill="#0D0D0D" />
          <defs>
            <linearGradient id="starlitGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F2D086"/>
              <stop offset="50%" stop-color="#BF9F5A"/>
              <stop offset="100%" stop-color="#8C6E2D"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    `;
    document.body.appendChild(cursor);

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover scale & rotation effects on interactive elements
    const hoverables = document.querySelectorAll('button, a, .card-luxury, .process-step, .kpi-box, .thumb-card, .scroll-down-hint');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // Initial Slide Hash Sync
  const hash = window.location.hash;
  if (hash && hash.startsWith('#slide-')) {
    const slideNum = parseInt(hash.replace('#slide-', ''), 10);
    if (!isNaN(slideNum) && slideNum >= 1 && slideNum <= totalSlides) {
      goToSlide(slideNum - 1);
    }
  } else {
    // Check initial active slide scroll hint
    updateSlideScrollHint(slides[0]);
  }
});
