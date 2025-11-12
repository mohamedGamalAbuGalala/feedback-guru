import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const publishSchema = z.object({
  isPublished: z.boolean(),
});

/**
 * POST /api/changelog/[id]/publish
 * Publish or unpublish a changelog entry
 *
 * Body:
 * - isPublished: boolean
 *
 * Requires: OWNER or ADMIN role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isPublished } = publishSchema.parse(body);

    // Get changelog entry
    const changelog = await prisma.changelogEntry.findUnique({
      where: { id: params.id },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog entry not found" },
        { status: 404 }
      );
    }

    // Verify user has permission (OWNER or ADMIN)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          where: { workspaceId: changelog.workspaceId },
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
        { error: "Only workspace owners and admins can publish changelog entries" },
        { status: 403 }
      );
    }

    // Update publish status
    const updatedChangelog = await prisma.changelogEntry.update({
      where: { id: params.id },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({
      changelog: updatedChangelog,
      message: isPublished
        ? "Changelog entry published successfully"
        : "Changelog entry unpublished successfully",
    });
  } catch (error: any) {
    console.error("Error publishing changelog:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to publish changelog entry" },
      { status: 500 }
    );
  }
}
