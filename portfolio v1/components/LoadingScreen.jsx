"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onFinish }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Removed iOS specific loading screen as requested
    onFinish?.();
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0D0B14] text-foreground"
        >
          <div className="text-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl sm:text-4xl font-bold"
            >
              Hola amigos 👋
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs mt-2 text-muted-foreground"
            >
              Please stay on screen while it loads ⏳
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
