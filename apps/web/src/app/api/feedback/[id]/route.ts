import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notificationService } from "@/lib/notifications";

const updateFeedbackSchema = z.object({
  status: z.enum(["NEW", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "WONT_FIX", "DUPLICATE"]).optional(),
  assignedTo: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

// GET /api/feedback/[id] - Get feedback by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: params.id,
        project: {
          workspace: {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        },
      },
      include: {
        screenshots: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// PATCH /api/feedback/[id] - Update feedback
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const validatedData = updateFeedbackSchema.parse(body);

    // Verify user has access to this feedback and get workspace info
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: params.id,
        project: {
          workspace: {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        },
      },
      include: {
        project: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Store old status for notification
    const oldStatus = feedback.status;
    const statusChanged = validatedData.status && validatedData.status !== oldStatus;

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: {
        id: params.id,
      },
      data: {
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.assignedTo !== undefined && {
          assignedTo: validatedData.assignedTo,
          assignedToName: validatedData.assignedTo ? undefined : null // Clear name if unassigning
        }),
        ...(validatedData.priority && { priority: validatedData.priority }),
      },
      include: {
        screenshots: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send notifications if status changed (fire and forget)
    if (statusChanged && validatedData.status) {
      setImmediate(async () => {
        try {
          // Email notifications to team members
          await notificationService.notifyStatusChanged({
            feedbackId: params.id,
            oldStatus: oldStatus,
            newStatus: validatedData.status!,
            changedById: userId,
          });

          // Slack notification
          const statusEmoji = {
            NEW: "🆕",
            OPEN: "📂",
            IN_PROGRESS: "⚙️",
            RESOLVED: "✅",
            CLOSED: "🔒",
            WONT_FIX: "❌",
            DUPLICATE: "🔄",
          };

          await notificationService.notifySlack(feedback.project.workspace.id, {
            text: `Status changed: ${feedback.title}`,
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "📊 Status Changed",
                },
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Feedback:*\n${feedback.title}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*Status:*\n${statusEmoji[oldStatus]} ${oldStatus} → ${statusEmoji[validatedData.status]} ${validatedData.status}`,
                  },
                ],
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: "View Feedback",
                    },
                    url: `${process.env.NEXTAUTH_URL}/dashboard/feedback/${params.id}`,
                  },
                ],
              },
            ],
          });

          // Discord notification
          const statusColor = {
            NEW: 0x3b82f6,      // Blue
            OPEN: 0x3b82f6,     // Blue
            IN_PROGRESS: 0xf59e0b, // Amber
            RESOLVED: 0x10b981,    // Green
            CLOSED: 0x6b7280,      // Gray
            WONT_FIX: 0xef4444,    // Red
            DUPLICATE: 0x8b5cf6,   // Purple
          };

          await notificationService.notifyDiscord(feedback.project.workspace.id, {
            title: "📊 Status Changed",
            description: `**${feedback.title}**`,
            color: statusColor[validatedData.status],
            fields: [
              {
                name: "Old Status",
                value: `${statusEmoji[oldStatus]} ${oldStatus}`,
                inline: true,
              },
              {
                name: "New Status",
                value: `${statusEmoji[validatedData.status]} ${validatedData.status}`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "Feedback Guru",
            },
            url: `${process.env.NEXTAUTH_URL}/dashboard/feedback/${params.id}`,
          });

          // Custom webhooks
          await notificationService.triggerWebhooks(feedback.project.workspace.id, "feedback.status_changed", {
            feedback: {
              id: feedback.id,
              title: feedback.title,
              category: feedback.category,
              priority: feedback.priority,
              oldStatus: oldStatus,
              newStatus: validatedData.status,
            },
            changedBy: userId,
          });
        } catch (error) {
          console.error("Error sending status change notifications:", error);
        }
      });
    }

    return NextResponse.json({ feedback: updatedFeedback });
  } catch (error: any) {
    console.error("Error updating feedback:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/[id] - Delete feedback
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify user has access to this feedback and has admin role
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: params.id,
        project: {
          workspace: {
            members: {
              some: {
                userId: userId,
                role: {
                  in: ["OWNER", "ADMIN"],
                },
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found or access denied" },
        { status: 404 }
      );
    }

    // Delete feedback (cascades to screenshots and comments)
    await prisma.feedback.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
