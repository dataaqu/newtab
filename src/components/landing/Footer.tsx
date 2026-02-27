"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
          <span className="text-base font-bold text-gray-900 sm:text-lg">
            {tc("siteName")}
          </span>

          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#about" className="text-sm text-gray-500 hover:text-gray-700">
              {tc("about")}
            </a>
            <a href="#services" className="text-sm text-gray-500 hover:text-gray-700">
              {tc("services")}
            </a>
            <a href="#blog" className="text-sm text-gray-500 hover:text-gray-700">
              {tc("blog")}
            </a>
            <a href="#contact" className="text-sm text-gray-500 hover:text-gray-700">
              {tc("contact")}
            </a>
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 sm:mt-8 sm:flex-row sm:gap-4 sm:pt-8">
          <p className="text-xs text-gray-400 sm:text-sm">
            &copy; {year} {tc("siteName")}. {t("rights")}.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 sm:text-sm">
              {t("privacy")}
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 sm:text-sm">
              {t("terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
