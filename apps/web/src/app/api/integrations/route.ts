import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/integrations
 * List all integrations for a workspace
 *
 * Query params:
 * - workspaceId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspaceId from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Get current user and verify workspace membership
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

    // Fetch all integrations for the workspace
    const integrations = await prisma.integration.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't expose sensitive config data (webhookUrls, secrets, etc.)
        // Frontend only needs to know if integration exists and is active
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
