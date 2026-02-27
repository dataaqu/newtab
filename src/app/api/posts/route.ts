import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/posts — list posts (public: published only, admin: all)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  const session = await getServerSession(authOptions);
  const isAdmin = !!session?.user;

  const where: Record<string, unknown> = {};

  if (!isAdmin) {
    where.status = "PUBLISHED";
  } else if (status) {
    where.status = status;
  }

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
        author: { select: { id: true, name: true, email: true } },
        categories: { select: { id: true, nameKa: true, nameEn: true, slug: true } },
        tags: { select: { id: true, nameKa: true, nameEn: true, slug: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/posts — create post (auth required)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      slug, titleKa, titleEn, contentKa, contentEn,
      excerptKa, excerptEn, metaTitleKa, metaTitleEn,
      metaDescKa, metaDescEn, ogImage, focusKeyword,
      status, categoryIds, tagIds,
    } = body;

    if (!slug || !titleKa || !titleEn || !contentKa || !contentEn) {
      return NextResponse.json(
        { error: "slug, titleKa, titleEn, contentKa, contentEn are required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        slug,
        titleKa,
        titleEn,
        contentKa,
        contentEn,
        excerptKa: excerptKa || null,
        excerptEn: excerptEn || null,
        metaTitleKa: metaTitleKa || null,
        metaTitleEn: metaTitleEn || null,
        metaDescKa: metaDescKa || null,
        metaDescEn: metaDescEn || null,
        ogImage: ogImage || null,
        focusKeyword: focusKeyword || null,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
        categories: categoryIds?.length
          ? { connect: categoryIds.map((id: string) => ({ id })) }
          : undefined,
        tags: tagIds?.length
          ? { connect: tagIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
