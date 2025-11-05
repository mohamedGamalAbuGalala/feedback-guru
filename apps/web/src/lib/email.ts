// Email service abstraction layer
// This can be easily swapped to use SendGrid, AWS SES, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface InvitationEmailData {
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationUrl: string;
}

interface FeedbackNotificationData {
  feedbackId: string;
  feedbackTitle: string;
  feedbackDescription: string;
  category: string;
  priority: string;
  submitterEmail?: string;
  feedbackUrl: string;
  projectName: string;
}

interface CommentNotificationData {
  feedbackId: string;
  feedbackTitle: string;
  commentContent: string;
  commenterName: string;
  feedbackUrl: string;
}

interface StatusChangeNotificationData {
  feedbackId: string;
  feedbackTitle: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  feedbackUrl: string;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    // Using Resend as the email service
    // Set RESEND_API_KEY in .env
    this.apiKey = process.env.RESEND_API_KEY || "";
    this.fromEmail = process.env.EMAIL_FROM || "notifications@feedbackguru.com";
    this.fromName = process.env.EMAIL_FROM_NAME || "Feedback Guru";
  }

  private async send(options: EmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      console.warn("Email service not configured. Set RESEND_API_KEY in .env");
      console.log("Would have sent email:", options);
      return false;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to send email:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async sendInvitation(to: string, data: InvitationEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #6366f1;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(to right, #6366f1, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content {
              padding: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(to right, #6366f1, #a855f7);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
            .role-badge {
              display: inline-block;
              padding: 4px 12px;
              background: #e0e7ff;
              color: #4338ca;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Feedback Guru</div>
          </div>

          <div class="content">
            <h2>You've been invited to join a workspace!</h2>

            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.workspaceName}</strong> on Feedback Guru.</p>

            <p>You'll be joining as: <span class="role-badge">${data.role}</span></p>

            <p>Feedback Guru helps teams collect, manage, and act on user feedback with beautiful widgets, kanban boards, and powerful integrations.</p>

            <div style="text-align: center;">
              <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              This invitation will expire in 7 days. If you don't want to join this workspace, you can ignore this email.
            </p>
          </div>

          <div class="footer">
            <p>© 2025 Feedback Guru. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXTAUTH_URL}" style="color: #6366f1; text-decoration: none;">Visit Website</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `You've been invited to join ${data.workspaceName}`,
      html,
    });
  }

  async sendNewFeedbackNotification(
    to: string,
    data: FeedbackNotificationData
  ): Promise<boolean> {
    const priorityColors: Record<string, string> = {
      LOW: "#10b981",
      MEDIUM: "#f59e0b",
      HIGH: "#ef4444",
      URGENT: "#dc2626",
    };

    const categoryEmojis: Record<string, string> = {
      BUG: "🐛",
      FEATURE_REQUEST: "✨",
      QUESTION: "❓",
      IMPROVEMENT: "⚡",
      OTHER: "📝",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #6366f1;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(to right, #6366f1, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content {
              padding: 20px 0;
            }
            .feedback-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              background: #f9fafb;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-right: 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(to right, #6366f1, #a855f7);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Feedback Guru</div>
          </div>

          <div class="content">
            <h2>${categoryEmojis[data.category] || "📝"} New Feedback Received</h2>

            <p>New feedback has been submitted for <strong>${data.projectName}</strong>.</p>

            <div class="feedback-card">
              <div style="margin-bottom: 12px;">
                <span class="badge" style="background: #e0e7ff; color: #4338ca;">${data.category}</span>
                <span class="badge" style="background: ${priorityColors[data.priority] || "#6b7280"}; color: white;">${data.priority}</span>
              </div>

              <h3 style="margin: 0 0 12px 0;">${data.feedbackTitle}</h3>

              <p style="color: #6b7280; margin: 0 0 12px 0;">${data.feedbackDescription.substring(0, 200)}${data.feedbackDescription.length > 200 ? "..." : ""}</p>

              ${data.submitterEmail ? `<p style="font-size: 14px; color: #6b7280; margin: 0;">From: ${data.submitterEmail}</p>` : ""}
            </div>

            <div style="text-align: center;">
              <a href="${data.feedbackUrl}" class="button">View Feedback</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2025 Feedback Guru. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard/settings" style="color: #6366f1; text-decoration: none;">Manage Notification Preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `[${data.projectName}] New ${data.category.toLowerCase().replace("_", " ")}: ${data.feedbackTitle}`,
      html,
    });
  }

  async sendCommentNotification(
    to: string,
    data: CommentNotificationData
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #6366f1;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(to right, #6366f1, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content {
              padding: 20px 0;
            }
            .comment-card {
              border-left: 4px solid #6366f1;
              padding: 16px;
              margin: 20px 0;
              background: #f9fafb;
              border-radius: 4px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(to right, #6366f1, #a855f7);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Feedback Guru</div>
          </div>

          <div class="content">
            <h2>💬 New Comment on Feedback</h2>

            <p><strong>${data.commenterName}</strong> commented on: <strong>${data.feedbackTitle}</strong></p>

            <div class="comment-card">
              <p style="margin: 0; color: #374151;">${data.commentContent}</p>
            </div>

            <div style="text-align: center;">
              <a href="${data.feedbackUrl}" class="button">View Comment</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2025 Feedback Guru. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard/settings" style="color: #6366f1; text-decoration: none;">Manage Notification Preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `New comment on: ${data.feedbackTitle}`,
      html,
    });
  }

  async sendStatusChangeNotification(
    to: string,
    data: StatusChangeNotificationData
  ): Promise<boolean> {
    const statusEmojis: Record<string, string> = {
      NEW: "🆕",
      OPEN: "📖",
      IN_PROGRESS: "⚙️",
      RESOLVED: "✅",
      CLOSED: "🔒",
      WONT_FIX: "❌",
      DUPLICATE: "🔁",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #6366f1;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(to right, #6366f1, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content {
              padding: 20px 0;
            }
            .status-change {
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
              margin: 20px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              margin: 0 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(to right, #6366f1, #a855f7);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Feedback Guru</div>
          </div>

          <div class="content">
            <h2>📊 Feedback Status Updated</h2>

            <p><strong>${data.changedBy}</strong> updated the status of: <strong>${data.feedbackTitle}</strong></p>

            <div class="status-change">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Status changed:</div>
              <div>
                <span class="status-badge" style="background: #e5e7eb; color: #6b7280;">
                  ${statusEmojis[data.oldStatus] || ""} ${data.oldStatus}
                </span>
                <span style="color: #6b7280;">→</span>
                <span class="status-badge" style="background: #dcfce7; color: #16a34a;">
                  ${statusEmojis[data.newStatus] || ""} ${data.newStatus}
                </span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${data.feedbackUrl}" class="button">View Feedback</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2025 Feedback Guru. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard/settings" style="color: #6366f1; text-decoration: none;">Manage Notification Preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Status updated: ${data.feedbackTitle}`,
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
