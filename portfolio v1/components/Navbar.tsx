"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { FaPlay, FaPause } from "react-icons/fa";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// Custom hook untuk mendeteksi scroll dan mengubah state navbar
const useScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Jika scroll lebih dari 50px, kita anggap navbar harus mengecil
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    // Jalankan sekali saat mount untuk mengecek posisi scroll awal
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isScrolled = useScroll();

  useEffect(() => setMounted(true), []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    window.dispatchEvent(
      new CustomEvent("theme-pixel-transition", {
        detail: { theme: newTheme },
      })
    );
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
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
      {/* elemen audio (tidak terlihat tapi tetap aktif) */}
      <audio ref={audioRef} src="/music/bgm.mp3" loop />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link href="#home" className="flex items-center space-x-2 group">
              <motion.img
                src="/logo.png"
                alt="Logo"
                className={`transition-all duration-300 ${
                  isScrolled
                    ? "h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14"
                    : "h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20"
                }`}
                whileHover={{ scale: 1.05, filter: "drop-shadow(0 0 8px rgba(108,79,199,0.6))" }}
              />
              <motion.span 
                className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none"
                whileHover={{ textShadow: "0px 0px 8px rgba(108,79,199,0.5)" }}
              >
                Portfolio
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
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

            {/* Toggle Theme */}
            {mounted && (
              <>
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

                {/* Tombol Musik */}
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

          {/* Mobile Hamburger */}
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

      {/* Mobile Menu */}
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

              {/* Toggle Theme (Mobile) */}
              {mounted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 mt-2 border-t border-gray-200/50 dark:border-[#2A2438] flex gap-3"
                >
                  <button
                    onClick={() => {
                      handleThemeToggle();
                      setIsOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg bg-primary/10 text-primary dark:bg-[#1A1625] dark:text-foreground border border-primary/20 dark:border-[#6C4FC7]/40 active:scale-95 transition-all text-sm"
                  >
                    {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>

                  {/* Tombol Musik (Mobile) */}
                  <button
                    onClick={toggleMusic}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg text-sm active:scale-95 transition-all ${
                      isPlaying
                        ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(108,79,199,0.6)]"
                        : "bg-transparent dark:bg-[#1A1625] text-foreground border border-gray-300 dark:border-[#6C4FC7]/40"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <FaPause size={12} /> Pause
                      </>
                    ) : (
                      <>
                        <FaPlay size={12} /> Play
                      </>
                    )}
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
