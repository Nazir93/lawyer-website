import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить один раздел
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { services: true } },
          },
        },
        parent: true,
        _count: { select: { services: true, children: true } },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Раздел не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: section.id,
        name: section.name,
        slug: section.slug,
        description: section.description,
        image_url: section.imageUrl,
        icon: section.icon,
        parent_id: section.parentId,
        parent: section.parent ? {
          id: section.parent.id,
          name: section.parent.name,
        } : null,
        sort_order: section.sortOrder,
        is_active: section.isActive,
        services_count: section._count?.services || 0,
        children_count: section._count?.children || 0,
        children: section.children?.map((child: any) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          sort_order: child.sortOrder,
          is_active: child.isActive,
          services_count: child._count?.services || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching section:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка получения раздела" }, { status: 500 })
    );
  }
}

// PUT - Обновить раздел
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;
    const body = await request.json();

    const section = await prisma.section.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        imageUrl: body.image_url || null,
        icon: body.icon || null,
        parentId: body.parent_id || null,
        sortOrder: body.sort_order ?? undefined,
        isActive: body.is_active ?? undefined,
      },
      include: {
        _count: { select: { services: true, children: true } },
      },
    });

    return NextResponse.json({
      data: {
        id: section.id,
        name: section.name,
        slug: section.slug,
        description: section.description,
        image_url: section.imageUrl,
        icon: section.icon,
        parent_id: section.parentId,
        sort_order: section.sortOrder,
        is_active: section.isActive,
        services_count: section._count?.services || 0,
        children_count: section._count?.children || 0,
      },
      success: true,
    });
  } catch (error: any) {
    console.error("Error updating section:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Раздел с таким slug уже существует" },
        { status: 400 }
      );
    }
    
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка обновления раздела" }, { status: 500 })
    );
  }
}

// DELETE - Удалить раздел
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
    const { id } = await params;

    await prisma.section.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting section:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка удаления раздела" }, { status: 500 })
    );
  }
}

