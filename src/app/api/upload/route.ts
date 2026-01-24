import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";

// Route Segment Config для App Router
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 секунд таймаут

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    // Проверка типа файла (расширенный список для документов и видео)
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".ogg", ".mov"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: "Недопустимый тип файла. Разрешены: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, WebP, GIF, MP4, WebM" },
        { status: 400 }
      );
    }

    // Проверка размера (макс 50MB для видео, 10MB для остальных)
    const isVideo = file.type.startsWith("video/") || [".mp4", ".webm", ".ogg", ".mov"].includes(fileExt);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Файл слишком большой. Максимум ${isVideo ? "50MB" : "10MB"}` },
        { status: 400 }
      );
    }

    // Конвертируем File в Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Загружаем в Yandex Object Storage
    const result = await uploadFile(buffer, file.name, file.type);
    
    if (!result.success || !result.url) {
      return NextResponse.json(
        { 
          error: "Ошибка загрузки файла",
          details: result.error,
          hint: "Проверьте настройки Yandex Object Storage"
        },
        { status: 500 }
      );
    }

    // Сохраняем информацию о файле в БД
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
      // Не прерываем, файл уже загружен
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
