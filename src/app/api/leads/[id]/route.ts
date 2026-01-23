import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

// GET - Получить одну заявку
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const data = await prisma.lead.findUnique({
      where: { id },
    });
    
    if (!data) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ error: "Ошибка получения данных" }, { status: 500 });
  }
}

// PUT - Обновить заявку (статус)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const data = await prisma.lead.update({
      where: { id },
      data: {
        status: body.status ? (body.status.toUpperCase() as LeadStatus) : undefined,
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// DELETE - Удалить заявку
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.lead.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
