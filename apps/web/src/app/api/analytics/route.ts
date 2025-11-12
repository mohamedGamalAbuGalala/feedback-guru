import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";

/**
 * GET /api/analytics
 * Get analytics data for a workspace
 *
 * Query params:
 * - workspaceId: string (required)
 * - days: number (optional, default: 30) - Days to look back for trends
 *
 * Returns:
 * - categoryDistribution: Feedback count by category
 * - statusDistribution: Feedback count by status
 * - priorityDistribution: Feedback count by priority
 * - feedbackTrends: Daily feedback counts over time
 * - keyMetrics: Total, open, completion rate, etc.
 * - topContributors: Most active feedback submitters
 *
 * Requires: Workspace membership
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Verify workspace membership
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

    // Get workspace projects to filter feedback
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    // 1. Category Distribution
    const categoryDistribution = await prisma.feedback.groupBy({
      by: ["category"],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    const categoryData = categoryDistribution.map((item) => ({
      category: item.category,
      count: item._count,
    }));

    // 2. Status Distribution
    const statusDistribution = await prisma.feedback.groupBy({
      by: ["status"],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    const statusData = statusDistribution.map((item) => ({
      status: item.status,
      count: item._count,
    }));

    // 3. Priority Distribution
    const priorityDistribution = await prisma.feedback.groupBy({
      by: ["priority"],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    const priorityData = priorityDistribution.map((item) => ({
      priority: item.priority,
      count: item._count,
    }));

    // 4. Feedback Trends (last N days)
    const startDate = startOfDay(subDays(new Date(), days));

    const feedback = await prisma.feedback.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by day
    const trendMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i - 1), "yyyy-MM-dd");
      trendMap.set(date, 0);
    }

    feedback.forEach((item) => {
      const date = format(new Date(item.createdAt), "yyyy-MM-dd");
      if (trendMap.has(date)) {
        trendMap.set(date, (trendMap.get(date) || 0) + 1);
      }
    });

    const trendsData = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // 5. Key Metrics
    const totalFeedback = await prisma.feedback.count({
      where: { projectId: { in: projectIds } },
    });

    const openFeedback = await prisma.feedback.count({
      where: {
        projectId: { in: projectIds },
        status: { in: ["NEW", "REVIEWING", "PLANNED", "IN_PROGRESS"] },
      },
    });

    const completedFeedback = await prisma.feedback.count({
      where: {
        projectId: { in: projectIds },
        status: "COMPLETED",
      },
    });

    const rejectedFeedback = await prisma.feedback.count({
      where: {
        projectId: { in: projectIds },
        status: "REJECTED",
      },
    });

    const completionRate =
      totalFeedback > 0
        ? ((completedFeedback / totalFeedback) * 100).toFixed(1)
        : "0.0";

    // Calculate average response time (time to first comment)
    const feedbackWithComments = await prisma.feedback.findMany({
      where: {
        projectId: { in: projectIds },
        comments: {
          some: {},
        },
      },
      include: {
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
      take: 100, // Sample for performance
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    feedbackWithComments.forEach((item) => {
      if (item.comments.length > 0) {
        const responseTime =
          new Date(item.comments[0].createdAt).getTime() -
          new Date(item.createdAt).getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    });

    const avgResponseTimeMs =
      responseCount > 0 ? totalResponseTime / responseCount : 0;
    const avgResponseTimeHours = (avgResponseTimeMs / (1000 * 60 * 60)).toFixed(
      1
    );

    // 6. Top Contributors (by feedback submitted)
    const topContributors = await prisma.feedback.groupBy({
      by: ["email", "name"],
      where: {
        projectId: { in: projectIds },
        email: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          email: "desc",
        },
      },
      take: 10,
    });

    const contributorsData = topContributors.map((item) => ({
      email: item.email,
      name: item.name || item.email || "Anonymous",
      count: item._count,
    }));

    // 7. Recent Activity (last 7 days)
    const recentDate = startOfDay(subDays(new Date(), 7));
    const recentFeedbackCount = await prisma.feedback.count({
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: recentDate },
      },
    });

    const recentCommentsCount = await prisma.comment.count({
      where: {
        feedback: {
          projectId: { in: projectIds },
        },
        createdAt: { gte: recentDate },
      },
    });

    // Return analytics data
    return NextResponse.json({
      categoryDistribution: categoryData,
      statusDistribution: statusData,
      priorityDistribution: priorityData,
      feedbackTrends: trendsData,
      keyMetrics: {
        total: totalFeedback,
        open: openFeedback,
        completed: completedFeedback,
        rejected: rejectedFeedback,
        completionRate: parseFloat(completionRate),
        avgResponseTimeHours: parseFloat(avgResponseTimeHours),
        recentFeedback: recentFeedbackCount,
        recentComments: recentCommentsCount,
      },
      topContributors: contributorsData,
      period: {
        days,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
