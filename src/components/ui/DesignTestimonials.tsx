"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface DesignTestimonialsProps {
  title?: string;
  duration?: number;
  testimonials: TestimonialItem[];
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function DesignTestimonials({
  title = "NewTab",
  duration = 6000,
  testimonials,
}: DesignTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const y = useSpring(mouseY, { damping: 25, stiffness: 200 });
  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - (rect.left + rect.width / 2));
      mouseY.set(e.clientY - (rect.top + rect.height / 2));
    },
    [mouseX, mouseY]
  );

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const timer = setInterval(goNext, duration);
    return () => clearInterval(timer);
  }, [goNext, duration]);

  const current = testimonials[activeIndex];
  const paddedIndex = "+";
  const progressHeight = `${((activeIndex + 1) / testimonials.length) * 100}%`;

  return (
    <div className="flex items-center justify-center overflow-hidden bg-[#050710] py-16 sm:py-24">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl px-4 sm:px-6"
        onMouseMove={handleMouseMove}
      >
        {/* Oversized index number */}
        <motion.div
          className="pointer-events-none absolute -top-24 right-4 z-0 sm:-top-32 sm:right-6 lg:-top-40 lg:right-8 select-none text-[8rem] font-bold leading-none tracking-tighter text-white/[0.06] sm:text-[12rem] lg:text-[16rem]"
          style={{ x: numberX, y: numberY }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              className="block"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease }}
            >
              {paddedIndex}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Main content */}
        <div className="relative flex">
          {/* Left column */}
          <div className="hidden flex-col items-center justify-center border-r border-white/10 pr-16 sm:flex">
            <motion.span
              className="font-mono text-xs uppercase tracking-widest text-white/40"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.span>

            {/* Vertical progress line */}
            <div className="relative mt-8 h-32 w-px bg-white/10">
              <motion.div
                className="absolute left-0 top-0 w-full origin-top bg-white"
                animate={{ height: progressHeight }}
                transition={{ duration: 0.5, ease }}
              />
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 py-12 sm:pl-16">
            {/* Company badge */}
            {current.company && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`badge-${activeIndex}`}
                  className="mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {current.company}
                  </span>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Quote */}
            <div className="relative mb-12 min-h-[8rem] sm:min-h-[10rem]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={`quote-${activeIndex}`}
                  className="text-2xl font-light leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {current.quote.split(" ").map((word, i) => (
                    <motion.span
                      key={`${activeIndex}-${i}`}
                      className="mr-[0.3em] inline-block"
                      variants={{
                        hidden: { opacity: 0, y: 20, rotateX: 90 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          transition: {
                            duration: 0.5,
                            delay: i * 0.05,
                            ease,
                          },
                        },
                        exit: {
                          opacity: 0,
                          y: -10,
                          transition: { duration: 0.2, delay: i * 0.02 },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Author row */}
            <div className="flex items-end justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`author-${activeIndex}`}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <motion.div
                    className="h-px w-8 bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ originX: 0 }}
                  />
                  <div>
                    <p className="text-base font-medium text-white">
                      {current.author}
                    </p>
                    <p className="text-sm text-white/40">{current.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <motion.button
                  className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10"
                  whileTap={{ scale: 0.95 }}
                  onClick={goPrev}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-white transition-colors"
                  >
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10"
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-white transition-colors"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
