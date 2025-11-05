import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RoadmapPublicClient } from "./roadmap-public-client";

async function getWorkspaceBySlug(slug: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!workspace) {
    return null;
  }

  // Get roadmap items (excluding cancelled items for public view)
  const roadmapItems = await prisma.roadmapItem.findMany({
    where: {
      workspaceId: workspace.id,
      status: {
        not: "CANCELLED",
      },
    },
    orderBy: [
      { status: "asc" },
      { votes: "desc" },
      { createdAt: "desc" },
    ],
  });

  return {
    workspace,
    roadmapItems,
  };
}

export default async function PublicRoadmapPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getWorkspaceBySlug(params.slug);

  if (!data) {
    notFound();
  }

  return <RoadmapPublicClient workspace={data.workspace} roadmapItems={data.roadmapItems} />;
}
