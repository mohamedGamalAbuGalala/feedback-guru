import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicBoardClient from "./board-client";

interface PageProps {
  params: { slug: string };
}

async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findFirst({
    where: {
      slug: slug,
    },
    include: {
      workspace: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  // Check if public board is enabled
  const settings = project.settings as any;
  if (!settings?.publicBoard?.enabled) {
    return null;
  }

  return project;
}

async function getPublicFeedback(projectId: string) {
  const feedback = await prisma.feedback.findMany({
    where: {
      projectId: projectId,
      isPublic: true,
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: [
      { votes: "desc" },
      { createdAt: "desc" },
    ],
  });

  return feedback;
}

export default async function PublicBoardPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const feedback = await getPublicFeedback(project.id);

  return (
    <PublicBoardClient
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        workspaceName: project.workspace.name,
        settings: project.settings as any,
      }}
      initialFeedback={feedback}
    />
  );
}
