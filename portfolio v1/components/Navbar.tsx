"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { FaPlay, FaPause } from "react-icons/fa";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const useScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
};

// ── TR Monogram Logo ──────────────────────────────────────────────────────────
function TRLogo({ size }: { size: string }) {
  return (
    <motion.div
      className={`relative flex items-center justify-center transition-all duration-300 ${size}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Ambient glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/30 blur-md"
        animate={{ opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="nbBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a0f3c" />
            <stop offset="100%" stopColor="#0d0820" />
          </linearGradient>
          <linearGradient id="nbLetter" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="45%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6C4FC7" />
          </linearGradient>
          <linearGradient id="nbBorder" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#6C4FC7" />
          </linearGradient>
          <filter id="nbGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nbOuterGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.42  0 0 0 0 0.31  0 0 0 0 0.78  0 0 0 1 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="nbHexClip">
            <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" />
          </clipPath>
        </defs>

        {/* Hexagonal background */}
        <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="url(#nbBg)" />

        {/* Glowing hexagonal border */}
        <polygon
          points="24,2 44,13 44,35 24,46 4,35 4,13"
          fill="none"
          stroke="url(#nbBorder)"
          strokeWidth="1.2"
          filter="url(#nbOuterGlow)"
        />

        {/* Inner subtle border */}
        <polygon
          points="24,5 41,14.5 41,33.5 24,43 7,33.5 7,14.5"
          fill="none"
          stroke="rgba(167,139,250,0.12)"
          strokeWidth="0.5"
        />

        {/* ── Letter "T" — bold geometric ── */}
        <g filter="url(#nbGlow)" clipPath="url(#nbHexClip)">
          {/* Top horizontal bar */}
          <rect x="7" y="13" width="16" height="3.8" rx="0.6" fill="url(#nbLetter)" />
          {/* Vertical stem */}
          <rect x="12.5" y="16.8" width="5" height="18" rx="0.6" fill="url(#nbLetter)" />
        </g>

        {/* ── Letter "R" — bold geometric with angled leg ── */}
        <g filter="url(#nbGlow)" clipPath="url(#nbHexClip)">
          {/* Vertical stem */}
          <rect x="25" y="13" width="4.5" height="21.8" rx="0.6" fill="url(#nbLetter)" />
          {/* Top bar */}
          <rect x="25" y="13" width="11.5" height="3.2" rx="0.6" fill="url(#nbLetter)" />
          {/* Mid bar */}
          <rect x="25" y="22.5" width="10.5" height="3" rx="0.6" fill="url(#nbLetter)" />
          {/* Right bowl curve */}
          <rect x="34" y="16.2" width="3.2" height="9.3" rx="1.6" fill="url(#nbLetter)" />
          {/* Diagonal leg */}
          <polygon points="29.5,25.5 37,35 41,35 33.5,25.5" fill="url(#nbLetter)" />
        </g>

        {/* Corner accent dots */}
        <circle cx="24" cy="2.4" r="1" fill="#e9d5ff" opacity="0.9" />
        <circle cx="43.8" cy="13.4" r="0.65" fill="#c4b5fd" opacity="0.65" />
        <circle cx="4.2"  cy="13.4" r="0.65" fill="#c4b5fd" opacity="0.65" />

        {/* Subtle shine overlay */}
        <ellipse
          cx="15"
          cy="15"
          rx="7"
          ry="3.5"
          fill="white"
          opacity="0.04"
          transform="rotate(-25 15 15)"
        />
      </svg>
    </motion.div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isScrolled = useScroll();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setIsOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    window.dispatchEvent(new CustomEvent("theme-pixel-transition", { detail: { theme: newTheme } }));
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const navLinks = [
    { id: "home",    label: "Home"    },
    { id: "about",   label: "About"   },
    { id: "project", label: "Project" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed w-full z-[9999] transition-all duration-300 border-b ${
        isScrolled
          ? "py-2 bg-white/70 dark:bg-[#0D0B14]/80 backdrop-blur-xl shadow-lg dark:shadow-[0_4px_30px_rgba(108,79,199,0.1)] border-gray-200/50 dark:border-[#6C4FC7]/30"
          : "py-4 bg-transparent border-transparent dark:border-transparent"
      } text-black dark:text-white`}
    >
      <audio ref={audioRef} src="/music/bgm.mp3" loop />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo / Brand ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link href="#home" className="flex items-center group">
              {/* Brand text only */}
              <div className="flex flex-col justify-center">
                <div className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight flex items-baseline gap-0.5">
                  <span className="text-foreground group-hover:text-foreground/90 transition-colors">Tio</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">valdo</span>
                  <motion.span
                    className="text-primary text-2xl leading-none"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >.</motion.span>
                </div>
                <span className="text-[9px] md:text-[11px] text-muted-foreground font-mono tracking-[0.2em] uppercase -mt-0.5 hidden sm:block group-hover:text-primary/70 transition-colors">
                  Portfolio
                </span>
              </div>
            </Link>
          </motion.div>

          {/* ── Desktop Menu ── */}
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`#${link.id}`}
                  className="relative px-1 py-1 text-sm font-medium text-foreground/80 hover:text-primary dark:hover:text-primary transition-colors duration-200 group"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary origin-center rounded-full shadow-[0_0_8px_rgba(108,79,199,0.8)]"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </Link>
              </motion.div>
            ))}

            {mounted && (
              <>
                {/* Theme toggle */}
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  onClick={handleThemeToggle}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(108,79,199,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 flex items-center gap-2 rounded-lg bg-primary/10 text-primary dark:bg-[#1A1625]/60 dark:text-foreground border border-primary/20 dark:border-[#6C4FC7]/40 transition-all text-sm backdrop-blur-sm"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme === "dark" ? "dark" : "light"}
                      initial={{ y: -10, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 10, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                      className="text-base"
                    >
                      {theme === "dark" ? "☀️" : "🌙"}
                    </motion.div>
                  </AnimatePresence>
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </motion.button>

                {/* Music button */}
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  onClick={toggleMusic}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full transition-all duration-300 border flex items-center justify-center h-9 w-9 ${
                    isPlaying
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(108,79,199,0.6)]"
                      : "bg-transparent dark:bg-[#1A1625]/60 border-gray-300 dark:border-[#6C4FC7]/40 text-foreground hover:border-primary/60 hover:shadow-[0_0_8px_rgba(108,79,199,0.3)]"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isPlaying ? "pause" : "play"}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <div className="md:hidden flex items-center">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-transparent dark:border-[#6C4FC7]/30 hover:bg-primary/10 dark:hover:bg-[#1A1625] text-foreground transition-colors duration-200"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-y-auto max-h-[85vh] w-full bg-white/95 dark:bg-[#0D0B14]/95 backdrop-blur-2xl border-b border-gray-200/50 dark:border-[#6C4FC7]/30 shadow-[0_10px_30px_rgba(108,79,199,0.1)]"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Link
                    href={`#${link.id}`}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-[#1A1625] transition-all duration-200 border border-transparent hover:border-primary/20 dark:hover:border-[#6C4FC7]/40"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(108,79,199,0.8)]" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {mounted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 mt-2 border-t border-gray-200/50 dark:border-[#2A2438] flex gap-3"
                >
                  <button
                    onClick={() => { handleThemeToggle(); setIsOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg bg-primary/10 text-primary dark:bg-[#1A1625] dark:text-foreground border border-primary/20 dark:border-[#6C4FC7]/40 active:scale-95 transition-all text-sm"
                  >
                    {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>

                  <button
                    onClick={toggleMusic}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg text-sm active:scale-95 transition-all ${
                      isPlaying
                        ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(108,79,199,0.6)]"
                        : "bg-transparent dark:bg-[#1A1625] text-foreground border border-gray-300 dark:border-[#6C4FC7]/40"
                    }`}
                  >
                    {isPlaying ? <><FaPause size={12} /> Pause</> : <><FaPlay size={12} /> Play</>}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
