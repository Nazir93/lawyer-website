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
    const past = searchParams.get("past");
    
    const now = new Date();
    
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        ...(upcoming === "true" && {
          appointmentDate: { gte: now },
          status: { notIn: ["CANCELLED", "COMPLETED"] },
        }),
        ...(past === "true" && {
          OR: [
            { appointmentDate: { lt: now } },
            { status: { in: ["CANCELLED", "COMPLETED"] } },
          ],
        }),
      },
      orderBy: { appointmentDate: upcoming === "true" ? "asc" : "desc" },
    });
    
    // Преобразуем в snake_case для фронтенда
    const data = appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      description: apt.description,
      appointment_date: apt.appointmentDate.toISOString(),
      duration_minutes: apt.durationMinutes,
      type: apt.type.toLowerCase(),
      status: apt.status.toLowerCase(),
      meeting_link: apt.meetingLink,
      office_address: apt.officeAddress,
      created_at: apt.createdAt.toISOString(),
    }));
    
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка получения записей" }, { status: 500 });
  }
}

// POST - Забронировать слот
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const { slot_id, title, description, type } = body;

    if (!slot_id) {
      return NextResponse.json(
        { error: "slot_id обязателен" },
        { status: 400 }
      );
    }

    // Проверяем что слот существует и доступен
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slot_id },
    });

    if (!slot) {
      return NextResponse.json(
        { error: "Слот не найден" },
        { status: 404 }
      );
    }

    if (slot.isBooked || !slot.isAvailable) {
      return NextResponse.json(
        { error: "Этот слот уже занят" },
        { status: 400 }
      );
    }

    // Вычисляем длительность слота в минутах
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    // Создаём дату и время записи
    const appointmentDate = new Date(slot.date);
    appointmentDate.setHours(startH, startM, 0, 0);

    // Создаём запись
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        title: title || "Консультация",
        description: description || null,
        appointmentDate,
        durationMinutes,
        type: type ? (type.toUpperCase() as AppointmentType) : "ONLINE",
        status: "SCHEDULED",
      },
    });

    // Помечаем слот как занятый
    await prisma.timeSlot.update({
      where: { id: slot_id },
      data: {
        isBooked: true,
        appointmentId: appointment.id,
      },
    });

    return NextResponse.json({ 
      data: appointment, 
      success: true,
      message: "Запись успешно создана"
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Ошибка создания записи" }, { status: 500 });
  }
}
