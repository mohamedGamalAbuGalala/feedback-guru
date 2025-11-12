import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getPaginationFromSearchParams, createPaginatedResponse } from "@/lib/pagination";

const changelogSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  version: z.string().optional(),
  type: z.enum(["FEATURE", "IMPROVEMENT", "BUG_FIX", "BREAKING_CHANGE"]).default("FEATURE"),
});

/**
 * POST /api/changelog
 * Create a new changelog entry
 *
 * Requires: OWNER or ADMIN role
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = changelogSchema.parse(body);

    // Get current user and verify role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          where: { workspaceId: data.workspaceId },
        },
      },
    });

    if (!currentUser || currentUser.workspaceMembers.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const member = currentUser.workspaceMembers[0];
    if (member.role !== "OWNER" && member.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only workspace owners and admins can create changelog entries" },
        { status: 403 }
      );
    }

    // Create changelog entry
    const changelog = await prisma.changelogEntry.create({
      data: {
        workspaceId: data.workspaceId,
        title: data.title,
        content: data.content,
        version: data.version,
        type: data.type,
        isPublished: false, // Draft by default
      },
    });

    return NextResponse.json({ changelog }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating changelog:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create changelog entry" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/changelog
 * List changelog entries for a workspace
 *
 * Query params:
 * - workspaceId: string (required)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - published: boolean (optional) - Filter by published status
 * - type: string (optional) - Filter by type
 *
 * Requires: Workspace membership
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Verify workspace membership
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          where: { workspaceId },
        },
      },
    });

    if (!currentUser || currentUser.workspaceMembers.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    // Get pagination params
    const { page, limit, skip } = getPaginationFromSearchParams(searchParams);

    // Build filters
    const where: any = { workspaceId };

    const publishedParam = searchParams.get("published");
    if (publishedParam !== null) {
      where.isPublished = publishedParam === "true";
    }

    const type = searchParams.get("type");
    if (type) {
      where.type = type;
    }

    // Get total count
    const total = await prisma.changelogEntry.count({ where });

    // Fetch changelog entries with pagination
    const entries = await prisma.changelogEntry.findMany({
      where,
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });

    // Return paginated response
    const response = createPaginatedResponse(entries, total, page, limit);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching changelog:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog entries" },
      { status: 500 }
    );
  }
}
