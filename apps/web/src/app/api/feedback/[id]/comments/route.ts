import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notificationService } from "@/lib/notifications";
import { sanitizeComment } from "@/lib/sanitize";
import { commentSchema } from "@/lib/validation-schemas";

// GET /api/feedback/[id]/comments - Get all comments for a feedback item
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

    // Verify user has access to this feedback
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
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Get comments
    const comments = await prisma.comment.findMany({
      where: {
        feedbackId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/feedback/[id]/comments - Add a comment
export async function POST(
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
    const validatedData = commentSchema.parse(body);

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

    // Sanitize comment content to prevent XSS attacks
    const sanitizedContent = sanitizeComment(validatedData.content);

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        feedbackId: params.id,
        userId: userId,
        content: sanitizedContent,
        isInternal: validatedData.isInternal || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Send notifications (fire and forget - don't block API response)
    // Only send if comment is not internal
    if (!comment.isInternal) {
      setImmediate(async () => {
        try {
          // Email notifications to team members
          await notificationService.notifyCommentCreated({
            feedbackId: params.id,
            commentId: comment.id,
            commentContent: comment.content,
            commenterId: userId,
          });

          // Slack notification
          await notificationService.notifySlack(feedback.project.workspace.id, {
            text: `💬 New comment on feedback: ${feedback.title}`,
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "💬 New Comment",
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
                    text: `*By:*\n${comment.user.name || comment.user.email}`,
                  },
                ],
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Comment:*\n${comment.content.substring(0, 200)}${comment.content.length > 200 ? "..." : ""}`,
                },
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
          await notificationService.notifyDiscord(feedback.project.workspace.id, {
            title: "💬 New Comment",
            description: comment.content.substring(0, 200) + (comment.content.length > 200 ? "..." : ""),
            color: 0x3b82f6, // Blue
            fields: [
              {
                name: "Feedback",
                value: feedback.title,
                inline: true,
              },
              {
                name: "By",
                value: comment.user.name || comment.user.email,
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
          await notificationService.triggerWebhooks(feedback.project.workspace.id, "comment.created", {
            comment: {
              id: comment.id,
              content: comment.content,
              isInternal: comment.isInternal,
              createdAt: comment.createdAt,
            },
            feedback: {
              id: feedback.id,
              title: feedback.title,
              category: feedback.category,
              status: feedback.status,
            },
            user: {
              id: comment.user.id,
              name: comment.user.name,
              email: comment.user.email,
            },
          });
        } catch (error) {
          console.error("Error sending comment notifications:", error);
        }
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
