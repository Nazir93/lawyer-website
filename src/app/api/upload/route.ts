import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    // Проверка типа файла (расширенный список для документов)
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: "Недопустимый тип файла. Разрешены: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Проверка размера (макс 10MB для документов)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимум 10MB" },
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
