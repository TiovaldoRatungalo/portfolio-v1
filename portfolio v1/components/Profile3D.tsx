"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Theme-matched palette: purples + lavender
const PALETTE = [
  [108, 79,  199], // #6C4FC7 brand primary
  [74,  46,  140], // #4A2E8C brand dark
  [178, 160, 235], // #B2A0EB lavender
  [140, 110, 210], // #8C6ED2 soft violet
  [196, 181, 253], // #C4B5FD purple pastel
  [237, 233, 254], // #EDE9FE near white
] as const;

interface Particle {
  x: number; y: number;       // current
  tx: number; ty: number;     // target
  ease: number;
  delay: number;
  r: number; size: number;    // radius, filled
  cr: number; cg: number; cb: number; // color
  settled: boolean;
}

export default function Profile3D() {
  const imgRef = useRef<HTMLDivElement>(null);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (animationDone) return;

    const canvas = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width  = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.cssText = `
      position:fixed;top:0;left:0;
      width:100vw;height:100vh;
      pointer-events:none;z-index:9999;
      transition:opacity 0.8s ease-in-out;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    let rafId: number;
    let tid: ReturnType<typeof setTimeout>;

    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous";

    imgEl.onload = () => {
      const container = imgRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // ── Sample pixels from profile image ───────────────────────────────────
      const off = document.createElement("canvas");
      const offCtx = off.getContext("2d")!;
      off.width = w; off.height = h;
      offCtx.beginPath();
      offCtx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      offCtx.closePath();
      offCtx.clip();
      offCtx.drawImage(imgEl, 0, 0, w, h);
      const data = offCtx.getImageData(0, 0, w, h).data;

      // ── Particle count control ──────────────────────────────────────────────
      // Large step = far fewer particles = no lag
      const isMobile = vw < 768;
      const step = isMobile ? 18 : 12; // ~400 particles desktop, ~200 mobile
      const particles: Particle[] = [];

      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const idx = (py * w + px) * 4;
          if (data[idx + 3] < 60) continue;

          // target = real screen coords
          const tx = rect.left + px;
          const ty = rect.top  + py;

          // spawn anywhere on screen randomly
          const sx = Math.random() * vw;
          const sy = Math.random() * vh;

          const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];

          particles.push({
            x: sx, y: sy,
            tx, ty,
            ease: 0.025 + Math.random() * 0.025, // slower, more satisfying
            delay: Math.floor(Math.random() * 40),  // longer stagger spread
            r: 0,
            size: 1.5 + Math.random() * 2,
            cr: col[0], cg: col[1], cb: col[2],
            settled: false,
          });
        }
      }

      // ── Animation loop (optimized: single batch path per frame) ────────────
      // Pre-group particles by color to batch fillStyle changes
      const animate = () => {
        ctx.clearRect(0, 0, vw, vh);

        let allSettled = true;

        // ★ NO shadowBlur — it's the #1 canvas performance killer
        // Instead: draw two circles (bigger+transparent outer, smaller+opaque core)
        // Grouping by color to minimize fillStyle switches
        const byColor = new Map<string, { x: number; y: number; size: number; opacity: number }[]>();

        for (const p of particles) {
          if (p.settled) {
            // still draw at final position
            const key = `${p.cr},${p.cg},${p.cb}`;
            if (!byColor.has(key)) byColor.set(key, []);
            byColor.get(key)!.push({ x: p.tx, y: p.ty, size: p.size, opacity: 0.75 });
            continue;
          }

          if (p.delay > 0) { p.delay--; allSettled = false; continue; }

          p.x += (p.tx - p.x) * p.ease;
          p.y += (p.ty - p.y) * p.ease;

          const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
          if (dist < 0.8) { p.settled = true; p.x = p.tx; p.y = p.ty; }
          else allSettled = false;

          const key = `${p.cr},${p.cg},${p.cb}`;
          if (!byColor.has(key)) byColor.set(key, []);
          byColor.get(key)!.push({ x: p.x, y: p.y, size: p.size, opacity: 0.5 + Math.random() * 0.4 });
        }

        // Draw batched per color — use moveTo to keep each arc isolated (no connecting lines)
        byColor.forEach((pts, key) => {
          const [r, g, b] = key.split(",");

          // soft outer halo (transparent, larger)
          ctx.fillStyle = `rgba(${r},${g},${b},0.2)`;
          ctx.beginPath();
          for (const p of pts) {
            ctx.moveTo(p.x + p.size * 1.8, p.y); // ← critical: prevents "paper" artifact
            ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
          }
          ctx.fill();

          // crisp dot core
          ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
          ctx.beginPath();
          for (const p of pts) {
            ctx.moveTo(p.x + p.size * 0.65, p.y);
            ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
          }
          ctx.fill();
        });

        if (!allSettled) {
          rafId = requestAnimationFrame(animate);
        } else {
          canvas.style.opacity = "0";
          setTimeout(() => { canvas.remove(); setAnimationDone(true); }, 800);
        }
      };

      // ── Wait for stroketext:complete event, then start with 300ms buffer ──
      const startParticles = () => {
        tid = setTimeout(animate, 300);
      };

      // If StrokeText fires before image loads, we'd miss it.
      // So we listen regardless — if event already fired (edge case), fallback after 3s.
      window.addEventListener('stroketext:complete', startParticles, { once: true });

      // Fallback: if StrokeText event never fires (e.g. reduced motion), start after 3s
      const fallback = setTimeout(() => {
        window.removeEventListener('stroketext:complete', startParticles);
        animate();
      }, 3000);

      return () => {
        window.removeEventListener('stroketext:complete', startParticles);
        clearTimeout(fallback);
      };
    };

    imgEl.src = "/profil.png";

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(tid);
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={imgRef}
      className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[28rem] lg:h-[28rem] mx-auto flex-shrink-0"
    >
      <motion.img
        src="/profil.png"
        alt="Tiovaldo"
        loading="lazy"
        initial={{ opacity: 0 }}
        animate={{ opacity: animationDone ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="w-full h-full rounded-full object-cover object-top block border-[4px] border-background shadow-2xl"
      />
    </div>
  );
}
