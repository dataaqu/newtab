import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";

interface Props {
  params: { locale: string };
  searchParams: { page?: string; category?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const title = "Blog - Newtab";
  const description = "Read the latest articles and news";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/blog`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog`,
      siteName: "Newtab",
      locale: "en_US",
      type: "website",
    },
  };
}

async function getPosts(page: number, category?: string) {
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (category) {
    where.categories = { some: { slug: category } };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        categories: { select: { nameEn: true, slug: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total, totalPages: Math.ceil(total / limit) };
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { nameEn: "asc" } });
}

export default async function BlogPage({ searchParams }: Props) {
  const t = await getTranslations("blog");
  const page = parseInt(searchParams.page || "1");
  const { posts, totalPages } = await getPosts(page, searchParams.category);
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t("title")}</h1>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
          <Link
            href="/blog"
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              !searchParams.category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                searchParams.category === cat.slug
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.nameEn}
            </Link>
          ))}
        </div>
      )}

      {/* Post list */}
      {posts.length === 0 ? (
        <p className="mt-10 text-center text-gray-500 sm:mt-12">{t("noPosts")}</p>
      ) : (
        <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6 lg:mt-10 lg:space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 sm:text-xl">
                  {post.titleEn}
                </h2>
              </Link>

              {post.excerptEn && (
                <p className="mt-1.5 text-sm text-gray-600 sm:mt-2 sm:text-base">
                  {post.excerptEn}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400 sm:mt-4 sm:gap-4 sm:text-sm">
                {post.author.name && <span>{post.author.name}</span>}
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US")}
                </span>
                <span>
                  {post.views} {t("views")}
                </span>
              </div>

              {post.categories.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                  {post.categories.map((cat) => (
                    <span
                      key={cat.slug}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                    >
                      {cat.nameEn}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-1.5 sm:mt-10 sm:gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2 ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
