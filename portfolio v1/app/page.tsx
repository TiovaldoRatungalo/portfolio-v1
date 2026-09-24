"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import AiChat from "@/components/AiChat";
import StrokeText from "../components/StrokeText";
import RotatingText from "../components/RotatingText";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandInstagram,
  IconBrandGithub,
  IconBrandX,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiUnity,
  SiBlender,
  SiAndroid,
  SiDotnet,
  SiSharp,
  SiJavascript,
} from "react-icons/si";
import {
  FiSend,
  FiDownload,
  FiExternalLink,
  FiGithub,
  FiMail,
  FiUser,
  FiMessageSquare,
  FiCode,
  FiSmartphone,
  FiShield,
  FiGrid,
  FiMonitor,
  FiBox,
  FiCpu,
} from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import LoadingScreen from "../components/LoadingScreen";
import Profile3D from "../components/Profile3D";

// 🧠 Lazy load components berat
const ScrollVelocity = dynamic(() => import("../components/ScrollVelocity"), {
  ssr: false,
});
const LogoLoop = dynamic(() => import("../components/LogoLoop"), {
  ssr: false,
});
const Landyard = dynamic(() => import("../components/Landyard/Landyard"), {
  ssr: false,
});

// ── Tech Badge Component ──────────────────────────────────────────────────────
const TechBadge = ({ icon, label, delay }: { icon: React.ReactNode; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ scale: 1.1, y: -4 }}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 backdrop-blur-sm text-xs font-mono text-foreground/80 hover:border-primary/60 hover:text-primary hover:bg-primary/15 transition-colors duration-300 cursor-default shadow-sm hover:shadow-[0_0_12px_rgba(108,79,199,0.25)]"
  >
    <span className="text-primary">{icon}</span>
    {label}
  </motion.div>
);

// ── 3D Tilt Card Component ─────────────────────────────────────────────────
interface TiltCardProps {
  proj: { image: string; title: string; description: string; tools: string; category: string };
  index: number;
}

