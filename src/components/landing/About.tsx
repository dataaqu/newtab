"use client";

import DesignTestimonials from "@/components/ui/DesignTestimonials";

const testimonials = [
  {
    quote:
      "The best advertising is done by satisfied customers.",
    author: "Philip Kotler",
    role: "Marketing Professor",
    company: "",
  },
  {
    quote:
      "People do not buy goods and services. They buy relations, stories and magic.",
    author: "Seth Godin",
    role: "Marketing Author",
    company: "",
  },
  {
    quote:
      "If it doesn’t sell, it isn’t creative.",
    author: "David Ogilvy",
    role: "Advertising Executive",
    company: "",
  },
  {
    quote:
      "Content is king, but context is God.",
    author: "Gary Vaynerchuk",
    role: "Entrepreneur",
    company: "",
  },
];

export default function About() {
  return (
    <section id="about" className="relative">
      <div className="absolute -top-16 left-0 right-0 z-10 h-16 overflow-hidden sm:-top-24 sm:h-24">
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-full"
        >
          <path
            d="M0 96L60 85.3C120 74.7 240 53.3 360 48C480 42.7 600 53.3 720 58.7C840 64 960 64 1080 56C1200 48 1320 32 1380 24L1440 16V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z"
            fill="#050710"
          />
        </svg>
      </div>
      <DesignTestimonials testimonials={testimonials} />
    </section>
  );
}
