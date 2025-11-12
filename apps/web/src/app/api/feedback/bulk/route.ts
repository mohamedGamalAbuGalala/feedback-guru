import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Bulk operation schema
 */
const bulkOperationSchema = z.object({
  feedbackIds: z.array(z.string()).min(1, "At least one feedback ID required"),
  action: z.enum(["updateStatus", "updatePriority", "updatePublic", "delete", "assign"]),
  data: z.object({
    status: z.enum(["NEW", "REVIEWING", "PLANNED", "IN_PROGRESS", "COMPLETED", "REJECTED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    isPublic: z.boolean().optional(),
    assignedToId: z.string().nullable().optional(),
  }).optional(),
});

/**
 * POST /api/feedback/bulk
 * Perform bulk operations on multiple feedback items
 *
 * Body:
 * - feedbackIds: string[] (required) - Array of feedback IDs
 * - action: string (required) - Action to perform
 * - data: object (optional) - Data for the action
 *
 * Actions:
 * - updateStatus: Update status for all items
 * - updatePriority: Update priority for all items
 * - updatePublic: Update public/private for all items
 * - delete: Delete all items
 * - assign: Assign all items to a user
 *
 * Requires: Workspace membership (ADMIN/OWNER for delete)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = bulkOperationSchema.parse(body);

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get feedback items to verify access
    const feedbackItems = await prisma.feedback.findMany({
      where: {
        id: { in: validatedData.feedbackIds },
      },
      include: {
        project: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (feedbackItems.length === 0) {
      return NextResponse.json(
        { error: "No feedback items found" },
        { status: 404 }
      );
    }

    // Verify user has access to all feedback items (workspace membership)
    const workspaceIds = new Set(
      feedbackItems.map((item) => item.project.workspaceId)
    );

    const userWorkspaceIds = new Set(
      currentUser.workspaceMembers.map((member) => member.workspaceId)
    );

    const hasAccess = Array.from(workspaceIds).every((id) =>
      userWorkspaceIds.has(id)
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to some of these feedback items" },
        { status: 403 }
      );
    }

    // For delete action, require ADMIN or OWNER role
    if (validatedData.action === "delete") {
      const workspaceMemberships = currentUser.workspaceMembers.filter((member) =>
        Array.from(workspaceIds).includes(member.workspaceId)
      );

      const hasAdminAccess = workspaceMemberships.some(
        (member) => member.role === "OWNER" || member.role === "ADMIN"
      );

      if (!hasAdminAccess) {
        return NextResponse.json(
          { error: "Only workspace owners and admins can delete feedback" },
          { status: 403 }
        );
      }
    }

    // Perform bulk operation
    let result;

    switch (validatedData.action) {
      case "updateStatus":
        if (!validatedData.data?.status) {
          return NextResponse.json(
            { error: "Status is required for updateStatus action" },
            { status: 400 }
          );
        }

        result = await prisma.feedback.updateMany({
          where: { id: { in: validatedData.feedbackIds } },
          data: { status: validatedData.data.status },
        });
        break;

      case "updatePriority":
        if (!validatedData.data?.priority) {
          return NextResponse.json(
            { error: "Priority is required for updatePriority action" },
            { status: 400 }
          );
        }

        result = await prisma.feedback.updateMany({
          where: { id: { in: validatedData.feedbackIds } },
          data: { priority: validatedData.data.priority },
        });
        break;

      case "updatePublic":
        if (validatedData.data?.isPublic === undefined) {
          return NextResponse.json(
            { error: "isPublic is required for updatePublic action" },
            { status: 400 }
          );
        }

        result = await prisma.feedback.updateMany({
          where: { id: { in: validatedData.feedbackIds } },
          data: { isPublic: validatedData.data.isPublic },
        });
        break;

      case "assign":
        result = await prisma.feedback.updateMany({
          where: { id: { in: validatedData.feedbackIds } },
          data: { assignedToId: validatedData.data?.assignedToId || null },
        });
        break;

      case "delete":
        // Delete related records first (Prisma cascade should handle this, but being explicit)
        await prisma.comment.deleteMany({
          where: { feedbackId: { in: validatedData.feedbackIds } },
        });

        await prisma.screenshot.deleteMany({
          where: { feedbackId: { in: validatedData.feedbackIds } },
        });

        result = await prisma.feedback.deleteMany({
          where: { id: { in: validatedData.feedbackIds } },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action: validatedData.action,
      affectedCount: result.count,
      message: `Successfully ${validatedData.action === "delete" ? "deleted" : "updated"} ${result.count} feedback item(s)`,
    });
  } catch (error: any) {
    console.error("Error performing bulk operation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
