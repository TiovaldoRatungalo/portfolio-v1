"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconSend } from "@tabler/icons-react";
import Lottie from "lottie-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  didYouMean?: string[];
};

const initialSuggestions = [
  "Siapa Tiovaldo?",
  "Skill apa saja?",
  "Lihat project",
  "Cara kontak",
];

export default function AiChat({ enabled = true }: { enabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm T-bot, Tiovaldo's AI Assistant. Ask about skills, projects, or experience!",
      suggestions: initialSuggestions,
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [robotAnimation, setRobotAnimation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  if (!enabled) return null;

  // load lottie
  useEffect(() => {
    fetch("/lottie/robot-wave.json")
      .then((res) => res.json())
      .then(setRobotAnimation);
  }, []);

  // auto scroll
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, loading]);

  // typewriter effect with suggestions support
  const typeWriter = (
    text: string,
    suggestions?: string[],
    didYouMean?: string[],
  ) => {
    let i = 0;
    let current = "";

    setTyping(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const interval = setInterval(() => {
      current += text[i];
      i++;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: current,
        };
        return updated;
      });

      if (i >= text.length) {
        clearInterval(interval);
        // Attach suggestions and didYouMean after typewriter completes
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: current,
            suggestions,
            didYouMean,
          };
          return updated;
        });
        setTyping(false);
      }
    }, 20);
  };

  const sendMessage = async (overrideMessage?: string) => {
    const messageToSend = overrideMessage || input;
    if (!messageToSend.trim() || loading || typing) return;

    const userMsg = messageToSend;
    setMessages((p) => [...p, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      setTimeout(() => {
        setLoading(false);
        typeWriter(
          data.reply || "No response.",
          data.suggestions || [],
          data.didYouMean || null,
        );
      }, 600);
    } catch {
      setLoading(false);
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "⚠️ Failed to connect." },
      ]);
    }
  };

  const handleChipClick = (text: string) => {
    if (loading || typing) return;
    sendMessage(text);
  };

  // Find last assistant message index for showing chips
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  return (
    <>
      {/* FLOATING BUTTON */}
      <motion.button
        onClick={() => setOpen((p) => !p)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden"
      >
        {open ? (
          <IconX size={32} className="text-black dark:text-white" />
        ) : (
          robotAnimation && <Lottie animationData={robotAnimation} loop />
        )}
      </motion.button>

      {/* BLUR BACKGROUND */}
      <AnimatePresence>
        {open && (
          <motion.div
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-lg bg-black/40 z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 z-[9999] w-[90vw] max-w-sm h-[460px] glass-card text-foreground rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#2A2438]"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-primary text-primary-foreground font-semibold flex items-center gap-2 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              T-bot
              <span className="ml-auto text-xs opacity-60 font-normal">AI Assistant</span>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-4 space-y-3 overflow-y-auto text-sm"
            >
              {messages.map((m, i) => (
                <div key={i}>
                  <div
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`px-4 py-2.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-gray-100 dark:bg-background dark:text-secondary-foreground rounded-bl-md"
                      }`}
                    >
                      {m.content}
                    </motion.div>
                  </div>

                  {/* Suggestion Chips — only on the last assistant message */}
                  {m.role === "assistant" &&
                    i === lastAssistantIndex &&
                    !typing &&
                    !loading && (
                      <>
                        {/* "Did you mean?" buttons */}
                        {m.didYouMean && m.didYouMean.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className="flex flex-wrap gap-1.5 mt-2 ml-1"
                          >
                            {m.didYouMean.map((dym, j) => (
                              <button
                                key={`dym-${j}`}
                                onClick={() => handleChipClick(dym)}
                                className="px-3 py-1.5 text-xs rounded-full border border-amber-400/50 text-amber-300 
                                  bg-amber-400/10 hover:bg-amber-400/25 transition-all duration-200 
                                  hover:scale-105 active:scale-95"
                              >
                                ❓ {dym}
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {/* Regular suggestion chips */}
                        {m.suggestions && m.suggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.3 }}
                            className="flex flex-wrap gap-1.5 mt-2 ml-1"
                          >
                            {m.suggestions.map((suggestion, j) => (
                              <button
                                key={`sug-${j}`}
                                onClick={() => handleChipClick(suggestion)}
                                className="px-3 py-1.5 text-xs rounded-full border border-border/50 text-foreground/80 
                                  bg-transparent hover:bg-primary/15 hover:border-primary/40 hover:text-primary
                                  transition-all duration-200 hover:scale-105 active:scale-95"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </>
                    )}
                </div>
              ))}

              {/* Animated Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-background flex items-center gap-1.5">
                    <motion.span
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.15,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-200 dark:border-border/20 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask something..."
                disabled={loading || typing}
                className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-background border border-gray-200 dark:border-border/20 
                  text-sm focus:outline-none focus:ring-2 focus:ring-ring 
                  disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || typing || !input.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary 
                  px-3 py-2 rounded-xl transition-all duration-200 active:scale-95
                  hover:shadow-[0_0_14px_rgba(108,79,199,0.5)] disabled:hover:shadow-none"
              >
                <IconSend size={18} className="text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