const TiltCard = ({ proj, index }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`;
    glare.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    glare.style.opacity = '0';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: "easeOut" }}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          transition: 'transform 0.15s ease-out, box-shadow 0.4s ease',
          transformStyle: 'preserve-3d',
          boxShadow: '0 10px 40px rgba(108, 79, 199, 0.15)',
        }}
      >
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={proj.image}
            alt={proj.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Bottom gradient info panel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B14] via-[#0D0B14]/40 to-transparent flex flex-col justify-end p-5">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 drop-shadow">
            {proj.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
            {proj.description}
          </p>
          <div className="flex flex-wrap gap-1.5 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-75">
            {proj.tools.split(',').map((tool, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-primary/20 border border-primary/40 rounded-full text-[10px] text-white font-mono backdrop-blur-sm">
                {tool.trim()}
              </span>
            ))}
          </div>
        </div>



        {/* Glare Effect */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ opacity: 0, transition: 'opacity 0.3s ease', mixBlendMode: 'overlay' }}
        />

        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-2xl border border-primary/10 group-hover:border-primary/50 transition-colors duration-500 pointer-events-none" />
      </div>
    </motion.div>
  );
};

const SkillRadialProgress = ({ skill, level, delay, icon }: { skill: string, level: number, delay: number, icon?: React.ReactNode }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const step = level / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= level) {
          setCount(level);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, level]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="flex flex-col items-center gap-2 p-3 bg-background/20 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden shadow-[0_0_15px_rgba(108,79,199,0.05)] hover:shadow-[0_0_20px_rgba(108,79,199,0.3)] w-full"
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" className="text-primary/10" />
          <motion.circle
            cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference - (level / 100) * circumference }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: delay + 0.2, ease: "easeOut" }}
            className="text-primary drop-shadow-[0_0_8px_rgba(108,79,199,0.8)]"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          {icon ? (
            <span className="text-primary text-base drop-shadow-[0_0_5px_rgba(108,79,199,0.6)]">{icon}</span>
          ) : (
            <span className="text-xs sm:text-sm font-bold text-foreground drop-shadow-[0_0_5px_rgba(108,79,199,0.5)] font-mono">{count}%</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5 z-10">
        <span className="text-[10px] sm:text-xs font-bold text-foreground group-hover:text-primary transition-colors text-center w-full truncate px-1">
          {skill}
        </span>
        <span className="text-[9px] font-mono text-primary/70">{count}%</span>
      </div>
    </motion.div>
  );
};

const StatBox = ({ value, label, suffix = "", icon }: { value: number, label: string, suffix?: string, icon?: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const step = value / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center justify-center p-4 border border-primary/20 bg-background/40 backdrop-blur-sm rounded-xl relative overflow-hidden group w-full shadow-[0_0_15px_rgba(108,79,199,0.05)]"
    >
      <div className="absolute inset-0 bg-primary/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary opacity-50 group-hover:opacity-100 transition-opacity" />
      {icon && <span className="text-primary/60 group-hover:text-primary z-10 mb-1 transition-colors">{icon}</span>}
      <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground z-10 drop-shadow-[0_0_8px_rgba(108,79,199,0.6)] font-mono">{count}{suffix}</span>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-widest z-10 text-center font-semibold">{label}</span>
    </motion.div>
  );
};

// ── Quote Section Component (Premium Redesign) ───────────────────────────────
const quotes = [
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    role: "Software Engineer & Author",
    tag: "Clean Code",
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
    role: "JavaScript Pioneer",
    tag: "UX Wisdom",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    role: "Programming Wisdom",
    tag: "Problem Solving",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    role: "Developer & Educator",
    tag: "Best Practice",
  },
];

const QUOTE_DURATION = 7000;

// floating particles (static ref so it doesn't regenerate)
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  duration: Math.random() * 8 + 5,
  delay: Math.random() * 6,
  xRange: (Math.random() - 0.5) * 60,
  yRange: -(Math.random() * 80 + 40),
}));

const QuoteSection = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteRef = useRef<HTMLElement>(null);
  const quoteInView = useInView(quoteRef, { once: false, amount: 0.2 });

  // Auto-advance
  useEffect(() => {
    if (!quoteInView) return;
    const timer = setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, QUOTE_DURATION);
    return () => clearTimeout(timer);
  }, [quoteIndex, quoteInView]);

  const current = quotes[quoteIndex];
  const words = current.text.split(" ");

  return (
    <section
      ref={quoteRef}
      className="relative min-h-screen flex items-center justify-center bg-background border-y border-border overflow-hidden snap-start transition-colors duration-300"
    >
      {/* ── BACKGROUND ── */}
      {/* Aurora orbs */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,79,199,0.14) 0%, transparent 70%)", top: "-20%", left: "-15%" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,46,140,0.12) 0%, transparent 70%)", bottom: "-15%", right: "-10%" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Rotating ring (decorative) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 420, height: 420, top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ border: "1px solid rgba(108,79,199,0.08)", boxShadow: "0 0 40px rgba(108,79,199,0.04) inset" }}
        />
      </motion.div>
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 640, height: 640, top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ border: "1px dashed rgba(108,79,199,0.05)" }}
        />
      </motion.div>

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, opacity: 0 }}
          animate={{ x: p.xRange, y: p.yRange, opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
        />
      ))}

      {/* HUD Grid */}
      <div className="absolute inset-0 hud-grid pointer-events-none opacity-15" />

      {/* Top/bottom vignette */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 transition-colors duration-300" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 transition-colors duration-300" />

      {/* ── CONTENT ── */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-8 py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.97 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/70 dark:bg-[#120E1A]/95 backdrop-blur-md border border-gray-200 dark:border-primary/20 shadow-[0_20px_40px_rgba(0,0,0,0.05),_0_0_60px_rgba(108,79,199,0.05)] dark:shadow-[0_0_80px_rgba(108,79,199,0.1),_0_40px_80px_rgba(0,0,0,0.4),_inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors duration-300"
          >
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />



            <div className="p-8 sm:p-12 lg:p-16 flex flex-col gap-10">
              {/* TAG + counter */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {current.tag}
                </span>
                <span className="text-muted-foreground/35 text-xs font-mono">{quoteIndex + 1} / {quotes.length}</span>
              </motion.div>

              {/* GIANT QUOTE MARK + ANIMATED WORDS */}
              <div className="relative min-h-[140px] sm:min-h-[180px]">
                {/* Stylized " */}
                <div
                  className="absolute -top-6 -left-2 sm:-left-4 text-[100px] sm:text-[140px] font-serif leading-none select-none pointer-events-none"
                  style={{
                    background: "linear-gradient(160deg, rgba(108,79,199,0.55) 0%, rgba(108,79,199,0.05) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "Georgia, serif",
                  }}
                  aria-hidden="true"
                >
                  &ldquo;
                </div>

                {/* Word-by-word reveal using stagger */}
                <motion.blockquote
                  className="pl-8 sm:pl-14 pt-10 text-xl sm:text-2xl md:text-3xl lg:text-[2.1rem] font-semibold leading-relaxed text-foreground/90 tracking-tight"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
                    hidden: {},
                  }}
                >
                  {words.map((word, i) => (
                    <motion.span
                      key={`${quoteIndex}-${i}`}
                      variants={{
                        hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { ease: "easeOut", duration: 0.4 } },
                      }}
                      className="inline-block mr-[0.3em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.blockquote>
              </div>

              {/* AUTHOR */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-4 pl-8 sm:pl-14"
              >
                <div
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0 relative"
                  style={{
                    background: "linear-gradient(135deg, hsl(255,53%,58%), hsl(258,50%,36%))",
                    boxShadow: "0 0 24px rgba(108,79,199,0.55)",
                  }}
                >
                  {current.author.charAt(0)}
                  {/* pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-primary/40"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="w-8 h-px bg-gradient-to-r from-primary to-transparent mb-1.5" />
                  <span className="text-sm sm:text-base font-bold text-foreground font-mono">{current.author}</span>
                  <span className="text-[11px] sm:text-xs text-muted-foreground font-mono tracking-widest uppercase">{current.role}</span>
                </div>
              </motion.div>

              {/* PROGRESS BAR + DOTS */}
              <div className="flex items-center gap-4 pl-8 sm:pl-14">
                <div className="flex gap-2 items-center">
                  {quotes.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setQuoteIndex(i)}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 0.8 }}
                      className={`rounded-full transition-all duration-300 ${i === quoteIndex
                          ? "w-5 h-1.5 bg-primary shadow-[0_0_10px_rgba(108,79,199,1)]"
                          : "w-1.5 h-1.5 bg-white/15 hover:bg-primary/50"
                        }`}
                      aria-label={`Quote ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-px bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    key={quoteIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: QUOTE_DURATION / 1000, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Bottom glow line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// ── Category Filter ───────────────────────────────────────────────────────────
const categories = ["All", "Game", "Web", "Mobile", "3D", "Robotics"];
const categoryIcons: Record<string, React.ReactNode> = {
  All: <FiGrid size={13} />,
  Game: <FaGamepad size={13} />,
  Web: <FiMonitor size={13} />,
  Mobile: <FiSmartphone size={13} />,
  "3D": <FiBox size={13} />,
  Robotics: <FiCode size={13} />,
};

export default function Home() {
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const skillsRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  const [isClient, setIsClient] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Parallax for hero profile image
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const profileY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const profileOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const is_ios = /iPad|iPhone|iPod/.test(ua);
      setIsIOS(is_ios);
      if (is_ios) {
        setLoadingDone(true);
      }
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const floatingDots = useRef(
    [...Array(6)].map(() => ({
      x: Math.random() * 800 - 400,
      y: Math.random() * 800 - 400,
    })),
  );

  useEffect(() => {
    setIsClient(true);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.classList.add("paused");
      } else {
        document.body.classList.remove("paused");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }
  }, []);

  const isSkillsInView = useInView(skillsRef, { once: true, amount: 0.4 });
  const isContactInView = useInView(contactRef, { once: false, amount: 0.5 });

  const techLogos = [
    { node: <SiReact className="w-12 h-12" style={{ color: "#61DAFB" }} />, title: "React", href: "https://react.dev" },
    { node: <SiNextdotjs className="w-12 h-12 text-black dark:text-white" />, title: "Next.js", href: "https://nextjs.org" },
    { node: <SiTypescript className="w-12 h-12" style={{ color: "#3178C6" }} />, title: "TypeScript", href: "https://www.typescriptlang.org" },
    { node: <SiTailwindcss className="w-12 h-12" style={{ color: "#06B6D4" }} />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  ];

  const [selected, setSelected] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const projects = [
    {
      image: "/images/1.png",
      title: "Mobile App Development",
      description: "AI Virtual Assistant the chatbot provides information about doctor schedules, room locations, and hospital services using voice input and output.",
      tools: "Android Studio, React Native, Java, Speech Recognition, Speech Synthesis",
      category: "Mobile",
    },
    {
      image: "/images/2.png",
      title: "3D Modeling",
      description: "Creation of a 3D car model in Blender as an asset for games or animation projects.",
      tools: "Blender",
      category: "3D",
    },
    {
      image: "/images/3.png",
      title: "Game Development",
      description: "A 3D Energy Ball game with shader effects and dynamic lighting. Designed to learn object physics control in a 3D environment.",
      tools: "Unity, C#",
      category: "Game",
    },
    {
      image: "/images/4.png",
      title: "Robotics",
      description: "Robotics project using Webots Simulator. The E-puck robot is programmed in C to read distance sensors and move autonomously within the simulation arena.",
      tools: "C, Webots Simulator",
      category: "Robotics",
    },
    {
      image: "/images/5.png",
      title: "Game Development",
      description: "3D Airplane Controller game developed in Unity. Features realistic flight physics and smooth aerial controls in a 3D environment.",
      tools: "Unity, C#",
      category: "Game",
    },
    {
      image: "/images/6.png",
      title: "Trading Simulation",
      description: "A web-based trading simulation platform that lets users practice stock and crypto trading in a risk-free virtual environment with real-time market data visualization.",
      tools: "JavaScript, HTML, CSS",
      category: "Web",
    },
    {
      image: "/images/7.png",
      title: "AutoClip",
      description: "A web application that automatically clips and downloads videos from YouTube. Users can select specific timestamps and extract video segments effortlessly.",
      tools: "Python",
      category: "Web",
    },
    {
      image: "/images/8.png",
      title: "ViralWave",
      description: "A web app that recommends and lets you listen to the latest viral and trending songs. Discover what's trending and stream music that's going viral right now.",
      tools: "TypeScript, React Native",
      category: "Web",
    },
    {
      image: "/images/9.png",
      title: "JFast",
      description: "A web application designed to help users learn the Japanese language efficiently. Features interactive lessons, vocabulary practice, and progress tracking.",
      tools: "TypeScript",
      category: "Web",
    },
  ];

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    emailjs
      .sendForm("service_6j85ogl", "template_fdxb0jx", formRef.current!, "4ri5HHBGbOfcnjLKe")
      .then(
        () => { alert("Message sent! Thank you."); formRef.current!.reset(); },
        (error: any) => { alert("Failed to send message. Try again later."); console.error(error); },
      );
  };

  return (
    <>
      {/* ===== LOADING SCREEN ===== */}
      {!loadingDone && <LoadingScreen onFinish={() => setLoadingDone(true)} />}

      <div className="font-sans bg-background text-foreground transition-colors duration-300">
        {/* ====== NAVBAR ====== */}
        <Navbar />

        {/* ===== HERO SECTION ===== */}
        <section
          ref={heroRef}
          id="home"
          className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center justify-center p-6 lg:p-12 gap-y-6 lg:gap-x-12 relative"
        >
          <div className="absolute inset-0 pointer-events-none z-0 hud-grid" />
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at top left, rgba(74, 46, 140, 0.15), transparent 50%)' }} />

          {/* LEFT */}
          <div className="flex flex-col items-start text-left gap-2 relative z-10">

            {/* SVG gradient def */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--foreground))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>
            </svg>

            <div className="w-full">
              <StrokeText
                text="Tiovaldo Ratungalo"
                strokeColor="#6C4FC7"
                fillColor="url(#textGradient)"
                className="font-extrabold text-foreground"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-md md:max-w-xl text-muted-foreground text-sm sm:text-base leading-relaxed text-left"
            >
              Computer Science Graduate | Welcome to my portfolio
            </motion.p>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2 mt-1">
              <TechBadge icon={<SiReact size={12} />} label="React" delay={0.6} />
              <TechBadge icon={<SiNextdotjs size={12} />} label="Next.js" delay={0.7} />
              <TechBadge icon={<SiTypescript size={12} />} label="TypeScript" delay={0.8} />
              <TechBadge icon={<SiTailwindcss size={12} />} label="Tailwind" delay={0.9} />
              <TechBadge icon={<SiUnity size={12} />} label="Unity" delay={1.0} />
            </div>

            <div className="flex gap-3 mt-3 flex-wrap justify-start">
              <motion.a
                href="#contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 hover:invert transition btn-glow text-sm sm:text-base"
              >
                <FiSend size={15} />
                Contact Me
              </motion.a>
              <motion.a
                href="/CV_Tiovaldo Ratungalo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-md hover:bg-primary/90 hover:invert/10 transition btn-glow glow-border text-sm sm:text-base"
              >
                <FiDownload size={15} />
                Download CV
              </motion.a>
            </div>
          </div>

          {/* RIGHT IMAGE with parallax */}
          <motion.div
            style={prefersReducedMotion ? {} : { y: profileY, opacity: profileOpacity }}
            className="flex items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
          >
            <Profile3D />
          </motion.div>
        </section>

        {/* ====== SCROLL TEXT (About Me) ====== */}
        <section className="py-6 bg-transparent flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at center, rgba(74, 46, 140, 0.12), transparent 70%)' }} />
          <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }} />
          <ScrollVelocity
            texts={["About Me", "About Me"]}
            velocity={30}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground uppercase tracking-wide"
          />
        </section>

        {/* ====== ABOUT ====== */}
        <section
          id="about"
          ref={aboutRef}
          className="snap-start min-h-screen bg-muted text-foreground border-y border-border p-6 lg:p-12 flex flex-col items-center justify-center transition-colors duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at bottom right, rgba(74, 46, 140, 0.15), transparent 60%)' }} />

          <div className="max-w-6xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* LEFT: IMAGE & STATS */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-sm mx-auto lg:max-w-none relative"
              >
                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [-10, 10, -10] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative p-3 group"
                >
                  <motion.div
                    animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary/20 blur-3xl rounded-3xl z-0"
                  />
                  <div className="relative overflow-hidden rounded-xl bg-[#0D0B14] border border-primary/40 z-10 shadow-[0_0_40px_rgba(108,79,199,0.2)]">
                    <img
                      src="/about.png"
                      alt="Tiovaldo"
                      className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    <motion.div
                      className="absolute inset-0 z-20 w-[150%] h-full pointer-events-none"
                      style={{ background: 'linear-gradient(to right, transparent 0%, rgba(108, 79, 199, 0.4) 50%, transparent 100%)', transform: 'skewX(-20deg)' }}
                      animate={{ x: ["-150%", "150%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto w-full lg:max-w-none">
                <StatBox value={9} label="Projects" icon={<FiCode size={16} />} />
                <StatBox value={1} label="Year Exp" suffix="+" icon={<FiMonitor size={16} />} />
                <StatBox value={100} label="Passion" suffix="%" icon={<FiShield size={16} />} />
              </div>
            </div>

            {/* RIGHT: TEXT & SKILLS */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(108,79,199,0.1)]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(108,79,199,0.8)]" />
                  System Overview
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Initializing</span> Profile Data...
                </h2>

                <div className="bg-background/40 backdrop-blur-md border border-primary/20 p-5 sm:p-7 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative group hover:border-primary/40 transition-colors duration-500">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/10 rounded-l-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-4 font-mono">
                    <p>
                      <span className="text-primary/70">{">"}</span> Hi, I'm <strong className="text-foreground font-bold drop-shadow-[0_0_8px_rgba(108,79,199,0.4)]">Tiovaldo Sindovan Ratungalo</strong> — a Computer Science
                      graduate from Universitas Klabat (2024) with a passion for building things that live on the web. My focus sits at the intersection of <span className="text-primary font-medium">front-end development</span> and <span className="text-primary font-medium">AI</span>: I like crafting interfaces that feel effortless to use, while staying curious about what's happening under the hood — exploring how AI can make systems smarter.
                    </p>
                    <p>
                      <span className="text-primary/70">{">"}</span> I'm an analytical thinker who enjoys breaking down complex problems into clean, efficient solutions. When I'm not coding, I'm usually exploring new tools and technologies, always looking for better ways to build.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="w-full"
              >
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-4 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <span className="text-primary">#</span> Core Capabilities
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { skill: "Game Dev", level: 65, icon: <FaGamepad size={16} /> },
                    { skill: "Web Dev", level: 70, icon: <FiMonitor size={16} /> },
                    { skill: "Mobile Dev", level: 65, icon: <FiSmartphone size={16} /> },
                    { skill: "AI", level: 75, icon: <FiCpu size={16} /> },
                  ].map((item, index) => (
                    <SkillRadialProgress key={index} skill={item.skill} level={item.level} delay={0.5 + index * 0.1} icon={item.icon} />
                  ))}
                </div>

                {/* Tech tag pills */}

              </motion.div>
            </div>
          </div>
        </section>

        {/* ====== PROJECTS ====== */}
        <section
          id="project"
          ref={skillsRef}
          className="relative snap-start min-h-screen bg-background text-foreground border-y border-border p-6 lg:p-12 flex flex-col items-center gap-8 overflow-visible transition-colors duration-300"
        >
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at center, rgba(74, 46, 140, 0.15), transparent 60%)' }} />

          <div className="flex flex-col items-center justify-start relative z-10 w-full max-w-5xl mb-4 lg:mb-8 pt-12 sm:pt-16">
            <motion.h2
              className="mt-8 text-3xl sm:text-5xl lg:text-6xl text-center font-extrabold text-foreground uppercase mb-4 relative neon"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Projects
            </motion.h2>

            {/* Category Filter Tabs */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-300 ${activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_14px_rgba(108,79,199,0.5)]"
                    : "bg-background/50 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/10"
                    }`}
                >
                  {categoryIcons[cat]}
                  {cat}
                </motion.button>
              ))}
            </motion.div>

            {/* Cards Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full px-4 sm:px-0"
              >
                {filteredProjects.map((proj, i) => (
                  <TiltCard key={`${activeCategory}-${i}`} proj={proj} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {filteredProjects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground text-center py-16 font-mono text-sm"
                >
                  No projects in this category yet.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ====== QUOTES SECTION ====== */}
        <QuoteSection />

        {/* LOGO LOOP */}
        <section className="snap-start bg-background py-8 sm:py-12 flex justify-center transition-colors duration-300 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at top right, rgba(74, 46, 140, 0.12), transparent 50%)' }} />
          <LogoLoop
            logos={techLogos}
            speed={120}
            direction="left"
            logoHeight={60}
            gap={60}
            pauseOnHover
            scaleOnHover
            ariaLabel="Technology partners"
          />
        </section>

        {/* ====== CONTACT ====== */}
        <section
          id="contact"
          ref={contactRef}
          className="snap-start min-h-screen relative overflow-hidden bg-muted text-foreground border-y border-border p-6 lg:p-12 transition-colors duration-300 flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12"
        >
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at bottom center, rgba(74, 46, 140, 0.15), transparent 70%)' }} />

          {/* Floating Dots */}
          {floatingDots.current.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-primary rounded-full opacity-30 motion-element"
              initial={{ x: pos.x, y: pos.y }}
              animate={prefersReducedMotion ? {} : { y: [pos.y, pos.y - 20, pos.y], x: [pos.x, pos.x + 20, pos.x], opacity: [0.2, 0.5, 0.2] }}
              transition={prefersReducedMotion ? {} : { repeat: Infinity, duration: 6 + i, delay: i * 0.5, type: "tween" }}
            />
          ))}

          {/* Landyard — hidden on mobile, shown on desktop only */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-0 pointer-events-none">
            <div className="w-full h-[600px] flex justify-center items-center">
              {isClient && isContactInView && !prefersReducedMotion && !isMobile && (
                <Landyard position={[0, -1, 15]} gravity={[0, -40, 0]} />
              )}
            </div>
          </div>

          {/* Contact Form Card */}
          <motion.div
            className="w-full lg:w-1/2 max-w-xl mx-auto glass-card text-card-foreground p-6 rounded-xl relative z-10"
            whileHover={{ scale: 1.02 }}
          >
            {/* Header — hanya icon mail + judul */}
            <div className="flex items-center gap-3 mb-2 justify-center">
              <div className="p-2 rounded-lg bg-primary/15 border border-primary/30">
                <FiMail className="text-primary" size={20} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Contact Me
              </h2>
            </div>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Send me a message and I will get back to you as soon as possible.
            </p>

            <form ref={formRef} onSubmit={sendEmail} className="grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <FiUser size={15} />
                </div>
                <input
                  name="user_name"
                  placeholder="Your name"
                  className="w-full pl-9 pr-4 py-3 rounded-lg bg-white border border-gray-300 dark:bg-background dark:border-border/20 dark:text-white focus:ring-2 focus:ring-ring transition-all duration-300 focus:scale-[1.01] focus:border-primary/50 outline-none text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <FiMail size={15} />
                </div>
                <input
                  name="user_email"
                  placeholder="Your email"
                  type="email"
                  className="w-full pl-9 pr-4 py-3 rounded-lg bg-white border border-gray-300 dark:bg-background dark:border-border/20 dark:text-white focus:ring-2 focus:ring-ring transition-all duration-300 focus:scale-[1.01] focus:border-primary/50 outline-none text-sm"
                  required
                />
              </div>

              {/* Message */}
              <div className="relative">
                <div className="absolute left-3 top-3.5 text-muted-foreground pointer-events-none">
                  <FiMessageSquare size={15} />
                </div>
                <textarea
                  name="message"
                  placeholder="Your message"
                  className="w-full pl-9 pr-4 py-3 rounded-lg bg-white border border-gray-300 dark:bg-background dark:border-border/20 dark:text-white h-32 focus:ring-2 focus:ring-ring transition-all duration-300 focus:scale-[1.01] focus:border-primary/50 outline-none resize-none text-sm"
                  required
                />
              </div>

              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 hover:invert transition-all btn-glow"
                >
                  <FiSend size={15} />
                  Send Message
                </motion.button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* ====== FOOTER ====== */}
        <footer className="relative bg-background dark:bg-[#0D0B14] py-10 border-t border-border dark:border-[#2A2438] transition-colors duration-300 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-16 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-sm text-muted-foreground font-mono mb-3 flex items-center gap-2"
            >
              <span className="text-primary animate-pulse">▸</span>
              Building digital experiences, one commit at a time.
            </motion.p>

            <FloatingDock
              mobileClassName="hidden"
              desktopClassName="backdrop-blur-xl rounded-2xl p-2 flex gap-4 shadow-lg bg-white/80 border border-gray-300/50 dark:bg-[#1A1625]/80 dark:border-[#2A2438] dark:shadow-[0_0_30px_rgba(108,79,199,0.08)]"
              items={[
                {
                  title: "Instagram",
                  icon: <IconBrandInstagram className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />,
                  href: "https://www.instagram.com/tiovaldoo?igsh=MWcxbHdyejNtdm4xdg==",
                },
                {
                  title: "Github",
                  icon: <IconBrandGithub className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />,
                  href: "https://github.com/TiovaldoRatungalo",
                },
                {
                  title: "X",
                  icon: <IconBrandX className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />,
                  href: "https://discord.gg/yourinvite",
                },
                {
                  title: "LinkedIn",
                  icon: <IconBrandLinkedin className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />,
                  href: "https://linkedin.com/in/yourusername",
                },
              ]}
            />

            <p className="mt-6 text-xs text-muted-foreground/70 text-center tracking-wide">
              <span className="text-primary/60">©</span> {2025}
              <span className="mx-1.5 text-primary/30">•</span>
              Tiovaldo Ratungalo
              <span className="mx-1.5 text-primary/30">•</span>
              Crafted with TypeScript, Tailwind CSS, Next.js, React
            </p>
          </div>
        </footer>
      </div>

      {/* AI Chat */}
      {loadingDone && <AiChat />}
    </>
  );
}
