import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateRoadmapItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  quarter: z.string().nullable().optional(),
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
    const data = updateRoadmapItemSchema.parse(body);

    // Get the roadmap item
    const roadmapItem = await prisma.roadmapItem.findUnique({
      where: { id: params.id },
    });

    if (!roadmapItem) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    // Get current user's workspace membership
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          where: { workspaceId: roadmapItem.workspaceId },
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

    if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to update the roadmap" },
        { status: 403 }
      );
    }

    // Update the roadmap item
    const updatedRoadmapItem = await prisma.roadmapItem.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.quarter !== undefined && { quarter: data.quarter }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Roadmap item updated successfully",
      roadmapItem: updatedRoadmapItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error updating roadmap item:", error);
    return NextResponse.json({ error: "Failed to update roadmap item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the roadmap item
    const roadmapItem = await prisma.roadmapItem.findUnique({
      where: { id: params.id },
    });

    if (!roadmapItem) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    // Get current user's workspace membership
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaceMembers: {
          where: { workspaceId: roadmapItem.workspaceId },
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

    if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to delete roadmap items" },
        { status: 403 }
      );
    }

    // Delete the roadmap item
    await prisma.roadmapItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Roadmap item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting roadmap item:", error);
    return NextResponse.json({ error: "Failed to delete roadmap item" }, { status: 500 });
  }
}
