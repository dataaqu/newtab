"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

export default function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === "ka" ? "en" : "ka";

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  const navLinks = [
    { href: "#hero", label: t("home") },
    { href: "#about", label: t("about") },
    { href: "#services", label: t("services") },
    { href: "#blog", label: t("blog") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <div className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4">
    <header className="w-full max-w-[70%] rounded-2xl border border-white/30 bg-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/10">
      <div className="flex h-14 items-center justify-between px-6 sm:h-16 sm:px-8">
        {/* Logo */}
        <Link href="/">
          <Image src={logo} alt={t("siteName")} height={36} className="sm:h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white drop-shadow-sm"
            >
              {link.label}
            </a>
          ))}

          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            {locale === "ka" ? "EN" : "KA"}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={switchLocale}
            className="rounded-md border border-white/30 px-2.5 py-1 text-sm font-medium text-white"
          >
            {locale === "ka" ? "EN" : "KA"}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/20"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu with transition */}
      <div
        className={`overflow-hidden border-t border-white/20 transition-all duration-200 ease-in-out md:hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="space-y-1 px-6 pb-4 pt-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-white/80 hover:bg-white/20 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
    </div>
  );
}
