import React, { useEffect } from 'react';
import { useAndroidFeatures } from '../hooks/useAndroidFeatures';

interface AndroidOptimizedProps {
  children: React.ReactNode;
}

export function AndroidOptimized({ children }: AndroidOptimizedProps) {
  const { isNative, setStatusBarColor } = useAndroidFeatures();

  useEffect(() => {
    if (isNative) {
      // Set app-specific status bar styling
      setStatusBarColor('#ffffff');
      
      // Add mobile-specific CSS classes
      document.body.classList.add('mobile-app');
      
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }

    return () => {
      if (isNative) {
        document.body.classList.remove('mobile-app');
      }
    };
  }, [isNative, setStatusBarColor]);

  return (
    <div className={`min-h-screen ${isNative ? 'mobile-optimized' : ''}`}>
      {children}
    </div>
  );
}