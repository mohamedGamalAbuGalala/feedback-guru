import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIp || "unknown";
}

// POST /api/public/feedback/[id]/vote - Add vote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feedbackId = params.id;
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // Check if feedback exists and is public
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        isPublic: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Check if already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        feedbackId: feedbackId,
        ipAddress: ipAddress,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "Already voted" },
        { status: 400 }
      );
    }

    // Create vote and increment count
    await prisma.$transaction([
      prisma.vote.create({
        data: {
          feedbackId: feedbackId,
          ipAddress: ipAddress,
          userAgent: userAgent,
        },
      }),
      prisma.feedback.update({
        where: { id: feedbackId },
        data: { votes: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding vote:", error);
    return NextResponse.json(
      { error: "Failed to add vote" },
      { status: 500 }
    );
  }
}

// DELETE /api/public/feedback/[id]/vote - Remove vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feedbackId = params.id;
    const ipAddress = getClientIp(request);

    // Find existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        feedbackId: feedbackId,
        ipAddress: ipAddress,
      },
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: "Vote not found" },
        { status: 404 }
      );
    }

    // Delete vote and decrement count
    await prisma.$transaction([
      prisma.vote.delete({
        where: { id: existingVote.id },
      }),
      prisma.feedback.update({
        where: { id: feedbackId },
        data: { votes: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    );
  }
}
