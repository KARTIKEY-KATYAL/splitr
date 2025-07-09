/**
 * Scroll-triggered animation utilities
 */

// Intersection Observer for scroll animations
export const initScrollAnimations = () => {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observe all elements with scroll animation classes
  const scrollElements = document.querySelectorAll(
    '.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-scale'
  );

  scrollElements.forEach((el) => {
    observer.observe(el);
  });

  return observer;
};

// Staggered animation utility
export const staggerChildren = (container, delay = 100) => {
  if (typeof window === 'undefined') return;

  const children = container.children;
  Array.from(children).forEach((child, index) => {
    child.style.animationDelay = `${index * delay}ms`;
  });
};

// Parallax effect utility
export const initParallax = () => {
  if (typeof window === 'undefined') return;

  const parallaxElements = document.querySelectorAll('[data-parallax]');

  const updateParallax = () => {
    const scrollY = window.pageYOffset;

    parallaxElements.forEach((element) => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  };

  window.addEventListener('scroll', updateParallax, { passive: true });
  return updateParallax;
};

// Mouse move parallax effect
export const initMouseParallax = () => {
  if (typeof window === 'undefined') return;

  const parallaxElements = document.querySelectorAll('[data-mouse-parallax]');

  const updateMouseParallax = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    parallaxElements.forEach((element) => {
      const speed = element.dataset.mouseParallax || 0.1;
      const x = (clientX - innerWidth / 2) * speed;
      const y = (clientY - innerHeight / 2) * speed;
      element.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
  };

  window.addEventListener('mousemove', updateMouseParallax, { passive: true });
  return updateMouseParallax;
};

// Magnetic button effect
export const initMagneticButtons = () => {
  if (typeof window === 'undefined') return;

  const magneticButtons = document.querySelectorAll('.magnetic-button');

  magneticButtons.forEach((button) => {
    button.addEventListener('mouseenter', () => {
      button.style.transition = 'transform 0.3s ease';
    });

    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0)';
    });
  });
};

// Ripple effect utility
export const createRipple = (event) => {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');

  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
};

// Initialize all animations
export const initAllAnimations = () => {
  if (typeof window === 'undefined') return;

  // Initialize when DOM is ready
  const init = () => {
    initScrollAnimations();
    initParallax();
    initMouseParallax();
    initMagneticButtons();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
};

// Performance-optimized scroll handler
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Debounce utility for resize events
export const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation utilities for React components
export const useAnimationClasses = (baseClasses = '', animationClasses = '') => {
  if (prefersReducedMotion()) {
    return baseClasses;
  }
  return `${baseClasses} ${animationClasses}`.trim();
};
