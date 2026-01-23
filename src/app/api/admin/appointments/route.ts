import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/auth";
import { AppointmentType } from "@prisma/client";

// GET - Получить записи в диапазоне дат (для админа)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "start и end обязательны" },
        { status: 400 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: { appointmentDate: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Преобразуем данные для совместимости с фронтендом
    const enrichedAppointments = appointments.map((apt) => ({
      ...apt,
      user_name: apt.user.name,
      user_email: apt.user.email,
    }));

    return NextResponse.json({ data: enrichedAppointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка получения записей" }, { status: 500 });
  }
}

// POST - Создать запись (от имени админа)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();

    const {
      user_id,
      title,
      description,
      appointment_time,
      duration_minutes,
      type,
      meeting_link,
    } = body;

    if (!user_id || !title || !appointment_time) {
      return NextResponse.json(
        { error: "user_id, title и appointment_time обязательны" },
        { status: 400 }
      );
    }

    const data = await prisma.appointment.create({
      data: {
        userId: user_id,
        title: title.trim(),
        description: description?.trim() || null,
        appointmentDate: new Date(appointment_time),
        durationMinutes: duration_minutes || 60,
        type: type ? (type.toUpperCase() as AppointmentType) : "ONLINE",
        meetingLink: meeting_link?.trim() || null,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error creating appointment:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка создания записи" }, { status: 500 });
  }
}
