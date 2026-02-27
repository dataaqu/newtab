"use client";

import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="hero"
      className="flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 text-center sm:min-h-[70vh] sm:px-6 lg:min-h-[80vh] lg:px-8"
    >
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-gray-900 sm:max-w-3xl sm:text-4xl md:text-5xl lg:text-6xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:mt-6 sm:max-w-2xl sm:text-lg lg:text-xl">
        {t("subtitle")}
      </p>
      <a
        href="#about"
        className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-10 sm:px-8 sm:py-3 sm:text-base"
      >
        {t("cta")}
      </a>
    </section>
  );
}
