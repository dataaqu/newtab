import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import BlogPreview from "@/components/landing/BlogPreview";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isKa = params.locale === "ka";
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const title = isKa ? "Newtab - მთავარი" : "Newtab - Home";
  const description = isKa
    ? "Newtab - ორენოვანი ვებსაიტი და ბლოგი"
    : "Newtab - Bilingual website and blog";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${params.locale}`,
      languages: {
        ka: `${siteUrl}/ka`,
        en: `${siteUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${params.locale}`,
      siteName: "Newtab",
      locale: isKa ? "ka_GE" : "en_US",
      type: "website",
    },
  };
}

export default async function Home() {
  const locale = await getLocale();
  const isKa = locale === "ka";
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Newtab",
    url: siteUrl,
    inLanguage: isKa ? "ka" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${locale}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Newtab",
    url: siteUrl,
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <About />
      <Services />
      <BlogPreview />
      <Contact />
      <Footer />
    </>
  );
}
