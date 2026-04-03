import { useState, useEffect } from 'react';

/**
 * Custom hook for managing Smart-hide behavior based on scroll direction
 * @param {number} threshold - Scroll distance before triggering hide (default: 100px)
 * @returns {boolean} isVisible - Whether the component should be visible
 */
export const useScrollVisibility = (threshold = 100) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide header if scrolled past threshold
      if (currentScrollY > threshold) {
        // Scrolling down -> Hide
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        }
        // Scrolling up -> Show
        else {
          setIsVisible(true);
        }
      } else {
        // Always show near the top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, threshold]);

  return isVisible;
};

export default useScrollVisibility;
