import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/auth";

// GET - Получить временные слоты за период
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "start и end обязательны" },
        { status: 400 }
      );
    }

    const slots = await prisma.timeSlot.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Преобразуем для фронтенда
    const data = slots.map((slot) => ({
      id: slot.id,
      date: slot.date.toISOString().split("T")[0],
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_booked: slot.isBooked,
      is_available: slot.isAvailable,
      appointment_id: slot.appointmentId,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching time slots:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Ошибка получения слотов" },
      { status: 500 }
    );
  }
}

// POST - Создать временные слоты
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { date, slots, generate_week } = body;

    // Если нужно сгенерировать слоты на неделю
    if (generate_week) {
      if (!date) {
        return NextResponse.json(
          { error: "Дата обязательна" },
          { status: 400 }
        );
      }

      const startDate = new Date(date);
      // Сбрасываем время на начало дня
      startDate.setHours(0, 0, 0, 0);
      
      const slotsToCreate: Array<{
        date: Date;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        isBooked: boolean;
      }> = [];

      // Генерируем на 7 дней
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + d);
        // Убеждаемся что время сброшено
        currentDate.setHours(0, 0, 0, 0);

        // Пропускаем выходные если указано
        const dayOfWeek = currentDate.getDay();
        if (body.skip_weekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
          continue;
        }

        // Создаём слоты по часам
        const startHour = body.start_hour || 9;
        const endHour = body.end_hour || 18;
        const slotDuration = body.slot_duration || 60; // в минутах

        for (let hour = startHour; hour < endHour; hour++) {
          const startTime = `${hour.toString().padStart(2, "0")}:00`;
          const endMinutes = hour * 60 + slotDuration;
          const endHourCalc = Math.floor(endMinutes / 60);
          const endMinCalc = endMinutes % 60;
          const endTime = `${endHourCalc.toString().padStart(2, "0")}:${endMinCalc.toString().padStart(2, "0")}`;

          slotsToCreate.push({
            date: new Date(currentDate), // Копия даты
            startTime,
            endTime,
            isAvailable: true,
            isBooked: false,
          });
        }
      }

      console.log(`[TimeSlots] Generating ${slotsToCreate.length} slots starting from ${startDate.toISOString()}`);

      // Создаём слоты один за другим
      const createdSlots = [];
      for (const slot of slotsToCreate) {
        try {
          // Проверяем существует ли слот
          const existing = await prisma.timeSlot.findFirst({
            where: {
              date: slot.date,
              startTime: slot.startTime,
            },
          });

          if (existing) {
            // Обновляем если существует
            const updated = await prisma.timeSlot.update({
              where: { id: existing.id },
              data: { isAvailable: true },
            });
            createdSlots.push(updated);
          } else {
            // Создаём новый
            const created = await prisma.timeSlot.create({
              data: slot,
            });
            createdSlots.push(created);
          }
        } catch (e) {
          console.error("Error creating slot:", e);
        }
      }

      console.log(`[TimeSlots] Created/updated ${createdSlots.length} slots`);

      return NextResponse.json({
        data: createdSlots,
        count: createdSlots.length,
        success: true,
      });
    }

    // Создаём отдельные слоты
    if (!date || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: "date и slots обязательны" },
        { status: 400 }
      );
    }

    const createdSlots = [];
    for (const slot of slots) {
      try {
        const created = await prisma.timeSlot.create({
          data: {
            date: new Date(date),
            startTime: slot.start_time,
            endTime: slot.end_time,
            isAvailable: true,
            isBooked: false,
          },
        });
        createdSlots.push(created);
      } catch (e) {
        // Игнорируем дубликаты
      }
    }

    return NextResponse.json({
      data: createdSlots,
      count: createdSlots.length,
      success: true,
    });
  } catch (error) {
    console.error("Error creating time slots:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Ошибка создания слотов" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить слоты за дату
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const slotId = searchParams.get("id");

    if (slotId) {
      // Удаляем конкретный слот
      await prisma.timeSlot.delete({
        where: { id: slotId },
      });
    } else if (date) {
      // Удаляем все слоты за дату
      await prisma.timeSlot.deleteMany({
        where: {
          date: new Date(date),
          isBooked: false, // Только незанятые
        },
      });
    } else {
      return NextResponse.json(
        { error: "id или date обязательны" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting time slots:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Ошибка удаления слотов" },
      { status: 500 }
    );
  }
}

