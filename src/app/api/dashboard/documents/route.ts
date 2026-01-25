import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { DocumentCategory, DocumentStatus, Prisma } from "@prisma/client";

// GET - Получить документы пользователя
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const caseId = searchParams.get("case_id");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    
    const where: Prisma.ClientDocumentWhereInput = {
      userId: user.id,
    };
    
    if (caseId) {
      where.caseId = caseId;
    }
    
    if (status) {
      where.status = status.toUpperCase() as DocumentStatus;
    }
    
    if (category) {
      where.category = category.toUpperCase() as DocumentCategory;
    }
    
    const documents = await prisma.clientDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    
    // Преобразуем в snake_case для фронтенда
    const data = documents.map((doc) => ({
      id: doc.id,
      filename: doc.filename,
      original_filename: doc.originalFilename,
      file_url: doc.fileUrl,
      file_type: doc.fileType,
      file_size: doc.fileSize,
      title: doc.title,
      description: doc.description,
      category: doc.category?.toLowerCase() || "other",
      status: doc.status?.toLowerCase() || "uploaded",
      case_id: doc.caseId,
      created_at: doc.createdAt.toISOString(),
    }));
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching documents:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения документов" }, { status: 500 });
  }
}

// POST - Загрузить документ
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const data = await prisma.clientDocument.create({
      data: {
        userId: user.id,
        caseId: body.case_id || null,
        filename: body.filename,
        originalFilename: body.original_filename,
        fileUrl: body.file_url,
        fileType: body.file_type,
        fileSize: body.file_size,
        title: body.title,
        description: body.description,
        category: body.category ? (body.category.toUpperCase() as DocumentCategory) : "OTHER",
        status: body.status ? (body.status.toUpperCase() as DocumentStatus) : "UPLOADED",
        uploadedBy: "CLIENT",
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error creating document:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка загрузки документа" }, { status: 500 });
  }
}
