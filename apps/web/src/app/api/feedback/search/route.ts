import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaginationFromSearchParams, createPaginatedResponse } from "@/lib/pagination";
import { sanitizeSearchQuery } from "@/lib/sanitize";

/**
 * GET /api/feedback/search
 * Full-text search for feedback
 *
 * Query params:
 * - query: string (required) - Search query
 * - workspaceId: string (required) - Workspace to search in
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 20, max: 100)
 *
 * Searches across:
 * - Feedback title
 * - Feedback description
 * - Comment content
 * - Submitter name/email
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
    const query = searchParams.get("query");
    const workspaceId = searchParams.get("workspaceId");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Sanitize search query to prevent injection
    const sanitizedQuery = sanitizeSearchQuery(query);

    if (!sanitizedQuery) {
      return NextResponse.json(
        { error: "Invalid search query" },
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

    // Get workspace projects
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json(
        createPaginatedResponse([], 0, 1, 20)
      );
    }

    // Get pagination params
    const { page, limit, skip } = getPaginationFromSearchParams(searchParams);

    // Build search query with OR conditions
    const where = {
      projectId: { in: projectIds },
      OR: [
        // Search in title
        {
          title: {
            contains: sanitizedQuery,
            mode: "insensitive" as const,
          },
        },
        // Search in description
        {
          description: {
            contains: sanitizedQuery,
            mode: "insensitive" as const,
          },
        },
        // Search in submitter name
        {
          name: {
            contains: sanitizedQuery,
            mode: "insensitive" as const,
          },
        },
        // Search in submitter email
        {
          email: {
            contains: sanitizedQuery,
            mode: "insensitive" as const,
          },
        },
        // Search in comments
        {
          comments: {
            some: {
              content: {
                contains: sanitizedQuery,
                mode: "insensitive" as const,
              },
            },
          },
        },
      ],
    };

    // Get total count
    const total = await prisma.feedback.count({ where });

    // Fetch feedback with pagination
    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
            slug: true,
          },
        },
        screenshots: true,
        comments: {
          where: {
            content: {
              contains: sanitizedQuery,
              mode: "insensitive" as const,
            },
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          take: 3, // Include up to 3 matching comments
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [
        // Prioritize exact matches in title
        {
          title: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take: limit,
    });

    // Add search highlighting metadata
    const feedbackWithHighlights = feedback.map((item) => ({
      ...item,
      searchMeta: {
        query: sanitizedQuery,
        matchedIn: [] as string[],
        matchedComments: item.comments.length,
      },
    }));

    // Determine what fields matched
    feedbackWithHighlights.forEach((item) => {
      const lowerQuery = sanitizedQuery.toLowerCase();
      if (item.title.toLowerCase().includes(lowerQuery)) {
        item.searchMeta.matchedIn.push("title");
      }
      if (item.description.toLowerCase().includes(lowerQuery)) {
        item.searchMeta.matchedIn.push("description");
      }
      if (item.name?.toLowerCase().includes(lowerQuery)) {
        item.searchMeta.matchedIn.push("name");
      }
      if (item.email?.toLowerCase().includes(lowerQuery)) {
        item.searchMeta.matchedIn.push("email");
      }
      if (item.comments.length > 0) {
        item.searchMeta.matchedIn.push("comments");
      }
    });

    // Return paginated response
    const response = createPaginatedResponse(feedbackWithHighlights, total, page, limit);

    return NextResponse.json({
      ...response,
      query: sanitizedQuery,
    });
  } catch (error) {
    console.error("Error searching feedback:", error);
    return NextResponse.json(
      { error: "Failed to search feedback" },
      { status: 500 }
    );
  }
}
