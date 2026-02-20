"use client"

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [hasShownInitialLoad, setHasShownInitialLoad] = useState(false);
  const pathname = usePathname();

  // Show loading on initial mount
  useEffect(() => {
    if (!hasShownInitialLoad) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setHasShownInitialLoad(true);
        // Store in sessionStorage to avoid showing again in same session
        sessionStorage.setItem('initialLoadShown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasShownInitialLoad]);

  // Show loading on pathname changes (after initial load)
  useEffect(() => {
    // Check if initial load was already shown in this session
    const initialLoadShown = sessionStorage.getItem('initialLoadShown');
    if (initialLoadShown) {
      setHasShownInitialLoad(true);
    }
    
    if (hasShownInitialLoad) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pathname, hasShownInitialLoad]);

  return (
    <>
      {loading && <LoadingScreen />}
      {children}
    </>
  );
}

