"use client";

import { useEffect, useRef } from 'react';

export function useScrollAnimation() {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const elements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-scale, .animate-on-scroll-slide-left, .animate-on-scroll-slide-right');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return elementsRef;
}

export function ScrollAnimationProvider({ children }) {
  useScrollAnimation();
  return <>{children}</>;
}
