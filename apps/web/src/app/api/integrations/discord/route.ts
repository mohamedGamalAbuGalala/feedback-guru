import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const discordSchema = z.object({
  workspaceId: z.string(),
  webhookUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, webhookUrl } = discordSchema.parse(body);

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
        { error: "You do not have permission to manage integrations" },
        { status: 403 }
      );
    }

    // Test the webhook by sending a test message
    try {
      const testEmbed = {
        content: "Feedback Guru integration successfully connected!",
        embeds: [
          {
            title: "🎉 Discord Integration Active",
            description: "You will now receive feedback notifications in this channel.",
            color: 0x5865f2, // Discord blue
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const testResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testEmbed),
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          { error: "Failed to send test message to Discord. Please check your webhook URL." },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to connect to Discord. Please check your webhook URL." },
        { status: 400 }
      );
    }

    // Check if Discord integration already exists
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId,
        type: "DISCORD",
      },
    });

    if (existingIntegration) {
      // Update existing integration
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          config: {
            webhookUrl,
          },
          isActive: true,
        },
      });
    } else {
      // Create new integration
      await prisma.integration.create({
        data: {
          workspaceId,
          type: "DISCORD",
          name: "Discord",
          config: {
            webhookUrl,
          },
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Discord integration connected successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error connecting Discord:", error);
    return NextResponse.json({ error: "Failed to connect Discord" }, { status: 500 });
  }
}
