(function ($) {

"use strict";

  // PRE LOADER
  $(window).on('load', function(){
    $('.preloader').fadeOut(1000); // set duration in brackets    
  });
  
  // Fallback for preloader if load event doesn't fire
  setTimeout(function(){
    $('.preloader').fadeOut(1000);
  }, 3000);

  // CUSTOM LINK
  $('.custom-link').click(function(){
  var el = $(this).attr('href');
  var elWrapped = $(el);
  var header_height = $('.navbar').height() + 10;

  scrollToDiv(elWrapped,header_height);
  return false;

  function scrollToDiv(element,navheight){
    var offset = element.offset();
    var offsetTop = offset.top;
    var totalScroll = offsetTop-navheight;

    $('body,html').animate({
    scrollTop: totalScroll
    }, 300);
}
});

  // ENHANCED MOBILE EXPERIENCE

  // Mobile video optimization - simplified for faster loading
  function optimizeMobileVideo() {
    if (window.innerWidth <= 991) {
      const video = document.querySelector('#video-container video');
      if (video) {
        // Only add essential mobile attributes
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('loop', '');
        
        // Remove any filters that might slow down rendering
        video.style.filter = 'none';
      }
    }
  }

  // Mobile navigation gestures
  function initMobileGestures() {
    if (window.innerWidth <= 991) {
      let startY = 0;
      let currentY = 0;
      let isScrolling = false;
      
      // Touch start
      document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isScrolling = false;
      }, { passive: true });
      
      // Touch move
      document.addEventListener('touchmove', function(e) {
        currentY = e.touches[0].clientY;
        const diffY = Math.abs(currentY - startY);
        
        if (diffY > 10) {
          isScrolling = true;
        }
      }, { passive: true });
      
      // Touch end - handle navigation gestures
      document.addEventListener('touchend', function(e) {
        if (!isScrolling) {
          const target = e.target;
          
          // Enhanced touch feedback
          if (target.classList.contains('custom-btn') || 
              target.classList.contains('navbar-nav') ||
              target.classList.contains('click-scroll')) {
            
            // Add touch feedback
            target.style.transform = 'scale(0.95)';
            setTimeout(() => {
              target.style.transform = '';
            }, 150);
          }
        }
      }, { passive: true });
    }
  }

  // Mobile navigation improvements
  function enhanceMobileNavigation() {
    if (window.innerWidth <= 991) {
      const navbarToggler = document.querySelector('.navbar-toggler');
      const navbarCollapse = document.querySelector('.navbar-collapse');
      
      if (navbarToggler && navbarCollapse) {
        // Enhanced navbar toggle animation
        navbarToggler.addEventListener('click', function() {
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          
          if (isExpanded) {
            navbarCollapse.classList.add('collapsing');
            setTimeout(() => {
              navbarCollapse.classList.remove('collapsing');
              navbarCollapse.classList.remove('show');
            }, 300);
          } else {
            navbarCollapse.classList.add('show');
          }
        });
        
        // Close navbar when clicking on a link
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
          link.addEventListener('click', function() {
            if (navbarCollapse.classList.contains('show')) {
              navbarCollapse.classList.remove('show');
              navbarToggler.setAttribute('aria-expanded', 'false');
            }
          });
        });
        
        // Close navbar when clicking outside
        document.addEventListener('click', function(e) {
          if (!navbarToggler.contains(e.target) && 
              !navbarCollapse.contains(e.target) &&
              navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }
  }

  // Mobile form enhancements
  function enhanceMobileForms() {
    if (window.innerWidth <= 991) {
      const formControls = document.querySelectorAll('.form-control');
      
      formControls.forEach(control => {
        // Prevent zoom on iOS
        control.addEventListener('focus', function() {
          this.style.fontSize = '16px';
        });
        
        // Enhanced focus states
        control.addEventListener('focus', function() {
          this.parentElement.style.transform = 'translateY(-1px)';
        });
        
        control.addEventListener('blur', function() {
          this.parentElement.style.transform = '';
        });
      });
      
      // Enhanced checkbox interactions
      const checkboxes = document.querySelectorAll('.form-check-input');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const label = this.nextElementSibling;
          if (this.checked) {
            label.style.color = 'var(--secondary-color)';
          } else {
            label.style.color = '';
          }
        });
      });
    }
  }

  // Mobile scroll optimizations
  function optimizeMobileScroll() {
    if (window.innerWidth <= 991) {
      // Keep navbar transparent - no scroll state changes
      // This maintains the original transparent header behavior
    }
  }

  // Mobile performance optimizations
  function optimizeMobilePerformance() {
    if (window.innerWidth <= 991) {
      // Lazy load images for better performance
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
      
      // Optimize animations for mobile
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
      }
    }
  }

  // Mobile accessibility improvements
  function enhanceMobileAccessibility() {
    if (window.innerWidth <= 991) {
      // Add skip navigation for screen readers
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'skip-link';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--secondary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      `;
      
      skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
      
      // Add main content landmark
      const mainContent = document.querySelector('main');
      if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
      }
    }
  }

  // Initialize all mobile enhancements
  function initMobileEnhancements() {
    optimizeMobileVideo();
    initMobileGestures();
    enhanceMobileNavigation();
    enhanceMobileForms();
    optimizeMobileScroll();
    optimizeMobilePerformance();
    enhanceMobileAccessibility();
  }

  // Run mobile enhancements on DOM ready
  $(document).ready(function() {
    initMobileEnhancements();
  });

  // Re-run on window resize
  let resizeTimer;
  $(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      initMobileEnhancements();
    }, 250);
  });

  // Handle orientation change
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      initMobileEnhancements();
    }, 500);
  });

})(window.jQuery);


