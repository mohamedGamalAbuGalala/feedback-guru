import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive } = toggleSchema.parse(body);

    // Get the integration
    const integration = await prisma.integration.findUnique({
      where: { id: params.id },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                user: {
                  email: session.user.email,
                },
              },
            },
          },
        },
      },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // Check if user has permission
    if (integration.workspace.members.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const currentMember = integration.workspace.members[0];

    if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to toggle integrations" },
        { status: 403 }
      );
    }

    // Update the integration
    await prisma.integration.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      message: `Integration ${isActive ? "enabled" : "disabled"} successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error toggling integration:", error);
    return NextResponse.json({ error: "Failed to toggle integration" }, { status: 500 });
  }
}
