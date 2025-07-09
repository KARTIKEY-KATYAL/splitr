"use client";

import { useEffect } from "react";
import { initAllAnimations } from "@/lib/scroll-animations";

/**
 * Animation Provider Component
 * Initializes all scroll-triggered and interactive animations
 */
export function AnimationProvider({ children }) {
  useEffect(() => {
    // Initialize animations when component mounts
    initAllAnimations();
  }, []);

  return <>{children}</>;
}

/**
 * Scroll Animation Wrapper Component
 * Wraps content with scroll-triggered animation classes
 */
export function ScrollAnimationWrapper({ 
  children, 
  animation = "fade", 
  delay = 0,
  className = ""
}) {
  const animationClasses = {
    fade: "animate-on-scroll",
    slideLeft: "animate-on-scroll-left",
    slideRight: "animate-on-scroll-right",
    scale: "animate-on-scroll-scale",
  };

  const animationClass = animationClasses[animation] || animationClasses.fade;
  const delayClass = delay > 0 ? `animate-stagger-${Math.min(delay, 10)}` : "";

  return (
    <div className={`${animationClass} ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Staggered Animation Container
 * Automatically applies staggered animations to child elements
 */
export function StaggeredContainer({ 
  children, 
  baseDelay = 100,
  className = ""
}) {
  useEffect(() => {
    const container = document.querySelector(`[data-stagger-container]`);
    if (container) {
      const children = container.children;
      Array.from(children).forEach((child, index) => {
        child.style.animationDelay = `${index * baseDelay}ms`;
      });
    }
  }, [baseDelay]);

  return (
    <div data-stagger-container className={className}>
      {children}
    </div>
  );
}

/**
 * Parallax Container
 * Adds parallax effect to content
 */
export function ParallaxContainer({ 
  children, 
  speed = 0.5,
  mouseParallax = false,
  className = ""
}) {
  return (
    <div 
      data-parallax={speed}
      data-mouse-parallax={mouseParallax ? speed : undefined}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Magnetic Button Wrapper
 * Adds magnetic hover effect to buttons
 */
export function MagneticButton({ 
  children, 
  intensity = 0.2,
  className = ""
}) {
  return (
    <div 
      className={`magnetic-button ${className}`.trim()}
      style={{ '--magnetic-intensity': intensity }}
    >
      {children}
    </div>
  );
}

/**
 * Ripple Effect Button
 * Adds ripple click effect to buttons
 */
export function RippleButton({ 
  children, 
  onClick,
  className = "",
  ...props
}) {
  const handleClick = (e) => {
    // Create ripple effect
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`ripple-button ${className}`.trim()}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Loading Animation Component
 * Shows various loading animations
 */
export function LoadingAnimation({ 
  type = "spinner", 
  size = "md",
  className = ""
}) {
  const animations = {
    spinner: "animate-loading-spinner",
    dots: "animate-loading-dots",
    bars: "animate-loading-bars",
    pulse: "animate-loading-pulse",
    wave: "animate-loading-wave",
  };

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const animationClass = animations[type] || animations.spinner;
  const sizeClass = sizes[size] || sizes.md;

  if (type === "dots") {
    return (
      <div className={`flex space-x-1 ${className}`.trim()}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${sizeClass} bg-current rounded-full ${animationClass}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (type === "bars") {
    return (
      <div className={`flex space-x-1 ${className}`.trim()}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-1 h-6 bg-current ${animationClass}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${animationClass} ${className}`.trim()}>
      <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
    </div>
  );
}

/**
 * Text Animation Component
 * Animates text appearance
 */
export function AnimatedText({ 
  text, 
  animation = "typewriter",
  className = ""
}) {
  const animationClasses = {
    typewriter: "animate-typewriter",
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up-fade",
    neon: "animate-neon-glow",
  };

  const animationClass = animationClasses[animation] || animationClasses.fadeIn;

  return (
    <span className={`${animationClass} ${className}`.trim()}>
      {text}
    </span>
  );
}

/**
 * Floating Action Button
 * Animated floating action button
 */
export function FloatingActionButton({ 
  children, 
  onClick,
  position = "bottom-right",
  className = ""
}) {
  const positions = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6",
  };

  const positionClass = positions[position] || positions["bottom-right"];

  return (
    <button
      onClick={onClick}
      className={`
        ${positionClass}
        animate-floating
        animate-hover-lift
        hover-glow
        w-14 h-14
        bg-primary text-primary-foreground
        rounded-full
        shadow-lg
        flex items-center justify-center
        transition-all duration-300
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}
