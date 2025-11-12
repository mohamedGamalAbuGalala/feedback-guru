"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryChart } from "@/components/charts/category-chart";
import { StatusChart } from "@/components/charts/status-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { PriorityChart } from "@/components/charts/priority-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Users,
} from "lucide-react";

interface AnalyticsData {
  categoryDistribution: Array<{ category: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  feedbackTrends: Array<{ date: string; count: number }>;
  keyMetrics: {
    total: number;
    open: number;
    completed: number;
    rejected: number;
    completionRate: number;
    avgResponseTimeHours: number;
    recentFeedback: number;
    recentComments: number;
  };
  topContributors: Array<{ email: string; name: string; count: number }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

interface AnalyticsClientProps {
  workspaceId: string;
}

export default function AnalyticsClient({ workspaceId }: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<string>("30");

  useEffect(() => {
    fetchAnalytics();
  }, [workspaceId, days]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics?workspaceId=${workspaceId}&days=${days}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const categoryData = data.categoryDistribution.map((item) => ({
    name: item.category,
    value: item.count,
  }));

  const statusData = data.statusDistribution.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const priorityData = data.priorityDistribution.map((item) => ({
    name: item.priority,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Insights and trends for your feedback
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Feedback"
          value={data.keyMetrics.total}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          description="All time"
        />
        <MetricCard
          title="Open Feedback"
          value={data.keyMetrics.open}
          icon={<AlertCircle className="h-4 w-4 text-blue-600" />}
          description="Needs attention"
        />
        <MetricCard
          title="Completion Rate"
          value={`${data.keyMetrics.completionRate}%`}
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          description="Of all feedback"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${data.keyMetrics.avgResponseTimeHours}h`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="Time to first reply"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.keyMetrics.recentFeedback}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3" /> Last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.keyMetrics.recentComments}</div>
            <p className="text-xs text-muted-foreground">
              <MessageSquare className="inline h-3 w-3" /> Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
            <CardDescription>Distribution of feedback types</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <CategoryChart data={categoryData} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback by Priority</CardTitle>
            <CardDescription>Priority level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <PriorityChart data={priorityData} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No priority data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>
            Feedback submissions over the last {days} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.feedbackTrends.length > 0 ? (
            <TrendChart data={data.feedbackTrends} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback by Status</CardTitle>
          <CardDescription>Current status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <StatusChart data={statusData} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No status data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Most active feedback submitters</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topContributors.length > 0 ? (
            <div className="space-y-4">
              {data.topContributors.map((contributor, index) => (
                <div
                  key={contributor.email}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{contributor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {contributor.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{contributor.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No contributor data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="mt-2 h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px]" />
              <Skeleton className="mt-1 h-3 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="mt-2 h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="mt-2 h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
