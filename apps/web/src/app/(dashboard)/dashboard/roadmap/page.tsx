import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RoadmapClient } from "./roadmap-client";

export default async function RoadmapPage() {
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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Roadmap</h1>
        <p className="text-gray-600">No workspace found. Please create a workspace first.</p>
      </div>
    );
  }

  // Get the first workspace
  const workspaceMember = user.workspaceMembers[0];
  const workspace = workspaceMember.workspace;

  // Get roadmap items for this workspace
  const roadmapItems = await prisma.roadmapItem.findMany({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: [
      { status: "asc" },
      { votes: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Roadmap</h1>
        <p className="text-gray-600">
          Plan and share your product development timeline with your team and users
        </p>
      </div>

      <RoadmapClient
        workspace={workspace}
        currentUserRole={workspaceMember.role}
        roadmapItems={roadmapItems}
      />
    </div>
  );
}
