import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postCreateSchema, postUpdateSchema, parseOrError } from "@/lib/validation";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const { data: body, error } = parseOrError(postCreateSchema, await req.json());
  if (error) return error;

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: `${slugify(body.title)}-${Date.now().toString(36)}`,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || null,
      published: body.published ?? false,
    },
  });
  return NextResponse.json({ post });
}

export async function PATCH(req: NextRequest) {
  const { data: body, error } = parseOrError(postUpdateSchema, await req.json());
  if (error) return error;

  const { id, ...rest } = body;
  const data: Record<string, unknown> = {};
  if (rest.title !== undefined) data.title = rest.title;
  if (rest.excerpt !== undefined) data.excerpt = rest.excerpt;
  if (rest.content !== undefined) data.content = rest.content;
  if (rest.coverImage !== undefined) data.coverImage = rest.coverImage || null;
  if (rest.published !== undefined) data.published = rest.published;

  const post = await prisma.blogPost.update({ where: { id }, data });
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
