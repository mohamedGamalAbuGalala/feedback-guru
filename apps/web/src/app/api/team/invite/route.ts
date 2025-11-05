import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { emailService } from "@/lib/email";

const inviteSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, email, role } = inviteSchema.parse(body);

    // Get current user and workspace
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          where: { workspaceId },
          include: {
            workspace: true,
          },
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

    // Check if user has permission to invite
    if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to invite members" },
        { status: 403 }
      );
    }

    // Only OWNERs can invite other OWNERs
    if (role === "OWNER" && currentMember.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only workspace owners can invite other owners" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        workspaceId,
        email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId,
        email,
        role,
        invitedBy: currentUser.id,
        expiresAt,
      },
    });

    // Send invitation email
    const workspace = currentUser.workspaceMembers[0].workspace;
    const invitationUrl = `${process.env.NEXTAUTH_URL}/invite/${invitation.token}`;

    await emailService.sendInvitation(email, {
      inviterName: currentUser.name || currentUser.email,
      workspaceName: workspace.name,
      role,
      invitationUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error sending invitation:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
