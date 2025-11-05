import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const declineSchema = z.object({
  token: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = declineSchema.parse(body);

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

    // Update invitation status to declined
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation declined",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    console.error("Error declining invitation:", error);
    return NextResponse.json({ error: "Failed to decline invitation" }, { status: 500 });
  }
}
