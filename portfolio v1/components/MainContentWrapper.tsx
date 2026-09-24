"use client";

import React, { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { loadingPhase } = useLoading();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only set to true when it's completely done so animations trigger fresh
    if (loadingPhase === 'done') {
      setShouldRender(true);
    }
  }, [loadingPhase]);

  // Jangan render sama sekali sebelum selesai, agar framer-motion tidak curi start
  if (!shouldRender) {
    return <div id="main-content-wrapper" className="w-full min-h-screen" />;
  }

  return (
    <div 
      id="main-content-wrapper" 
      className="w-full min-h-screen animate-in fade-in slide-in-from-bottom-8 duration-[1200ms] ease-out fill-mode-both"
    >
      {children}
    </div>
  );
}
