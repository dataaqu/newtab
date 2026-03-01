import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string; locale: string };
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      categories: { select: { nameEn: true, slug: true } },
      tags: { select: { nameEn: true, slug: true } },
    },
  });
  return post;
}

async function incrementViews(id: string) {
  await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

async function getAdjacentPosts(createdAt: Date) {
  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: { status: "PUBLISHED", createdAt: { lt: createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, titleEn: true },
    }),
    prisma.post.findFirst({
      where: { status: "PUBLISHED", createdAt: { gt: createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, titleEn: true },
    }),
  ]);
  return { prev, next };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post || post.status !== "PUBLISHED") return {};

  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const title = post.metaTitleEn || post.titleEn;
  const description = post.metaDescEn || post.excerptEn || "";

  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  const images = post.ogImage
    ? [{ url: post.ogImage, width: 1200, height: 630, alt: title }]
    : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Newtab",
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
      ...(images.length > 0 && { images }),
    },
    twitter: {
      card: post.ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(post.ogImage && { images: [post.ogImage] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const t = await getTranslations("blog");

  await incrementViews(post.id);
  const { prev, next } = await getAdjacentPosts(post.createdAt);

  const title = post.titleEn;
  const content = post.contentEn;
  const description = post.metaDescEn || post.excerptEn || "";
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: postUrl,
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    author: {
      "@type": "Person",
      name: post.author.name || "Newtab",
    },
    publisher: {
      "@type": "Organization",
      name: "Newtab",
      ...(post.ogImage && {
        logo: { "@type": "ImageObject", url: post.ogImage },
      }),
    },
    ...(post.ogImage && {
      image: { "@type": "ImageObject", url: post.ogImage },
    }),
    inLanguage: "en",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: postUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <Link
        href="/blog"
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        ← {t("title")}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:mt-6 sm:text-3xl lg:text-4xl">
        {title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:mt-4 sm:gap-4 sm:text-sm">
        {post.author.name && (
          <span>
            {t("author")}: {post.author.name}
          </span>
        )}
        <span>
          {t("publishedAt")}:{" "}
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US")}
        </span>
        <span>
          {post.views} {t("views")}
        </span>
      </div>

      {post.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          {post.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 sm:px-3 sm:py-1"
            >
              {cat.nameEn}
            </Link>
          ))}
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.slug}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 sm:px-3 sm:py-1"
            >
              #{tag.nameEn}
            </span>
          ))}
        </div>
      )}

      <div
        className="prose prose-sm mt-8 max-w-none sm:prose-base lg:prose-lg sm:mt-10"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Prev / Next navigation */}
      <nav className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← {prev.titleEn}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="text-right text-sm text-gray-600 hover:text-blue-600"
          >
            {next.titleEn} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
    </>
  );
}
