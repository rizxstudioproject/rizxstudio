"use client";

import React, { useEffect } from "react";
import { useMotionTheme } from "@/context/MotionThemeContext";

export default function MotionScrollController() {
  const { motionScroll, disableOnMobile } = useMotionTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      window.innerWidth < 768;

    if (disableOnMobile && isTouchDevice) {
      document.documentElement.style.scrollBehavior = "auto";
      return;
    }

    // 1. Smooth Inertial Scroll toggle
    if (motionScroll.smoothInertia) {
      document.documentElement.style.scrollBehavior = "smooth";
    } else {
      document.documentElement.style.scrollBehavior = "auto";
    }

    // 2. Scroll Reveal Animations
    if (motionScroll.scrollReveal) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              entry.target.classList.remove("reveal-hidden");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );

      const revealElements = document.querySelectorAll(
        ".scroll-reveal, [data-scroll-reveal]"
      );
      revealElements.forEach((el) => {
        el.classList.add("reveal-hidden");
        observer.observe(el);
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [motionScroll, disableOnMobile]);

  return null;
}
