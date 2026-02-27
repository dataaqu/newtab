"use client";

import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-gray-600 sm:mt-6 sm:text-lg">
          {t("description")}
        </p>
      </div>
    </section>
  );
}
