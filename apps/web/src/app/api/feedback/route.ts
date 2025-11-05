import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

// Helper function to save screenshot (for now, save as base64 in DB, later move to S3)
async function saveScreenshot(base64Data: string, feedbackId: string) {
  // In production, upload to S3/R2 and return URL
  // For now, store base64 directly (not recommended for production)
  return base64Data;
}

// POST /api/feedback - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    // Verify API key and get project
    const project = await prisma.project.findUnique({
      where: { apiKey: data.apiKey },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Create title from description
    const title = generateTitle(data.description);

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
        screenshots: data.screenshots
          ? {
              create: data.screenshots.map((screenshot) => ({
                url: screenshot, // In production, this should be an S3 URL
              })),
            }
          : undefined,
      },
      include: {
        screenshots: true,
      },
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
