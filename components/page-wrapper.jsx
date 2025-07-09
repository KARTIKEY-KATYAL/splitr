"use client";

import { useEffect, useState } from "react";

export default function PageWrapper({ children, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return (
      <div className={`min-h-screen ${className}`}>
        <div className="loading-shimmer">
          <div className="h-8 bg-muted rounded-md mb-4"></div>
          <div className="h-4 bg-muted rounded-md mb-2"></div>
          <div className="h-4 bg-muted rounded-md mb-2"></div>
          <div className="h-4 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

// Higher-order component for easy page wrapping
export function withPageWrapper(Component, options = {}) {
  const { className = "", ...restOptions } = options;
  
  return function WrappedComponent(props) {
    return (
      <PageWrapper className={className} {...restOptions}>
        <Component {...props} />
      </PageWrapper>
    );
  };
}
