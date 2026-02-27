import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nameKa, nameEn } = body;

  if (!nameKa || !nameEn) {
    return NextResponse.json(
      { error: "Both nameKa and nameEn are required" },
      { status: 400 }
    );
  }

  const slug = slugify(nameEn);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Category with this slug already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({
    data: { nameKa, nameEn, slug },
  });

  return NextResponse.json({ category }, { status: 201 });
}
