"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Profile3D() {
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const handleTextComplete = () => {
      setAnimationDone(true);
    };

    window.addEventListener('stroketext:complete', handleTextComplete, { once: true });

    // Fallback: if StrokeText event never fires (e.g. reduced motion), start after 3s
    const fallback = setTimeout(() => {
      setAnimationDone(true);
    }, 3000);

    return () => {
      window.removeEventListener('stroketext:complete', handleTextComplete);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[28rem] lg:h-[28rem] mx-auto flex-shrink-0"
    >
      <motion.img
        src="/profil.png"
        alt="Tiovaldo"
        loading="lazy"
        initial={{ filter: "blur(20px)", opacity: 0 }}
        animate={{ 
          filter: animationDone ? "blur(0px)" : "blur(20px)",
          opacity: 1
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="w-full h-full rounded-full object-cover object-top block border-[4px] border-background shadow-2xl"
      />
    </div>
  );
}
