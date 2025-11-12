import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicChangelogClient from "./changelog-client";

interface PageProps {
  params: { slug: string };
}

async function getWorkspaceBySlug(slug: string) {
  const workspace = await prisma.workspace.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return workspace;
}

export default async function PublicChangelogPage({ params }: PageProps) {
  const workspace = await getWorkspaceBySlug(params.slug);

  if (!workspace) {
    notFound();
  }

  return (
    <PublicChangelogClient
      workspace={{
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      }}
    />
  );
}
