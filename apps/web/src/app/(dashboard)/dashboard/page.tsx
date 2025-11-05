import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || "User"}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your feedback today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Feedback
            </CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New This Week
            </CardTitle>
            <span className="text-2xl">📥</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">
              Get your first feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Progress
            </CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">
              Start working on feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolved
            </CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">
              Keep up the good work
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Get Started</CardTitle>
            <CardDescription>
              Set up your first project and start collecting feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Next steps:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Create your first project</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Install the widget on your website</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Start receiving feedback</span>
                </li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard/projects">Create Project</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📚 Documentation</CardTitle>
            <CardDescription>
              Learn how to make the most of Feedback Guru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <Link
                href="/docs/installation"
                className="block p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">Installation Guide</span>
                <p className="text-gray-500 text-xs mt-1">
                  Add the widget to your website in 2 minutes
                </p>
              </Link>
              <Link
                href="/docs/customization"
                className="block p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">Customization</span>
                <p className="text-gray-500 text-xs mt-1">
                  Make the widget match your brand
                </p>
              </Link>
              <Link
                href="/docs/api"
                className="block p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">API Reference</span>
                <p className="text-gray-500 text-xs mt-1">
                  Integrate with your existing tools
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
