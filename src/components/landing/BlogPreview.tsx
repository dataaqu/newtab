import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      author: { select: { name: true } },
    },
  });
}

export default async function BlogPreview() {
  const posts = await getLatestPosts();
  const t = await getTranslations("blog");

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            {t("latestPosts")}
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:mt-12 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 sm:text-lg">
                {post.titleEn}
              </h3>
              {post.excerptEn && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                  {post.excerptEn}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 sm:mt-4">
                {post.author.name && <span>{post.author.name}</span>}
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/blog"
            className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:px-6 sm:py-2.5"
          >
            {t("readMore")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
