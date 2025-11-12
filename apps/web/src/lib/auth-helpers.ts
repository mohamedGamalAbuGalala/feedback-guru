/**
 * Authorization Helper Functions
 *
 * This module provides reusable authorization functions for API routes.
 * Ensures consistent authorization checks across the application.
 *
 * Usage:
 * import { requireAuth, requireWorkspaceMember, requireAdmin } from '@/lib/auth-helpers';
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

/**
 * Authorization error responses
 */
export const AuthErrors = {
  UNAUTHORIZED: { error: "Unauthorized - Authentication required" },
  FORBIDDEN: { error: "Forbidden - Insufficient permissions" },
  NOT_FOUND: { error: "Resource not found" },
  WORKSPACE_NOT_MEMBER: { error: "You are not a member of this workspace" },
  WORKSPACE_NOT_ADMIN: { error: "Only workspace owners and admins can perform this action" },
  WORKSPACE_NOT_OWNER: { error: "Only workspace owners can perform this action" },
} as const;

/**
 * Get current session or return error response
 *
 * @returns Session object or null, and optional error response
 *
 * @example
 * const { session, error } = await requireAuth();
 * if (error) return error;
 */
export async function requireAuth(): Promise<{
  session: Session | null;
  error: NextResponse | null;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      session: null,
      error: NextResponse.json(AuthErrors.UNAUTHORIZED, { status: 401 }),
    };
  }

  return { session, error: null };
}

/**
 * Get current user from session
 *
 * @param session - NextAuth session
 * @returns User object with workspace memberships
 */
export async function getCurrentUser(session: Session) {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      workspaceMembers: {
        include: {
          workspace: true,
        },
      },
    },
  });

  return user;
}

/**
 * Require workspace membership for the current user
 *
 * @param session - NextAuth session
 * @param workspaceId - Workspace ID to check membership
 * @returns User and member object, or error response
 *
 * @example
 * const { member, error } = await requireWorkspaceMember(session, workspaceId);
 * if (error) return error;
 */
export async function requireWorkspaceMember(
  session: Session,
  workspaceId: string
): Promise<{
  user: any;
  member: any;
  error: NextResponse | null;
}> {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      workspaceMembers: {
        where: { workspaceId },
      },
    },
  });

  if (!user || user.workspaceMembers.length === 0) {
    return {
      user: null,
      member: null,
      error: NextResponse.json(AuthErrors.WORKSPACE_NOT_MEMBER, { status: 403 }),
    };
  }

  return {
    user,
    member: user.workspaceMembers[0],
    error: null,
  };
}

/**
 * Require workspace admin role (OWNER or ADMIN)
 *
 * @param session - NextAuth session
 * @param workspaceId - Workspace ID to check admin access
 * @returns User and member object, or error response
 *
 * @example
 * const { member, error } = await requireWorkspaceAdmin(session, workspaceId);
 * if (error) return error;
 */
export async function requireWorkspaceAdmin(
  session: Session,
  workspaceId: string
): Promise<{
  user: any;
  member: any;
  error: NextResponse | null;
}> {
  const { user, member, error } = await requireWorkspaceMember(session, workspaceId);

  if (error) return { user: null, member: null, error };

  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    return {
      user: null,
      member: null,
      error: NextResponse.json(AuthErrors.WORKSPACE_NOT_ADMIN, { status: 403 }),
    };
  }

  return { user, member, error: null };
}

/**
 * Require workspace owner role (OWNER only)
 *
 * @param session - NextAuth session
 * @param workspaceId - Workspace ID to check owner access
 * @returns User and member object, or error response
 *
 * @example
 * const { member, error } = await requireWorkspaceOwner(session, workspaceId);
 * if (error) return error;
 */
export async function requireWorkspaceOwner(
  session: Session,
  workspaceId: string
): Promise<{
  user: any;
  member: any;
  error: NextResponse | null;
}> {
  const { user, member, error } = await requireWorkspaceMember(session, workspaceId);

  if (error) return { user: null, member: null, error };

  if (member.role !== "OWNER") {
    return {
      user: null,
      member: null,
      error: NextResponse.json(AuthErrors.WORKSPACE_NOT_OWNER, { status: 403 }),
    };
  }

  return { user, member, error: null };
}

/**
 * Check if user has access to feedback item via workspace membership
 *
 * @param session - NextAuth session
 * @param feedbackId - Feedback ID
 * @returns Feedback object with workspace info, or error response
 *
 * @example
 * const { feedback, error } = await requireFeedbackAccess(session, feedbackId);
 * if (error) return error;
 */
