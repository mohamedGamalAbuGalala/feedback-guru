import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeamMembersClient } from "./team-client";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user's workspaces and their members
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      workspaceMembers: {
        include: {
          workspace: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "asc",
                },
              },
              invitations: {
                where: {
                  status: "PENDING",
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.workspaceMembers.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Team Members</h1>
        <p className="text-gray-600">No workspace found. Please create a workspace first.</p>
      </div>
    );
  }

  // Get the first workspace (or could make it selectable)
  const workspaceMember = user.workspaceMembers[0];
  const workspace = workspaceMember.workspace;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Members</h1>
        <p className="text-gray-600">
          Manage your team members and invite new collaborators to {workspace.name}
        </p>
      </div>

      <TeamMembersClient
        workspace={workspace}
        currentUserRole={workspaceMember.role}
        currentUserId={user.id}
      />
    </div>
  );
}
