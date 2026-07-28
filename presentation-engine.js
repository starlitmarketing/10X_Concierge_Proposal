/**
 * 10X Concierge Presentation Engine JavaScript
 * Keyboard, Touch, Animated Slide Transitions & Logo Reset Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentIndex = 0;
  let isTransitioning = false;

  // Elements
  const currentNumEl = document.getElementById('current-slide-num');
  const totalNumEl = document.getElementById('total-slide-num');
  const progressBar = document.getElementById('progress-bar-fill');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const overviewBtn = document.getElementById('btn-overview');
  const closeOverviewBtn = document.getElementById('btn-close-overview');
  const overviewModal = document.getElementById('overview-modal');
  const overviewGrid = document.getElementById('overview-grid');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const brandLogo = document.querySelector('.brand-logo-text');

  if (totalNumEl) {
    totalNumEl.textContent = String(totalSlides).padStart(2, '0');
  }

  // Click Logo -> Reset to First Slide
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(0);
    });
  }

  // Initialize Overview Grid Thumbnails
  slides.forEach((slide, idx) => {
    const titleEl = slide.querySelector('.slide-title-main');
    const titleText = titleEl ? titleEl.childNodes[0].textContent.trim() : `Slide ${idx + 1}`;
    
    const card = document.createElement('div');
    card.className = `thumb-card ${idx === 0 ? 'active' : ''}`;
    card.setAttribute('data-slide-index', idx);
    card.innerHTML = `
      <div class="thumb-num">${String(idx + 1).padStart(2, '0')}</div>
      <div class="thumb-title">${titleText}</div>
    `;
    card.addEventListener('click', () => {
      goToSlide(idx);
      closeOverview();
    });
    if (overviewGrid) {
      overviewGrid.appendChild(card);
    }
  });

  function updateSlideState(targetIndex) {
    if (targetIndex === currentIndex && slides[currentIndex].classList.contains('active')) return;
    if (isTransitioning) return;

    isTransitioning = true;
    const currentSlide = slides[currentIndex];
    const nextSlide = slides[targetIndex];

    // Trigger Exit Animation on current slide
    if (currentSlide && currentSlide !== nextSlide) {
      currentSlide.classList.add('exiting');
      currentSlide.classList.remove('active');
    }

    setTimeout(() => {
      slides.forEach((slide, idx) => {
        slide.classList.remove('active', 'exiting');
        if (idx === targetIndex) {
          slide.classList.add('active');
        }
      });

      currentIndex = targetIndex;

      // Update Counter
      if (currentNumEl) {
        currentNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
      }

      // Update Progress Bar
      if (progressBar) {
        const progressPercent = ((currentIndex + 1) / totalSlides) * 100;
        progressBar.style.width = `${progressPercent}%`;
      }

      // Update Overview Selection
      const thumbs = document.querySelectorAll('.thumb-card');
      thumbs.forEach((thumb, idx) => {
        if (idx === currentIndex) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });

      isTransitioning = false;
    }, 300);
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    updateSlideState(index);
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  function toggleOverview() {
    if (overviewModal) {
      overviewModal.classList.toggle('open');
    }
  }

  function closeOverview() {
    if (overviewModal) {
      overviewModal.classList.remove('open');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fullscreen request failed: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Event Listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (overviewBtn) overviewBtn.addEventListener('click', toggleOverview);
  if (closeOverviewBtn) closeOverviewBtn.addEventListener('click', closeOverview);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (overviewModal && overviewModal.classList.contains('open')) {
      if (e.key === 'Escape') closeOverview();
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'Escape':
      case 'o':
      case 'O':
        e.preventDefault();
        toggleOverview();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  });

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;
  const viewport = document.querySelector('.slides-viewport');

  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // Initial Setup
  slides[0].classList.add('active');
  if (currentNumEl) currentNumEl.textContent = '01';
  if (progressBar) progressBar.style.width = `${(1 / totalSlides) * 100}%`;
});
