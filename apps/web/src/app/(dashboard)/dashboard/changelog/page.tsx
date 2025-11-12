import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChangelogClient from "./changelog-client";

export default async function ChangelogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user's workspace
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
    redirect("/dashboard");
  }

  const workspace = user.workspaceMembers[0].workspace;
  const userRole = user.workspaceMembers[0].role;

  return (
    <ChangelogClient
      workspace={{
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      }}
      userRole={userRole}
    />
  );
}
