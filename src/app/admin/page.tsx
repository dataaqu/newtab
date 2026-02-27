import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [postCount, publishedCount, draftCount, totalViews] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.aggregate({ _sum: { views: true } }),
  ]);

  return {
    postCount,
    publishedCount,
    draftCount,
    totalViews: totalViews._sum.views || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Posts", value: stats.postCount, color: "bg-blue-50 text-blue-700" },
    { label: "Published", value: stats.publishedCount, color: "bg-green-50 text-green-700" },
    { label: "Drafts", value: stats.draftCount, color: "bg-yellow-50 text-yellow-700" },
    { label: "Total Views", value: stats.totalViews, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color} inline-block rounded-lg px-2 py-1`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
