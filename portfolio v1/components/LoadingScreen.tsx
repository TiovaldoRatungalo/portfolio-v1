"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoadingTransition } from '@/hooks/useLoadingTransition';

export default function LoadingScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { 
    containerRef, 
    panelTopRef, 
    panelBottomRef, 
    hudRef, 
    percentRef, 
    progressRef,
    addToHudRefs
  } = useLoadingTransition(pathname, searchParams);

  // Randomize text for sci-fi HUD feel
  const [loadingText, setLoadingText] = useState("SYS.INIT");
  
  useEffect(() => {
    const texts = ["SYS.INIT", "MEM.ALLOC", "CORE.SYNC", "UI.RENDER", "DATA.FETCH", "SYS.READY"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 250);
    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  return (
    <>
      {/* Loading Screen Overlay Layer */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 z-[9999] flex flex-col font-mono"
      >
        {/* Top Panel (Splits Upward) */}
        <div 
          ref={panelTopRef} 
          className="flex-1 bg-background/98 backdrop-blur-3xl border-b border-primary/20 w-full relative overflow-hidden flex items-end justify-center pb-10"
        >
          {/* Subtle Grid overlay for command-center aesthetic */}
          <div className="absolute inset-0 hud-grid opacity-30" />
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
        
        {/* Bottom Panel (Splits Downward) */}
        <div 
          ref={panelBottomRef} 
          className="flex-1 bg-background/98 backdrop-blur-3xl border-t border-primary/20 w-full relative overflow-hidden flex items-start justify-center pt-10"
        >
           {/* Subtle Grid overlay */}
           <div className="absolute inset-0 hud-grid opacity-30" />
           <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
        
        {/* HUD Elements Container */}
        <div ref={hudRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center justify-center w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
            
            {/* Animated Sci-Fi Radar/Orbit Rings */}
            <div ref={addToHudRefs} className="absolute inset-0 m-auto w-[240px] h-[240px] md:w-[320px] md:h-[320px] rounded-full border-[0.5px] border-primary/20 border-l-primary/60 animate-[spin_4s_linear_infinite]" />
            <div ref={addToHudRefs} className="absolute inset-0 m-auto w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border-[0.5px] border-primary/10 border-t-primary/80 animate-[spin_3s_linear_infinite_reverse]" />
            <div ref={addToHudRefs} className="absolute inset-0 m-auto w-[160px] h-[160px] md:w-[240px] md:h-[240px] rounded-full border-[0.5px] border-dashed border-primary/20 animate-[spin_10s_linear_infinite]" />
            
            {/* Center Information Box */}
            <div ref={addToHudRefs} className="z-10 flex flex-col items-center gap-4 bg-background/80 backdrop-blur-xl px-8 py-6 rounded-lg border border-primary/30 glow-border shadow-[0_0_40px_rgba(108,79,199,0.15)] min-w-[240px]">
               
               {/* Header Info */}
               <div className="flex w-full justify-between items-center text-primary/70 text-[10px] tracking-[0.2em] uppercase">
                 <span>Status</span>
                 <span className="text-primary neon">{loadingText}</span>
               </div>
               
               {/* Percentage Counter */}
               <div className="text-5xl md:text-6xl font-light text-primary neon tracking-tighter tabular-nums flex items-end">
                 <span ref={percentRef}>000</span>
                 <span className="text-2xl md:text-3xl text-primary/50 ml-1 mb-1">%</span>
               </div>
               
               {/* Custom Progress Line (Not default browser progress) */}
               <div className="w-full h-[2px] bg-primary/10 rounded-full overflow-hidden relative mt-2">
                  <div ref={progressRef} className="absolute top-0 left-0 h-full bg-primary neon shadow-[0_0_10px_rgba(108,79,199,0.8)] w-0" />
               </div>
               
               {/* Footer indicators */}
               <div className="w-full flex justify-between mt-1">
                 <div className="h-1 w-1 bg-primary/40 rounded-full" />
                 <div className="h-1 w-1 bg-primary/40 rounded-full" />
                 <div className="h-1 w-1 bg-primary/40 rounded-full" />
                 <div className="h-1 w-1 bg-primary/40 rounded-full animate-pulse" />
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
