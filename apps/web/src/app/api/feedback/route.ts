import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notificationService } from "@/lib/notifications";
import { storageService } from "@/lib/storage";

const feedbackSchema = z.object({
  apiKey: z.string(),
  category: z.enum(["BUG", "FEATURE_REQUEST", "QUESTION", "IMPROVEMENT", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().optional().or(z.literal("")),
  url: z.string().url("Invalid URL"),
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  userAgent: z.string().optional(),
  consoleLogs: z.any().optional(),
  networkLogs: z.any().optional(),
  screenshots: z.array(z.string()).optional(), // Array of base64 images
});

// Helper function to generate title from description
function generateTitle(description: string): string {
  const words = description.split(" ");
  const title = words.slice(0, 8).join(" ");
  return title.length < description.length ? title + "..." : title;
}

// Helper function to save screenshot
async function saveScreenshot(base64Data: string, feedbackId: string): Promise<string> {
  // If storage is configured, upload to S3/R2
  if (storageService.isEnabled()) {
    try {
      const url = await storageService.upload(base64Data, undefined, "image/png");
      return url;
    } catch (error) {
      console.error("Failed to upload screenshot to storage, falling back to base64:", error);
      // Fallback to base64 if upload fails
      return base64Data;
    }
  }

  // Fallback: store base64 directly (not recommended for production)
  return base64Data;
}

// POST /api/feedback - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    // Verify API key and get project with workspace
    const project = await prisma.project.findUnique({
      where: { apiKey: data.apiKey },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Create title from description
    const title = generateTitle(data.description);

    // Upload screenshots to S3/R2 if configured
    let screenshotUrls: string[] = [];
    if (data.screenshots && data.screenshots.length > 0) {
      screenshotUrls = await Promise.all(
        data.screenshots.map((screenshot, index) =>
          saveScreenshot(screenshot, `temp-${Date.now()}-${index}`)
        )
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        projectId: project.id,
        category: data.category,
        priority: data.priority,
        title: title,
        description: data.description,
        email: data.email || null,
        name: data.name || null,
        url: data.url,
        browser: data.browser,
        browserVersion: data.browserVersion,
        os: data.os,
        osVersion: data.osVersion,
        screenWidth: data.screenWidth,
        screenHeight: data.screenHeight,
        userAgent: data.userAgent,
        consoleLogs: data.consoleLogs || null,
        networkLogs: data.networkLogs || null,
        status: "NEW",
        screenshots: screenshotUrls.length > 0
          ? {
              create: screenshotUrls.map((url) => ({
                url: url, // Now this is either an S3/R2 URL or base64 fallback
              })),
            }
          : undefined,
      },
      include: {
        screenshots: true,
      },
    });

    // Send notifications (fire and forget - don't block API response)
    // If notifications fail, feedback is still created successfully
    setImmediate(async () => {
      try {
        // Email notifications to team members
        await notificationService.notifyFeedbackCreated({
          feedbackId: feedback.id,
          feedbackTitle: feedback.title,
          feedbackDescription: feedback.description,
          category: feedback.category,
          priority: feedback.priority,
          submitterEmail: feedback.email || undefined,
          projectId: project.id,
        });

        // Slack notification
        await notificationService.notifySlack(project.workspaceId, {
          text: `🎯 New ${feedback.category} feedback received`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `🎯 New ${feedback.category}`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Title:*\n${feedback.title}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Priority:*\n${feedback.priority}`,
                },
                {
                  type: "mrkdwn",
                  text: `*From:*\n${feedback.email || "Anonymous"}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Project:*\n${project.name}`,
                },
              ],
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Description:*\n${feedback.description.substring(0, 200)}${feedback.description.length > 200 ? "..." : ""}`,
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
                  url: `${process.env.NEXTAUTH_URL}/dashboard/feedback/${feedback.id}`,
                },
              ],
            },
          ],
        });

        // Discord notification
        await notificationService.notifyDiscord(project.workspaceId, {
          title: `🎯 New ${feedback.category}`,
          description: feedback.description.substring(0, 200) + (feedback.description.length > 200 ? "..." : ""),
          color: feedback.priority === "URGENT" ? 0xff0000 : feedback.priority === "HIGH" ? 0xff6600 : feedback.priority === "MEDIUM" ? 0xffaa00 : 0x00ff00,
          fields: [
            {
              name: "Title",
              value: feedback.title,
              inline: true,
            },
            {
              name: "Priority",
              value: feedback.priority,
              inline: true,
            },
            {
              name: "From",
              value: feedback.email || "Anonymous",
              inline: true,
            },
            {
              name: "Project",
              value: project.name,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Feedback Guru",
          },
          url: `${process.env.NEXTAUTH_URL}/dashboard/feedback/${feedback.id}`,
        });

        // Custom webhooks
        await notificationService.triggerWebhooks(project.workspaceId, "feedback.created", {
          feedback: {
            id: feedback.id,
            title: feedback.title,
            description: feedback.description,
            category: feedback.category,
            priority: feedback.priority,
            status: feedback.status,
            email: feedback.email,
            name: feedback.name,
            url: feedback.url,
            createdAt: feedback.createdAt,
          },
          project: {
            id: project.id,
            name: project.name,
          },
        });
      } catch (error) {
        // Log error but don't fail the request
        console.error("Error sending feedback notifications:", error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        id: feedback.id,
        message: "Feedback submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting feedback:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET /api/feedback - List feedback for authenticated user
export async function GET(request: NextRequest) {
  try {
    // For now, return public endpoint error
    // In production, implement authentication and filtering
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { apiKey },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const feedback = await prisma.feedback.findMany({
      where: {
        projectId: project.id,
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
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
