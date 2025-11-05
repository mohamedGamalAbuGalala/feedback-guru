import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IntegrationsClient } from "./integrations-client";

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user's workspaces and their integrations
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
        <h1 className="text-2xl font-bold mb-4">Integrations</h1>
        <p className="text-gray-600">No workspace found. Please create a workspace first.</p>
      </div>
    );
  }

  // Get the first workspace
  const workspaceMember = user.workspaceMembers[0];
  const workspace = workspaceMember.workspace;

  // Get integrations for this workspace
  const integrations = await prisma.integration.findMany({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get webhooks for this workspace
  const webhooks = await prisma.webhook.findMany({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect Feedback Guru with your favorite tools and services
        </p>
      </div>

      <IntegrationsClient
        workspace={workspace}
        currentUserRole={workspaceMember.role}
        integrations={integrations}
        webhooks={webhooks}
      />
    </div>
  );
}
