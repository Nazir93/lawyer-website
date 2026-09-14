import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function requireWebhookSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }
  const authHeader = request.headers.get("x-webhook-secret");
  if (authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const denied = requireWebhookSecret(request);
    if (denied) return denied;

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = body.slug || generateSlug(body.title);

    const news = await prisma.news.create({
      data: {
        title: body.title,
        slug: slug,
        description: body.excerpt || body.description || null,
        content: body.content || body.description || null,
        imageUrl: body.image_url || body.imageUrl || null,
        isPublished: body.is_published ?? body.isPublished ?? true,
        publishedAt:
          (body.is_published ?? body.isPublished ?? true) ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "News created successfully",
      data: {
        id: news.id,
        title: news.title,
        slug: news.slug,
        url: `/news/${news.slug}`,
      },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  const timestamp = Date.now();
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);

  return `${baseSlug}-${timestamp}`;
}
