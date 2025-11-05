import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InvitationClient } from "./invitation-client";

export default async function InvitationPage({
  params,
}: {
  params: { token: string };
}) {
  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // If invitation doesn't exist or is not pending, show error
  if (!invitation || invitation.status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation is no longer valid. It may have expired or already been used.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check if invitation has expired
  if (new Date(invitation.expiresAt) < new Date()) {
    // Update status to expired
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please contact the workspace owner to send you a new
            invitation.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <InvitationClient invitation={invitation} />;
}
