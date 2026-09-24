"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLoading } from '@/contexts/LoadingContext';

export function useLoadingTransition(pathname: string, searchParams: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelTopRef = useRef<HTMLDivElement>(null);
  const panelBottomRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hudElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { setLoadingPhase } = useLoading();

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear out any old timeline/context before running a new one
    const ctx = gsap.context(() => {
      // 1. Initial setup - Reset values for new transition
      setLoadingPhase("loading");
      gsap.set(containerRef.current, { pointerEvents: "auto", display: "flex", zIndex: 9999 });
      gsap.set(panelTopRef.current, { yPercent: 0 });
      gsap.set(panelBottomRef.current, { yPercent: 0 });
      gsap.set(hudRef.current, { opacity: 1, scale: 1 });
      gsap.set(hudElementsRef.current, { opacity: 1, y: 0, scale: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          // Cleanup: remove loading screen from interaction tree after completion
          gsap.set(containerRef.current, { pointerEvents: "none", display: "none" });
          setLoadingPhase("done");
        }
      });

      // 2. Fake loading progress (Simulate asset loading)
      const progressObj = { value: 0 };
      tl.to(progressObj, {
        value: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (percentRef.current) {
            percentRef.current.innerText = Math.round(progressObj.value).toString().padStart(3, '0');
          }
          if (progressRef.current) {
            progressRef.current.style.width = `${progressObj.value}%`;
          }
        }
      })
      // 3. Micro-pause at 100% to let user acknowledge completion
      .to({}, { duration: 0.25 })
      // 4. HUD Exit Animation: Stagger out HUD elements
      .add(() => setLoadingPhase("exiting")) // Officially notify that exiting started
      .to(hudElementsRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.9,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.in"
      })
      // 5. The Main Transition: Split panels (Top moves up, Bottom moves down)
      .to(panelTopRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut"
      }, "split")
      .to(panelBottomRef.current, {
        yPercent: 100,
        duration: 0.9,
        ease: "power4.inOut"
      }, "split");
      
    }, containerRef);

    // Proper cleanup to prevent lagging/retrigger issues
    return () => ctx.revert();
  }, [pathname, searchParams]);

  // Helper to collect refs of elements that need staggered exit
  const addToHudRefs = (el: HTMLDivElement | null) => {
    if (el && !hudElementsRef.current.includes(el)) {
      hudElementsRef.current.push(el);
    }
  };

  return {
    containerRef,
    panelTopRef,
    panelBottomRef,
    hudRef,
    percentRef,
    progressRef,
    addToHudRefs
  };
}