export async function requireFeedbackAccess(
  session: Session,
  feedbackId: string
): Promise<{
  feedback: any;
  error: NextResponse | null;
}> {
  const user = await getCurrentUser(session);

  if (!user) {
    return {
      feedback: null,
      error: NextResponse.json(AuthErrors.UNAUTHORIZED, { status: 401 }),
    };
  }

  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      project: {
        workspace: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
    include: {
      project: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!feedback) {
    return {
      feedback: null,
      error: NextResponse.json(AuthErrors.NOT_FOUND, { status: 404 }),
    };
  }

  return { feedback, error: null };
}

/**
 * Check if user has admin access to feedback item's workspace
 *
 * @param session - NextAuth session
 * @param feedbackId - Feedback ID
 * @returns Feedback object with workspace info and member, or error response
 */
export async function requireFeedbackAdmin(
  session: Session,
  feedbackId: string
): Promise<{
  feedback: any;
  member: any;
  error: NextResponse | null;
}> {
  const { feedback, error: feedbackError } = await requireFeedbackAccess(
    session,
    feedbackId
  );

  if (feedbackError) {
    return { feedback: null, member: null, error: feedbackError };
  }

  const { member, error: memberError } = await requireWorkspaceAdmin(
    session,
    feedback.project.workspaceId
  );

  if (memberError) {
    return { feedback: null, member: null, error: memberError };
  }

  return { feedback, member, error: null };
}

/**
 * Check if user has access to project via workspace membership
 *
 * @param session - NextAuth session
 * @param projectId - Project ID
 * @returns Project object with workspace info, or error response
 */
export async function requireProjectAccess(
  session: Session,
  projectId: string
): Promise<{
  project: any;
  error: NextResponse | null;
}> {
  const user = await getCurrentUser(session);

  if (!user) {
    return {
      project: null,
      error: NextResponse.json(AuthErrors.UNAUTHORIZED, { status: 401 }),
    };
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!project) {
    return {
      project: null,
      error: NextResponse.json(AuthErrors.NOT_FOUND, { status: 404 }),
    };
  }

  return { project, error: null };
}

/**
 * Check if user has admin access to project's workspace
 *
 * @param session - NextAuth session
 * @param projectId - Project ID
 * @returns Project object and member info, or error response
 */
export async function requireProjectAdmin(
  session: Session,
  projectId: string
): Promise<{
  project: any;
  member: any;
  error: NextResponse | null;
}> {
  const { project, error: projectError } = await requireProjectAccess(
    session,
    projectId
  );

  if (projectError) {
    return { project: null, member: null, error: projectError };
  }

  const { member, error: memberError } = await requireWorkspaceAdmin(
    session,
    project.workspaceId
  );

  if (memberError) {
    return { project: null, member: null, error: memberError };
  }

  return { project, member, error: null };
}

/**
 * Verify API key and get project
 *
 * @param apiKey - API key to verify
 * @returns Project object with workspace, or error response
 *
 * @example
 * const { project, error } = await verifyApiKey(apiKey);
 * if (error) return error;
 */
export async function verifyApiKey(apiKey: string): Promise<{
  project: any;
  error: NextResponse | null;
}> {
  const project = await prisma.project.findUnique({
    where: { apiKey },
    include: {
      workspace: true,
    },
  });

  if (!project) {
    return {
      project: null,
      error: NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      ),
    };
  }

  return { project, error: null };
}

/**
 * Check if user owns a resource (generic)
 *
 * @param userId - User ID to check
 * @param resourceUserId - Resource owner's user ID
 * @returns true if user owns resource
 */
export function isResourceOwner(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * Higher-order function to wrap API routes with authorization
 *
 * @param handler - API route handler
 * @param authCheck - Authorization check function
 * @returns Wrapped handler with authorization
 *
 * @example
 * export const GET = withAuth(handler, requireWorkspaceMember);
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  authCheck?: (session: Session, ...args: T) => Promise<{ error: NextResponse | null }>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Check authentication
    const { session, error: authError } = await requireAuth();
    if (authError) return authError;

    // Optional additional authorization check
    if (authCheck) {
      const { error: checkError } = await authCheck(session!, ...args);
      if (checkError) return checkError;
    }

    // Call original handler
    return handler(request, ...args);
  };
}

/**
 * Extract workspace ID from request body or query params
 *
 * @param request - NextRequest
 * @returns Workspace ID or null
 */
export async function getWorkspaceIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  // Try query params first
  const { searchParams } = new URL(request.url);
  const queryWorkspaceId = searchParams.get("workspaceId");
  if (queryWorkspaceId) return queryWorkspaceId;

  // Try request body
  try {
    const body = await request.json();
    return body.workspaceId || null;
  } catch {
    return null;
  }
}

/**
 * Rate limit check helper
 * (Should be used in conjunction with existing rate limiter)
 */
export function shouldRateLimit(
  request: NextRequest,
  endpoint: string
): boolean {
  // This is a placeholder - actual implementation would use Redis or in-memory store
  // The existing rate-limiter.ts handles this
  return false;
}
