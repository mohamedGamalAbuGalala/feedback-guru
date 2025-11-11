import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaginationFromSearchParams, createPaginatedResponse } from "@/lib/pagination";

/**
 * GET /api/public/feedback
 * List all public feedback for a project
 *
 * Query params:
 * - slug: string (project slug, required)
 * - category: string (optional filter)
 * - status: string (optional filter)
 * - sortBy: "votes" | "recent" (default: "votes")
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "votes";

    // Get pagination params
    const { page, limit, skip } = getPaginationFromSearchParams(searchParams);

    if (!slug) {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      );
    }

    // Find project by slug
    const project = await prisma.project.findFirst({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        settings: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if public board is enabled
    const settings = project.settings as any;
    if (!settings?.publicBoard?.enabled) {
      return NextResponse.json(
        { error: "Public board is not enabled for this project" },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = {
      projectId: project.id,
      isPublic: true,
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    // Build orderBy clause
    const orderBy: any[] = [];
    if (sortBy === "votes") {
      orderBy.push({ votes: "desc" });
      orderBy.push({ createdAt: "desc" });
    } else {
      orderBy.push({ createdAt: "desc" });
    }

    // Get total count for pagination
    const total = await prisma.feedback.count({ where });

    // Fetch feedback with pagination
    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Create paginated response
    const paginatedResponse = createPaginatedResponse(feedback, total, page, limit);

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        workspaceName: project.workspace.name,
      },
      ...paginatedResponse,
    });
  } catch (error) {
    console.error("Error fetching public feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch public feedback" },
      { status: 500 }
    );
  }
}
