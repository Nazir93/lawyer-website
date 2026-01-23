import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { AppointmentType } from "@prisma/client";

// GET - Получить записи пользователя
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const upcoming = searchParams.get("upcoming");
    
    const data = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        ...(upcoming === "true" && {
          appointmentDate: { gte: new Date() },
        }),
      },
      orderBy: { appointmentDate: "asc" },
    });
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения записей" }, { status: 500 });
  }
}

// POST - Создать запись
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const data = await prisma.appointment.create({
      data: {
        userId: user.id,
        caseId: body.case_id || null,
        title: body.title,
        description: body.description,
        appointmentDate: new Date(body.appointment_date),
        durationMinutes: body.duration_minutes || 60,
        type: body.type ? (body.type.toUpperCase() as AppointmentType) : "ONLINE",
        meetingLink: body.meeting_link,
        officeAddress: body.office_address,
        status: "SCHEDULED",
      },
    });
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error creating appointment:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка создания записи" }, { status: 500 });
  }
}
