import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { token } = acceptSchema.parse(body);

    // Get the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if invitation is still pending
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check if the user's email matches the invitation
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    });

    if (existingMember) {
      // Update invitation status and return success (user is already a member)
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      return NextResponse.json({
        success: true,
        message: "You are already a member of this workspace",
      });
    }

    // Add user to workspace and update invitation status
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: user.id,
          role: invitation.role,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error accepting invitation:", error);
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
