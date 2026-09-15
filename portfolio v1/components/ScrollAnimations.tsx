"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

export default function ScrollAnimations() {
  useEffect(() => {
    // Wait a tick to let the DOM settle after hydration
    const initId = setTimeout(() => {
      const mobile = isMobile();

      // ── Shared fade-up defaults ──────────────────────────────────────────
      const fadeUp = {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power2.out",
      };

      // ─────────────────────────────────────────────────────────────────────
      // 1. SECTION HEADINGS — each h2/h3 inside non-hero sections
      // ─────────────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(
        "#about h2, #about h3, #project h2"
      ).forEach((el) => {
        gsap.from(el, {
          ...fadeUp,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // ─────────────────────────────────────────────────────────────────────
      // 2. PARAGRAPHS & BADGES inside #about
      // ─────────────────────────────────────────────────────────────────────
      gsap.utils
        .toArray<HTMLElement>("#about p, #about .inline-flex")
        .forEach((el, i) => {
          gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: "power2.out",
            delay: i * 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        });

      // ─────────────────────────────────────────────────────────────────────
      // 3. STAT BOXES — staggered group
      // ─────────────────────────────────────────────────────────────────────
      const statBoxes = gsap.utils.toArray<HTMLElement>("#about .grid > div");
      if (statBoxes.length) {
        gsap.from(statBoxes, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statBoxes[0],
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // 4. PROJECT CARDS — staggered
      // ─────────────────────────────────────────────────────────────────────
      const cards = gsap.utils.toArray<HTMLElement>(".project-card");
      if (cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 50,
          scale: 0.97,
          duration: 0.65,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cards[0].closest(".grid") || cards[0],
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }



      // ─────────────────────────────────────────────────────────────────────
      // 6. ABOUT IMAGE — parallax (desktop only)
      // ─────────────────────────────────────────────────────────────────────
      if (!mobile) {
        const aboutImg = document.querySelector<HTMLElement>("#about img:not([alt='Tiovaldo'])");
        if (aboutImg) {
          gsap.to(aboutImg, {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: aboutImg,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          });
        }
      }

      // Refresh positions after setup
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(initId);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return null;
}
