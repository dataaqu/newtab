import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/posts/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      categories: true,
      tags: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

// PUT /api/posts/[id] — update post (auth required)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      seoScore, status, categoryIds, tagIds,
    } = body;

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isPublishing = status === "PUBLISHED" && existing.status !== "PUBLISHED";

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(titleKa !== undefined && { titleKa }),
        ...(titleEn !== undefined && { titleEn }),
        ...(contentKa !== undefined && { contentKa }),
        ...(contentEn !== undefined && { contentEn }),
        ...(excerptKa !== undefined && { excerptKa }),
        ...(excerptEn !== undefined && { excerptEn }),
        ...(metaTitleKa !== undefined && { metaTitleKa }),
        ...(metaTitleEn !== undefined && { metaTitleEn }),
        ...(metaDescKa !== undefined && { metaDescKa }),
        ...(metaDescEn !== undefined && { metaDescEn }),
        ...(ogImage !== undefined && { ogImage }),
        ...(focusKeyword !== undefined && { focusKeyword }),
        ...(seoScore !== undefined && { seoScore }),
        ...(status !== undefined && { status }),
        ...(isPublishing && { publishedAt: new Date() }),
        ...(categoryIds !== undefined && {
          categories: { set: categoryIds.map((id: string) => ({ id })) },
        }),
        ...(tagIds !== undefined && {
          tags: { set: tagIds.map((id: string) => ({ id })) },
        }),
      },
      include: {
        author: { select: { id: true, name: true } },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — delete post (auth required)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
