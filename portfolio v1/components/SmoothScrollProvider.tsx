"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider() {
  useEffect(() => {
    // ── 1. Init Lenis ───────────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // ── 2. Sync Lenis → GSAP ticker ─────────────────────────────────────────
    // This is the official recommended integration pattern
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0); // prevent GSAP from skipping frames

    // ── 3. Sync Lenis scroll position → ScrollTrigger ───────────────────────
    lenis.on("scroll", ScrollTrigger.update);

    // ── 4. Tell ScrollTrigger to use Lenis scroll position ──────────────────
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    // ── 5. Refresh ScrollTrigger after fonts/images load ────────────────────
    const onLoad = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      ScrollTrigger.scrollerProxy(document.documentElement, undefined as any);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  // Purely behavioral — renders nothing
  return null;
}
