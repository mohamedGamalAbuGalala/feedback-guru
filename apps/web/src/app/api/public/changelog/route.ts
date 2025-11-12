import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaginationFromSearchParams, createPaginatedResponse } from "@/lib/pagination";

/**
 * GET /api/public/changelog
 * List published changelog entries for a workspace (public endpoint)
 *
 * Query params:
 * - slug: string (workspace slug, required)
 * - type: string (optional) - Filter by type (FEATURE, IMPROVEMENT, BUG_FIX, BREAKING_CHANGE)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 *
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      );
    }

    // Find workspace by slug
    const workspace = await prisma.workspace.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Get pagination params
    const { page, limit, skip } = getPaginationFromSearchParams(searchParams);

    // Build filters - only published entries
    const where: any = {
      workspaceId: workspace.id,
      isPublished: true,
    };

    const type = searchParams.get("type");
    if (type) {
      where.type = type;
    }

    // Get total count
    const total = await prisma.changelogEntry.count({ where });

    // Fetch published changelog entries
    const entries = await prisma.changelogEntry.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        version: true,
        type: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
    });

    // Create paginated response
    const paginatedResponse = createPaginatedResponse(entries, total, page, limit);

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      ...paginatedResponse,
    });
  } catch (error) {
    console.error("Error fetching public changelog:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
      { status: 500 }
    );
  }
}
