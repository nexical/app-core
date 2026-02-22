import React, { useState, useEffect } from 'react';

/**
 * Reactive Theme Synchronization Example
 *
 * This example demonstrates the "Gold Standard" pattern for syncing
 * internal component state with the global '.dark' class on the HTML element.
 */
export const ReactiveComponent = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // SSR-Safe Browser API Access: Guarded within useEffect
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    };

    // Initial check on mount
    checkTheme();

    // Reactive Theme Synchronization: Sync internal state with document.documentElement
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
    </div>
  );
};
