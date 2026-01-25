import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить доступные временные слоты для бронирования
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const date = searchParams.get("date");

    // Если указана конкретная дата
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const slots = await prisma.timeSlot.findMany({
        where: {
          date: targetDate,
          isAvailable: true,
          isBooked: false,
        },
        orderBy: { startTime: "asc" },
      });

      const data = slots.map((slot) => ({
        id: slot.id,
        date: slot.date.toISOString().split("T")[0],
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_available: true,
      }));

      return NextResponse.json({ data });
    }

    // Если указан диапазон дат
    if (!startDate || !endDate) {
      // По умолчанию - ближайшие 30 дней
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + 30);

      const slots = await prisma.timeSlot.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
          isAvailable: true,
          isBooked: false,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      // Группируем по датам
      const groupedByDate: Record<string, Array<{ id: string; start_time: string; end_time: string }>> = {};

      for (const slot of slots) {
        const dateKey = slot.date.toISOString().split("T")[0];
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push({
          id: slot.id,
          start_time: slot.startTime,
          end_time: slot.endTime,
        });
      }

      // Возвращаем даты с доступными слотами
      const data = Object.entries(groupedByDate).map(([dateKey, slots]) => ({
        date: dateKey,
        slots_count: slots.length,
        slots,
      }));

      return NextResponse.json({ data });
    }

    // Диапазон дат указан
    const slots = await prisma.timeSlot.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        isAvailable: true,
        isBooked: false,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const data = slots.map((slot) => ({
      id: slot.id,
      date: slot.date.toISOString().split("T")[0],
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_available: true,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Ошибка получения доступных слотов" },
      { status: 500 }
    );
  }
}

