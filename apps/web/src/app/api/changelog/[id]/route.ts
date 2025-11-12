import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sanitizeChangelog, sanitizeInput } from "@/lib/sanitize";
import { updateChangelogSchema } from "@/lib/validation-schemas";

/**
 * GET /api/changelog/[id]
 * Get a single changelog entry
 *
 * Requires: Workspace membership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const changelog = await prisma.changelogEntry.findUnique({
      where: { id: params.id },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog entry not found" },
        { status: 404 }
      );
    }

    // Verify workspace membership
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

    return NextResponse.json({ changelog });
  } catch (error) {
    console.error("Error fetching changelog:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog entry" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/changelog/[id]
 * Update a changelog entry
 *
 * Requires: OWNER or ADMIN role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateChangelogSchema.parse(body);

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
        { error: "Only workspace owners and admins can update changelog entries" },
        { status: 403 }
      );
    }

    // Sanitize user input to prevent XSS attacks
    const updateData: any = {};
    if (data.title) {
      updateData.title = sanitizeInput(data.title);
    }
    if (data.content) {
      updateData.content = sanitizeChangelog(data.content);
    }
    if (data.version !== undefined) {
      updateData.version = data.version ? sanitizeInput(data.version) : null;
    }
    if (data.type) {
      updateData.type = data.type;
    }

    // Update changelog entry
    const updatedChangelog = await prisma.changelogEntry.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ changelog: updatedChangelog });
  } catch (error: any) {
    console.error("Error updating changelog:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update changelog entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/changelog/[id]
 * Delete a changelog entry
 *
 * Requires: OWNER or ADMIN role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { error: "Only workspace owners and admins can delete changelog entries" },
        { status: 403 }
      );
    }

    // Delete changelog entry
    await prisma.changelogEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting changelog:", error);
    return NextResponse.json(
      { error: "Failed to delete changelog entry" },
      { status: 500 }
    );
  }
}
