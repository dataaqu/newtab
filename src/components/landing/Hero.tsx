"use client";

import Image from "next/image";
import heroImage from "@/assets/hero.webp";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen"
    >
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        className="object-cover"
      />
    </section>
  );
}
