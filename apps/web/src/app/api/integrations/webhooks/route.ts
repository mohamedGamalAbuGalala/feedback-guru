import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const webhookSchema = z.object({
  workspaceId: z.string(),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

/**
 * GET /api/integrations/webhooks
 * List all webhooks for a workspace
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

    // Fetch all webhooks for the workspace
    const webhooks = await prisma.webhook.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        secret: true, // Frontend needs this to show users for webhook verification
        lastTriggeredAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, url, events } = webhookSchema.parse(body);

    // Get current user
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

    const currentMember = currentUser.workspaceMembers[0];

    // Check if user has permission to manage integrations
    if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to manage webhooks" },
        { status: 403 }
      );
    }

    // Generate a secret for webhook signature verification
    const secret = crypto.randomBytes(32).toString("hex");

    // Create webhook
    const webhook = await prisma.webhook.create({
      data: {
        workspaceId,
        url,
        events,
        secret,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook created successfully",
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error creating webhook:", error);
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}
