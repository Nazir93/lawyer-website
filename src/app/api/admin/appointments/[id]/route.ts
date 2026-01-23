import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/auth";
import { AppointmentType, AppointmentStatus } from "@prisma/client";

// PUT - Обновить запись
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const {
      user_id,
      title,
      description,
      appointment_time,
      duration_minutes,
      type,
      meeting_link,
      status,
    } = body;

    const updateData: {
      userId?: string;
      title?: string;
      description?: string | null;
      appointmentDate?: Date;
      durationMinutes?: number;
      type?: AppointmentType;
      meetingLink?: string | null;
      status?: AppointmentStatus;
    } = {};
    
    if (user_id) updateData.userId = user_id;
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (appointment_time) updateData.appointmentDate = new Date(appointment_time);
    if (duration_minutes) updateData.durationMinutes = duration_minutes;
    if (type) updateData.type = type.toUpperCase() as AppointmentType;
    if (meeting_link !== undefined) updateData.meetingLink = meeting_link?.trim() || null;
    if (status) updateData.status = status.toUpperCase() as AppointmentStatus;

    const data = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error updating appointment:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка обновления записи" }, { status: 500 });
  }
}

// DELETE - Удалить запись
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Ошибка удаления записи" }, { status: 500 });
  }
}
