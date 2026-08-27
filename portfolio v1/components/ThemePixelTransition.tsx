"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import PixelSwap from "./PixelSwap";

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
const ANIMATION_DURATION_MS = 1200;  // durasi animasi pixel
const PIXEL_DURATION_MS     = 500;   // durasi per-pixel
const AUTO_INTERVAL_MS      = 6000;  // jeda antar auto-toggle
const OVERLAY_FADE_MS       = 500;   // seberapa lama overlay fade in/out
const THEME_CHANGE_DELAY_MS = 200;   // delay sebelum tema berubah (overlay sudah muncul duluan)
// ──────────────────────────────────────────────────────────────────────────────

export default function ThemePixelTransition() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted]       = useState(false);
  const [active, setActive]         = useState(false);
  const [animating, setAnimating]   = useState(false);

  const isAnimatingRef   = useRef(false);
  const resolvedThemeRef = useRef<string | undefined>(undefined);
  const prevThemeRef     = useRef<string | undefined>(undefined);
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // ── Sync refs ──────────────────────────────────────────────────────────────
  useEffect(() => { isAnimatingRef.current = animating; }, [animating]);
  useEffect(() => { resolvedThemeRef.current = resolvedTheme; }, [resolvedTheme]);

  // ── Deteksi perubahan tema (dari klik user atau auto-interval) ─────────────
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    if (prevThemeRef.current === undefined) {
      prevThemeRef.current = resolvedTheme;
      setActive(resolvedTheme === "dark");
      return;
    }

    if (prevThemeRef.current !== resolvedTheme) {
      prevThemeRef.current = resolvedTheme;
      // Sync target layer SETELAH tema berubah
      setActive(resolvedTheme === "dark");
    }
  }, [resolvedTheme, mounted]);

  /**
   * triggerTransition: urutan yang tidak bikin kaget
   * 1) Tampilkan overlay dulu (fade in pelan)
   * 2) Setelah overlay mulai terlihat → baru ubah tema
   * 3) PixelSwap animasi berjalan
   * 4) Setelah selesai → overlay fade out pelan
   */
  const triggerTransition = (newTheme: string) => {
    if (isAnimatingRef.current) return;

    // Step 1: Overlay muncul duluan
    setAnimating(true);

    // Step 2: Ganti tema setelah overlay sudah mulai menutup layar
    setTimeout(() => {
      setTheme(newTheme);
    }, THEME_CHANGE_DELAY_MS);
  };

  // ── Listener untuk trigger manual dari Navbar ──────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const handleCustomToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.theme) {
        triggerTransition(customEvent.detail.theme);
      }
    };

    window.addEventListener("theme-pixel-transition", handleCustomToggle);
    return () => {
      window.removeEventListener("theme-pixel-transition", handleCustomToggle);
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Setelah animasi selesai ────────────────────────────────────────────────
  const handleComplete = () => setAnimating(false);

  if (!mounted) return null;

  /**
   * Layer: solid color — WAJIB solid agar terlihat di dalam cloneNode PixelSwap.
   * backdropFilter tidak bekerja di dalam cloneNode (pixel jadi invisible).
   * Anti-kaget ditangani oleh: slow fade-in overlay + delay tema berubah.
   */
  const lightLayer = (
    <div style={{ width: "100%", height: "100%", background: "#FAFAF8" }} />
  );
  const darkLayer = (
    <div style={{ width: "100%", height: "100%", background: "#0D0B14" }} />
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: animating ? "all" : "none",
        opacity: animating ? 1 : 0,
        // Fade in & out yang pelan = tidak mengagetkan
        transition: `opacity ${OVERLAY_FADE_MS}ms ease`,
      }}
      aria-hidden="true"
    >
      <PixelSwap
        firstContent={lightLayer}
        secondContent={darkLayer}
        active={active}
        trigger="none"
        aspectRatio="unset"
        style={{ width: "100%", height: "100%", aspectRatio: "unset" }}
        pixelSize={90}
        gap={3}
        pixelRadius={10}
        pixelScale={0.6}        // mulai dari 60% → perubahan scale gentle
        pixelSpin={0}           // tanpa rotasi → tidak mengagetkan
        fade={true}
        duration={ANIMATION_DURATION_MS}
        pixelDuration={PIXEL_DURATION_MS}
        pattern="diagonal"      // alur menyilang → terasa natural
        randomness={0.5}
        easing="cubic-bezier(0.22, 1, 0.36, 1)"
        onActiveChange={() => {}}
        onComplete={handleComplete}
      />
    </div>
  );
}
