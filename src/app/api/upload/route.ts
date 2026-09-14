import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { requireAuth } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".txt",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".mp4",
      ".webm",
      ".ogg",
      ".mov",
    ];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.includes(fileExt)
    ) {
      return NextResponse.json(
        {
          error:
            "Недопустимый тип файла. Разрешены: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, WebP, GIF, MP4, WebM",
        },
        { status: 400 }
      );
    }

    const isVideo =
      file.type.startsWith("video/") ||
      [".mp4", ".webm", ".ogg", ".mov"].includes(fileExt);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Файл слишком большой. Максимум ${isVideo ? "50MB" : "10MB"}`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFile(buffer, file.name, file.type);

    if (!result.success || !result.url) {
      return NextResponse.json(
        {
          error: "Ошибка загрузки файла",
          details: result.error,
        },
        { status: 500 }
      );
    }

    try {
      await prisma.media.create({
        data: {
          filename: result.filename!,
          originalFilename: file.name,
          fileUrl: result.url,
          fileType: file.type,
          fileSize: file.size,
        },
      });
    } catch (dbError) {
      console.error("DB error:", dbError);
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
    );
  }
}
