import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import BlogPreview from "@/components/landing/BlogPreview";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const title = "Newtab - Home";
  const description = "Newtab - Website and blog";

  return {
    title,
    description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "Newtab",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function Home() {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Newtab",
    url: siteUrl,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/blog?search={search_term_string}`,
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
