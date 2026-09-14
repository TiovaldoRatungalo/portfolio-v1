"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
} from "react-icons/si";
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

// ── 3D Tilt Card Component ─────────────────────────────────────────────────
interface TiltCardProps {
  proj: { image: string; title: string; description: string; tools: string };
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

const SkillRadialProgress = ({ skill, level, delay }: { skill: string, level: number, delay: number }) => {
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
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
            className="text-primary/10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
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
          <span className="text-xs sm:text-sm font-bold text-foreground drop-shadow-[0_0_5px_rgba(108,79,199,0.5)] font-mono">{count}%</span>
        </div>
      </div>
      <span className="text-[10px] sm:text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors text-center w-full truncate px-1">
        {skill}
      </span>
    </motion.div>
  );
};

const StatBox = ({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) => {
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
      <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground z-10 drop-shadow-[0_0_8px_rgba(108,79,199,0.6)] font-mono">{count}{suffix}</span>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-widest z-10 text-center font-semibold">{label}</span>
    </motion.div>
  );
};

export default function Home() {
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const skillsRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [isClient, setIsClient] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      setIsIOS(/iPad|iPhone|iPod/.test(ua));

      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile(); // cek pertama kali
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

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const isSkillsInView = useInView(skillsRef, { once: true, amount: 0.4 });
  const isContactInView = useInView(contactRef, { once: false, amount: 0.1 });
  const techLogos = [
    {
      node: <SiReact className="w-12 h-12" style={{ color: "#61DAFB" }} />,
      title: "React",
      href: "https://react.dev",
    },
    {
      node: <SiNextdotjs className="w-12 h-12 text-black dark:text-white" />,
      title: "Next.js",
      href: "https://nextjs.org",
    },
    {
      node: <SiTypescript className="w-12 h-12" style={{ color: "#3178C6" }} />,
      title: "TypeScript",
      href: "https://www.typescriptlang.org",
    },
    {
      node: (
        <SiTailwindcss className="w-12 h-12" style={{ color: "#06B6D4" }} />
      ),
      title: "Tailwind CSS",
      href: "https://tailwindcss.com",
    },
  ];

  const [selected, setSelected] = useState<number | null>(null);
  const isPaused = selected !== null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const projects = [
    {
      image: "/images/1.png",
      title: "Mobile App Development",
      description:
        "AI Virtual Assistant the chatbot provides information about doctor schedules, room locations, and hospital services using voice input and output.",
      tools:
        "Android Studio, React Native, Java, Speech Recognition, Speech Synthesis",
    },
    {
      image: "/images/2.png",
      title: "3D Modeling",
      description:
        "Creation of a 3D car model in Blender as an asset for games or animation projects.",
      tools: "Blender",
    },

    {
      image: "/images/3.png",
      title: "Game Development",
      description:
        "A 3D Energy Ball game with shader effects and dynamic lighting. Designed to learn object physics control in a 3D environment.",
      tools: "Unity, C#",
    },
    {
      image: "/images/4.png",
      title: "Game Development",
      description: "Development of a simple 3D game using Unity.",
      tools: "Unity, C#",
    },
    {
      image: "/images/5.png",
      title: "Game Development",
      description:
        "Development of a 2D platformer game with light and particle effects using Unity. Focused on jumping mechanics and item collection.",
      tools: "Unity,C#",
    },
    {
      image: "/images/6.png",
      title: "Game Development",
      description: "3D Airplane Controller game developed in Unity.",
      tools: "Unity, C#",
    },
    {
      image: "/images/7.png",
      title: "Game Development",
      description:
        "A 3D Ball Collector game where players control a ball to collect objects in an arena.",
      tools: "Unity, C#",
    },
    {
      image: "/images/8.png",
      title: "Robotics",
      description:
        "Robotics project using Webots Simulator. The E-puck robot is programmed in C to read distance sensors and move autonomously within the simulation arena.",
      tools: "C, Webots Simulator",
    },
    {
      image: "/images/9.png",
      title: "Game Interface",
      description:
        "Design of a simple game main menu interface with three main buttons: Start, Settings, and Exit.",
      tools: "Unity UI Toolkit",
    },
  ];

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_6j85ogl",
        "template_fdxb0jx",
        formRef.current!,
        "4ri5HHBGbOfcnjLKe",
      )
      .then(
        () => {
          alert("Message sent! Thank you.");
          formRef.current!.reset();
        },
        (error: any) => {
          alert("Failed to send message. Try again later.");
          console.error(error);
        },
      );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }
  }, []);

  return (
    <>
      {/* ===== LOADING SCREEN ===== */}
      {!loadingDone && <LoadingScreen onFinish={() => setLoadingDone(true)} />}



      <div className="font-sans bg-background text-foreground transition-colors duration-300">
        {/* ====== NAVBAR ====== */}
        <Navbar />

        {/* ===== HERO SECTION ===== */}
        <section
          id="home"
          className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center justify-center p-6 lg:p-12 gap-y-6 lg:gap-x-12 relative"
        >
          {/* Subtle Midnight Purple Glow + HUD grid */}
          <div className="absolute inset-0 pointer-events-none z-0 hud-grid" />
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at top left, rgba(74, 46, 140, 0.15), transparent 50%)' }} />

          {/* LEFT */}
          <div className="flex flex-col items-start text-left gap-2 relative z-10">
            <div className="w-full text-base sm:text-lg lg:text-3xl font-bold flex flex-wrap items-center justify-start gap-y-1 sm:gap-x-2 leading-snug">
              <RotatingText
                texts={[
                  "Front-End Developer",
                  "Mobile Developer",
                  "Cyber Security Analyst",
                ]}
                mainClassName="px-2 bg-foreground text-background rounded-md inline-flex items-center text-base sm:text-lg lg:text-3xl font-bold"
                staggerFrom="last"
                initial={isIOS ? { opacity: 0 } : { y: "100%" }}
                animate={isIOS ? { opacity: 1 } : { y: 0 }}
                exit={isIOS ? { opacity: 0 } : { y: "-120%" }}
                staggerDuration={isIOS ? 0 : 0.025}
                splitLevelClassName="overflow-hidden pb-0.5"
                transition={
                  isIOS
                    ? { duration: 0.4 }
                    : { type: "spring", damping: 30, stiffness: 400 }
                }
                rotationInterval={isIOS ? 5000 : 4000}
              />
            </div>

              {/* SVG Definition for Gradient */}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--foreground))" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                  </linearGradient>
                </defs>
              </svg>

              <StrokeText
              text="Tiovaldo Ratungalo"
              strokeColor="#6C4FC7"
              fillColor="url(#textGradient)"
              className="w-[85%] sm:w-[320px] md:w-[400px] lg:w-[450px] font-extrabold text-foreground"
            />

            <p className="max-w-md md:max-w-xl text-muted-foreground text-sm sm:text-base leading-relaxed text-left">
              Computer Science Graduate | Welcome to my portfolio
            </p>

            <div className="flex gap-3 mt-2 flex-wrap justify-start">
              <a
                href="#contact"
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 hover:invert transition btn-glow text-sm sm:text-base"
              >
                Contact Me
              </a>
              <a
                href="/CV_Tiovaldo Ratungalo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-primary/90 hover:invert/10 transition btn-glow glow-border text-sm sm:text-base"
              >
                Download CV
              </a>
            </div>
          </div>

          {/* RIGHT IMAGE (Star Border) */}
          <div className="flex items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <Profile3D />
          </div>
        </section>

        {/* ====== SCROLL TEXT (About Me) ====== */}
        <section className="py-6 bg-transparent flex flex-col gap-2 relative overflow-hidden">
          {/* Subtle Midnight Purple Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at center, rgba(74, 46, 140, 0.12), transparent 70%)' }} />

          {/* Fade edges for a premium look */}
          <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }} />
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
          {/* Subtle Midnight Purple Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at bottom right, rgba(74, 46, 140, 0.15), transparent 60%)' }} />

          <div className="max-w-6xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* LEFT: IMAGE & STATS */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* HUD Image Frame Reveal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-sm mx-auto lg:max-w-none relative"
              >
                {/* HUD Image Floating Loop */}
                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [-10, 10, -10] }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative p-3 group"
                >
                  {/* Glowing Pulse Backdrop */}
                  <motion.div
                    animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary/20 blur-3xl rounded-3xl z-0"
                  />

                  {/* Main Image Container */}
                  <div className="relative overflow-hidden rounded-xl bg-[#0D0B14] border border-primary/40 z-10 shadow-[0_0_40px_rgba(108,79,199,0.2)]">
                    <img
                      src="/about.png"
                      alt="Tiovaldo"
                      className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    
                    {/* Shimmer/Light Sweep Effect */}
                    <motion.div 
                      className="absolute inset-0 z-20 w-[150%] h-full pointer-events-none"
                      style={{ 
                        background: 'linear-gradient(to right, transparent 0%, rgba(108, 79, 199, 0.4) 50%, transparent 100%)',
                        transform: 'skewX(-20deg)'
                      }}
                      animate={{ x: ["-150%", "150%"] }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        repeatDelay: 4,
                        ease: "easeInOut"
                      }}
                    />

                    {/* HUD Overlay Color Filter */}
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto w-full lg:max-w-none">
                <StatBox value={9} label="Projects" />
                <StatBox value={1} label="Year Exp" suffix="+" />
                <StatBox value={100} label="Passion" suffix="%" />
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
                {/* HUD System Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(108,79,199,0.1)]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(108,79,199,0.8)]" />
                  System Overview
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Initializing</span> Profile Data...
                </h2>

                <div className="bg-background/40 backdrop-blur-md border border-primary/20 p-5 sm:p-7 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative group hover:border-primary/40 transition-colors duration-500">
                  {/* Decorative left line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/10 rounded-l-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-4 font-mono">
                    <p>
                      <span className="text-primary/70">{">"}</span> Hello, I am <strong className="text-foreground font-bold drop-shadow-[0_0_8px_rgba(108,79,199,0.4)]">Tiovaldo Sindovan Ratungalo</strong>, a Computer Science
                      graduate from Universitas Klabat in 2024. I have a strong
                      interest in technology, programming, and <span className="text-primary font-medium">cybersecurity</span>, along
                      with a growing passion for <span className="text-primary font-medium">AI development</span> and front-end web
                      design.
                    </p>
                    <p>
                      <span className="text-primary/70">{">"}</span> I enjoy learning new technologies and developing innovative,
                      user-friendly digital solutions. With a strong analytical
                      mindset and problem-solving skills, I am motivated to build
                      efficient and reliable technology systems.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ===== Skills as Circular Progress ===== */}
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
                    { skill: "Game Dev", level: 65 },
                    { skill: "Web Dev", level: 70 },
                    { skill: "Mobile Dev", level: 65 },
                    { skill: "MS Office", level: 90 },
                  ].map((item, index) => (
                    <SkillRadialProgress key={index} skill={item.skill} level={item.level} delay={0.5 + index * 0.1} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="project"
          ref={skillsRef}
          className="relative snap-start min-h-screen bg-background text-foreground border-y border-border 
  p-6 lg:p-12 flex flex-col items-center gap-8 overflow-visible transition-colors duration-300"
        >
          {/* Subtle Midnight Purple Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at center, rgba(74, 46, 140, 0.15), transparent 60%)' }} />

          {/* ====== PROJECTS ====== */}
          <div className="flex flex-col items-center justify-start relative z-10 w-full max-w-5xl mb-16 lg:mb-24 pt-12 sm:pt-16">
            {/* Title */}
            <motion.h2
              className="mt-8 text-3xl sm:text-5xl lg:text-6xl text-center font-extrabold text-foreground uppercase mb-6 relative neon"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Projects
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-secondary-foreground mb-8 text-center sm:text-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            ></motion.p>

            {/* 3D Tilt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full px-4 sm:px-0">
              {projects.map((proj, i) => (
                <TiltCard key={i} proj={proj} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* LOGO LOOP tetap */}
        <section className="snap-start bg-background py-8 sm:py-12 flex justify-center transition-colors duration-300 relative overflow-hidden">
          {/* Subtle Midnight Purple Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at top right, rgba(74, 46, 140, 0.12), transparent 50%)' }} />

          <LogoLoop
            logos={techLogos}
            speed={120}
            direction="left"
            logoHeight={60}
            gap={60}
            pauseOnHover
            scaleOnHover
            fadeOut
            ariaLabel="Technology partners"
          />
        </section>

        <section
          id="contact"
          ref={contactRef}
          className="snap-start min-h-screen relative overflow-hidden bg-muted text-foreground border-y border-border p-6 lg:p-12 transition-colors duration-300 flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12"
        >
          {/* Subtle Midnight Purple Glow */}
          <div className="absolute inset-0 pointer-events-none z-0 glow-breathe" style={{ background: 'radial-gradient(circle at bottom center, rgba(74, 46, 140, 0.15), transparent 70%)' }} />

          {/* ===== Floating Dots ===== */}
          {floatingDots.current.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-primary rounded-full opacity-30 motion-element"
              initial={{ x: pos.x, y: pos.y }}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [pos.y, pos.y - 20, pos.y],
                      x: [pos.x, pos.x + 20, pos.x],
                      opacity: [0.2, 0.5, 0.2],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      repeat: Infinity,
                      duration: 6 + i,
                      delay: i * 0.5,
                      type: "tween",
                    }
              }
            />
          ))}

          {/* ====== LANDYARD (kiri) ====== */}
          <div className="lg:w-1/2 flex items-center justify-center relative z-0 pointer-events-none">
            <div className="w-full h-full min-h-[500px]">
              {isClient &&
                isContactInView &&
                !prefersReducedMotion &&
                !isMobile && (
                  <Landyard position={[0, 0, 12]} gravity={[0, -35, 0]} />
                )}
            </div>
          </div>

          <motion.div
            className="w-full lg:w-1/2 max-w-xl glass-card text-card-foreground p-6 rounded-xl relative z-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-foreground text-center">
              Contact Me
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              Send me a message and I will get back to you as soon as possible.
            </p>

            <form
              ref={formRef}
              onSubmit={sendEmail}
              className="grid grid-cols-1 gap-4"
            >
              <input
                name="user_name"
                placeholder="Your name"
                className="p-3 rounded-lg bg-white border border-gray-300 dark:bg-background dark:border-border/20 dark:text-white focus:ring-2 focus:ring-ring transition-transform duration-300 focus:scale-105"
                required
              />
              <input
                name="user_email"
                placeholder="Your email"
                type="email"
                className="p-3 rounded-lg bg-white border border-gray-300 dark:bg-background dark:border-border/20 dark:text-white focus:ring-2 focus:ring-ring transition-transform duration-300 focus:scale-105"
                required
              />
              <textarea
                name="message"
                placeholder="Your message"
                className="p-3 rounded-lg bg-white border border-gray-300 dark:bg-background dark:border-border/20 dark:text-white h-32 focus:ring-2 focus:ring-ring transition-transform duration-300 focus:scale-105 resize-none"
                required
              />
              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 hover:invert transition-all btn-glow"
                >
                  Send Message
                </motion.button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* ====== FOOTER ====== */}
        <footer className="relative bg-background dark:bg-[#0D0B14] py-10 border-t border-border dark:border-[#2A2438] transition-colors duration-300 overflow-hidden">
          {/* Subtle purple glow at top-center */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-16 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">
            <FloatingDock
              mobileClassName="hidden"
              desktopClassName="
        backdrop-blur-xl rounded-2xl p-2 flex gap-4 shadow-lg
        bg-white/80 border border-gray-300/50
        dark:bg-[#1A1625]/80 dark:border-[#2A2438]
        dark:shadow-[0_0_30px_rgba(108,79,199,0.08)]
      "
              items={[
                {
                  title: "Instagram",
                  icon: (
                    <IconBrandInstagram className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />
                  ),
                  href: "https://www.instagram.com/tiovaldoo?igsh=MWcxbHdyejNtdm4xdg==",
                },
                {
                  title: "Github",
                  icon: (
                    <IconBrandGithub className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />
                  ),
                  href: "https://github.com/TiovaldoRatungalo",
                },
                {
                  title: "X",
                  icon: (
                    <IconBrandX className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />
                  ),
                  href: "https://discord.gg/yourinvite",
                },
                {
                  title: "LinkedIn",
                  icon: (
                    <IconBrandLinkedin className="h-full w-full text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-foreground transition-colors" />
                  ),
                  href: "https://linkedin.com/in/yourusername",
                },
              ]}
            />

            <p className="mt-6 text-xs text-muted-foreground/70 text-center tracking-wide">
              <span className="text-primary/60">©</span> {new Date().getFullYear()}
              <span className="mx-1.5 text-primary/30">•</span>
              Tiovaldo Ratungalo
              <span className="mx-1.5 text-primary/30">•</span>
              Crafted with TypeScript, Tailwind CSS, Next.js, React
            </p>
          </div>
        </footer>
      </div>
      {/* AI  */}
      {loadingDone && <AiChat />}
    </>
  );
}
