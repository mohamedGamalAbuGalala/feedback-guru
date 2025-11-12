import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "./analytics-client";

export const metadata = {
  title: "Analytics | Feedback Guru",
  description: "View analytics and insights for your feedback",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user's workspaces
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      workspaceMembers: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!user || user.workspaceMembers.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Workspace Found</h2>
          <p className="mt-2 text-muted-foreground">
            You need to be a member of a workspace to view analytics.
          </p>
        </div>
      </div>
    );
  }

  // Use the first workspace (or implement workspace selector later)
  const workspace = user.workspaceMembers[0].workspace;

  return (
    <div className="container mx-auto py-6">
      <AnalyticsClient workspaceId={workspace.id} />
    </div>
  );
}
