import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Получить все разделы (с подразделами)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const includeChildren = searchParams.get("includeChildren") === "true";

    const sections = await prisma.section.findMany({
      where: parentId 
        ? { parentId } 
        : { parentId: null }, // Только корневые разделы
      include: includeChildren 
        ? {
            children: {
              orderBy: { sortOrder: "asc" },
              include: {
                _count: { select: { services: true } },
              },
            },
            _count: { select: { services: true, children: true } },
          }
        : {
            _count: { select: { services: true, children: true } },
          },
      orderBy: { sortOrder: "asc" },
    });

    // Преобразуем в snake_case для фронтенда
    const transformedSections = sections.map((section: any) => ({
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
      children: section.children?.map((child: any) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image_url: child.imageUrl,
        icon: child.icon,
        parent_id: child.parentId,
        sort_order: child.sortOrder,
        is_active: child.isActive,
        services_count: child._count?.services || 0,
      })),
      created_at: section.createdAt,
      updated_at: section.updatedAt,
    }));

    return NextResponse.json({ data: transformedSections });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка получения разделов" }, { status: 500 })
    );
  }
}

// POST - Создать новый раздел
export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await request.json();

    const section = await prisma.section.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        imageUrl: body.image_url || null,
        icon: body.icon || null,
        parentId: body.parent_id || null,
        sortOrder: body.sort_order || 0,
        isActive: body.is_active ?? true,
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
    console.error("Error creating section:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Раздел с таким slug уже существует" },
        { status: 400 }
      );
    }
    
    return (
      authErrorResponse(error) ||
      NextResponse.json({ error: "Ошибка создания раздела" }, { status: 500 })
    );
  }
}

