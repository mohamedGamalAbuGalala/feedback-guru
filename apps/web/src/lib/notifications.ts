import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email";

interface FeedbackCreatedData {
  feedbackId: string;
  feedbackTitle: string;
  feedbackDescription: string;
  category: string;
  priority: string;
  submitterEmail?: string;
  projectId: string;
}

interface CommentCreatedData {
  feedbackId: string;
  commentId: string;
  commentContent: string;
  commenterId: string;
}

interface StatusChangedData {
  feedbackId: string;
  oldStatus: string;
  newStatus: string;
  changedById: string;
}

export class NotificationService {
  /**
   * Send notifications when new feedback is created
   */
  async notifyFeedbackCreated(data: FeedbackCreatedData): Promise<void> {
    try {
      // Get feedback details with project and workspace
      const feedback = await prisma.feedback.findUnique({
        where: { id: data.feedbackId },
        include: {
          project: {
            include: {
              workspace: {
                include: {
                  members: {
                    where: {
                      role: {
                        in: ["OWNER", "ADMIN", "MEMBER"],
                      },
                    },
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!feedback) {
        console.error("Feedback not found:", data.feedbackId);
        return;
      }

      // Send email to all workspace members (except VIEWER role)
      const feedbackUrl = `${process.env.NEXTAUTH_URL}/dashboard/feedback/${data.feedbackId}`;

      for (const member of feedback.project.workspace.members) {
        // Skip if member doesn't have an email
        if (!member.user.email) continue;

        await emailService.sendNewFeedbackNotification(member.user.email, {
          feedbackId: data.feedbackId,
          feedbackTitle: data.feedbackTitle,
          feedbackDescription: data.feedbackDescription,
          category: data.category,
          priority: data.priority,
          submitterEmail: data.submitterEmail,
          feedbackUrl,
          projectName: feedback.project.name,
        });
      }

      console.log(`Sent feedback notifications to ${feedback.project.workspace.members.length} members`);
    } catch (error) {
      console.error("Error sending feedback notifications:", error);
    }
  }

  /**
   * Send notifications when a comment is added
   */
  async notifyCommentCreated(data: CommentCreatedData): Promise<void> {
    try {
      // Get comment details
      const comment = await prisma.comment.findUnique({
        where: { id: data.commentId },
        include: {
          user: true,
          feedback: {
            include: {
              project: {
                include: {
                  workspace: {
                    include: {
                      members: {
                        where: {
                          role: {
                            in: ["OWNER", "ADMIN", "MEMBER"],
                          },
                        },
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!comment) {
        console.error("Comment not found:", data.commentId);
        return;
      }

      const feedbackUrl = `${process.env.NEXTAUTH_URL}/dashboard/feedback/${data.feedbackId}`;

      // Send email to all workspace members except the commenter
      for (const member of comment.feedback.project.workspace.members) {
        // Skip the person who made the comment
        if (member.userId === data.commenterId) continue;

        // Skip if member doesn't have an email
        if (!member.user.email) continue;

        await emailService.sendCommentNotification(member.user.email, {
          feedbackId: data.feedbackId,
          feedbackTitle: comment.feedback.title,
          commentContent: data.commentContent,
          commenterName: comment.user.name || comment.user.email,
          feedbackUrl,
        });
      }

      console.log(`Sent comment notifications to workspace members`);
    } catch (error) {
      console.error("Error sending comment notifications:", error);
    }
  }

  /**
   * Send notifications when feedback status changes
   */
  async notifyStatusChanged(data: StatusChangedData): Promise<void> {
    try {
      // Get feedback details
      const feedback = await prisma.feedback.findUnique({
        where: { id: data.feedbackId },
        include: {
          project: {
            include: {
              workspace: {
                include: {
                  members: {
                    where: {
                      role: {
                        in: ["OWNER", "ADMIN", "MEMBER"],
                      },
                    },
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!feedback) {
        console.error("Feedback not found:", data.feedbackId);
        return;
      }

      // Get the user who changed the status
      const changedBy = await prisma.user.findUnique({
        where: { id: data.changedById },
      });

      if (!changedBy) {
        console.error("User not found:", data.changedById);
        return;
      }

      const feedbackUrl = `${process.env.NEXTAUTH_URL}/dashboard/feedback/${data.feedbackId}`;

      // Send email to all workspace members except the person who changed it
      for (const member of feedback.project.workspace.members) {
        // Skip the person who changed the status
        if (member.userId === data.changedById) continue;

        // Skip if member doesn't have an email
        if (!member.user.email) continue;

        await emailService.sendStatusChangeNotification(member.user.email, {
          feedbackId: data.feedbackId,
          feedbackTitle: feedback.title,
          oldStatus: data.oldStatus,
          newStatus: data.newStatus,
          changedBy: changedBy.name || changedBy.email,
          feedbackUrl,
        });
      }

      console.log(`Sent status change notifications to workspace members`);
    } catch (error) {
      console.error("Error sending status change notifications:", error);
    }
  }

  /**
   * Send notifications to Slack integration
   */
  async notifySlack(workspaceId: string, message: any): Promise<void> {
    try {
      const slackIntegration = await prisma.integration.findFirst({
        where: {
          workspaceId,
          type: "SLACK",
          isActive: true,
        },
      });

      if (!slackIntegration) {
        return;
      }

      const config = slackIntegration.config as any;
      const webhookUrl = config.webhookUrl;

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Error sending Slack notification:", error);
    }
  }

  /**
   * Send notifications to Discord integration
   */
  async notifyDiscord(workspaceId: string, embed: any): Promise<void> {
    try {
      const discordIntegration = await prisma.integration.findFirst({
        where: {
          workspaceId,
          type: "DISCORD",
          isActive: true,
        },
      });

      if (!discordIntegration) {
        return;
      }

      const config = discordIntegration.config as any;
      const webhookUrl = config.webhookUrl;

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch (error) {
      console.error("Error sending Discord notification:", error);
    }
  }

  /**
   * Trigger custom webhooks
   */
  async triggerWebhooks(
    workspaceId: string,
    event: string,
    data: any
  ): Promise<void> {
    try {
      const webhooks = await prisma.webhook.findMany({
        where: {
          workspaceId,
          isActive: true,
          events: {
            has: event,
          },
        },
      });

      const payload = {
        event,
        timestamp: new Date().toISOString(),
        workspace_id: workspaceId,
        data,
      };

      for (const webhook of webhooks) {
        try {
          // Send webhook request
          await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": this.generateSignature(
                payload,
                webhook.secret || ""
              ),
            },
            body: JSON.stringify(payload),
          });

          // Update last triggered timestamp
          await prisma.webhook.update({
            where: { id: webhook.id },
            data: { lastTriggeredAt: new Date() },
          });
        } catch (error) {
          console.error(`Error triggering webhook ${webhook.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error triggering webhooks:", error);
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateSignature(payload: any, secret: string): string {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest("hex")}`;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
