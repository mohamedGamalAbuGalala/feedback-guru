/**
 * Centralized Zod Validation Schemas
 *
 * This file contains all validation schemas used across the application.
 * Centralizing schemas ensures consistency and reusability.
 *
 * Usage:
 * import { feedbackSchema, commentSchema } from '@/lib/validation-schemas';
 */

import { z } from "zod";

// ============================================================================
// Common/Shared Schemas
// ============================================================================

/**
 * Common field schemas that are reused across multiple entities
 */
export const commonSchemas = {
  email: z.string().email("Invalid email address"),
  optionalEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  optionalName: z.string().max(255, "Name too long").optional().or(z.literal("")),
  url: z.string().url("Invalid URL"),
  optionalUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  apiKey: z.string().min(1, "API key is required"),
  id: z.string().cuid("Invalid ID format"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().min(1, "Description is required").max(500, "Description too long"),
  content: z.string().min(1, "Content cannot be empty"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
};

// ============================================================================
// Feedback Schemas
// ============================================================================

/**
 * Schema for creating feedback via API
 */
export const feedbackSchema = z.object({
  apiKey: commonSchemas.apiKey,
  category: z.enum(["BUG", "FEATURE_REQUEST", "QUESTION", "IMPROVEMENT", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  description: commonSchemas.description,
  email: commonSchemas.optionalEmail,
  name: commonSchemas.optionalName,
  url: commonSchemas.url,
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  userAgent: z.string().optional(),
  consoleLogs: z.any().optional(),
  networkLogs: z.any().optional(),
  screenshots: z.array(z.string()).optional(),
});

/**
 * Schema for updating feedback (internal)
 */
export const updateFeedbackSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "PLANNED", "IN_PROGRESS", "COMPLETED", "REJECTED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.enum(["BUG", "FEATURE_REQUEST", "QUESTION", "IMPROVEMENT", "OTHER"]).optional(),
  isPublic: z.boolean().optional(),
  assignedToId: z.string().optional().nullable(),
});

/**
 * Schema for voting on feedback
 */
export const voteSchema = z.object({
  value: z.number().int().min(-1).max(1), // -1 for downvote, 0 for remove vote, 1 for upvote
});

// ============================================================================
// Comment Schemas
// ============================================================================

/**
 * Schema for creating a comment
 */
export const commentSchema = z.object({
  content: commonSchemas.content,
  isInternal: z.boolean().optional(),
});

/**
 * Schema for updating a comment
 */
export const updateCommentSchema = z.object({
  content: commonSchemas.content.optional(),
  isInternal: z.boolean().optional(),
});

// ============================================================================
// Changelog Schemas
// ============================================================================

/**
 * Schema for creating a changelog entry
 */
export const changelogSchema = z.object({
  workspaceId: commonSchemas.id,
  title: commonSchemas.title,
  content: commonSchemas.content,
  version: z.string().max(50, "Version too long").optional(),
  type: z.enum(["FEATURE", "IMPROVEMENT", "BUG_FIX", "BREAKING_CHANGE"]).default("FEATURE"),
});

/**
 * Schema for updating a changelog entry
 */
export const updateChangelogSchema = z.object({
  title: commonSchemas.title.optional(),
  content: commonSchemas.content.optional(),
  version: z.string().max(50, "Version too long").optional().nullable(),
  type: z.enum(["FEATURE", "IMPROVEMENT", "BUG_FIX", "BREAKING_CHANGE"]).optional(),
});

/**
 * Schema for publishing/unpublishing a changelog entry
 */
export const publishChangelogSchema = z.object({
  isPublished: z.boolean(),
});

// ============================================================================
// Authentication Schemas
// ============================================================================

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  password: commonSchemas.password,
});

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for password reset request
 */
export const passwordResetRequestSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Schema for password reset
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: commonSchemas.password,
});

// ============================================================================
// Workspace Schemas
// ============================================================================

/**
 * Schema for creating a workspace
 */
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name too long"),
  slug: commonSchemas.slug,
});

/**
 * Schema for updating workspace settings
 */
export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name too long").optional(),
  slug: commonSchemas.slug.optional(),
});

// ============================================================================
// Project Schemas
// ============================================================================

/**
 * Schema for creating a project
 */
export const createProjectSchema = z.object({
  workspaceId: commonSchemas.id,
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  slug: commonSchemas.slug,
  description: commonSchemas.shortDescription.optional(),
  settings: z.any().optional(), // JSON object
});

/**
 * Schema for updating a project
 */
export const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long").optional(),
  slug: commonSchemas.slug.optional(),
  description: commonSchemas.shortDescription.optional(),
  settings: z.any().optional(), // JSON object
});

/**
 * Schema for project settings
 */
export const projectSettingsSchema = z.object({
  publicBoard: z.object({
    enabled: z.boolean(),
    allowVoting: z.boolean().optional(),
    allowComments: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
  }).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    slack: z.boolean().optional(),
    discord: z.boolean().optional(),
  }).optional(),
});

// ============================================================================
// Team/Member Schemas
// ============================================================================

/**
 * Schema for inviting a team member
 */
export const inviteTeamMemberSchema = z.object({
  workspaceId: commonSchemas.id,
  email: commonSchemas.email,
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

/**
 * Schema for updating team member role
 */
export const updateTeamMemberSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

/**
 * Schema for accepting/declining invitation
 */
export const invitationActionSchema = z.object({
  invitationId: commonSchemas.id,
});

// ============================================================================
// Integration Schemas
// ============================================================================

/**
 * Schema for Slack integration
 */
export const slackIntegrationSchema = z.object({
  workspaceId: commonSchemas.id,
  webhookUrl: z.string().url("Invalid webhook URL"),
  channel: z.string().optional(),
  events: z.array(z.enum(["feedback.created", "comment.created", "status.changed"])).optional(),
});

/**
 * Schema for Discord integration
 */
export const discordIntegrationSchema = z.object({
  workspaceId: commonSchemas.id,
  webhookUrl: z.string().url("Invalid webhook URL"),
  events: z.array(z.enum(["feedback.created", "comment.created", "status.changed"])).optional(),
});

/**
 * Schema for custom webhook
 */
export const customWebhookSchema = z.object({
  workspaceId: commonSchemas.id,
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  url: z.string().url("Invalid URL"),
  secret: z.string().optional(),
  events: z.array(z.enum(["feedback.created", "comment.created", "status.changed"])),
  enabled: z.boolean().default(true),
});

// ============================================================================
// Upload Schemas
// ============================================================================

/**
 * Schema for file upload
 */
export const uploadSchema = z.object({
  file: z.string(), // base64 encoded
  filename: z.string().min(1, "Filename is required").max(255, "Filename too long"),
  mimetype: z.string().min(1, "MIME type is required"),
  size: z.number().positive().max(10 * 1024 * 1024, "File too large (max 10MB)"),
});

// ============================================================================
// Pagination & Filtering Schemas
// ============================================================================

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Schema for feedback filtering
 */
export const feedbackFilterSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "PLANNED", "IN_PROGRESS", "COMPLETED", "REJECTED"]).optional(),
  category: z.enum(["BUG", "FEATURE_REQUEST", "QUESTION", "IMPROVEMENT", "OTHER"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Schema for search queries
 */
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200, "Query too long"),
  fields: z.array(z.string()).optional(),
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Helper function to validate and return typed data
 * Throws validation error if data is invalid
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Helper function to validate and return result object
 * Returns success/error result without throwing
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Helper to extract first error message from ZodError
 */
export function getFirstErrorMessage(error: z.ZodError): string {
  return error.errors[0]?.message || "Validation error";
}

/**
 * Helper to format all validation errors
 */
export function getAllErrorMessages(error: z.ZodError): string[] {
  return error.errors.map((err) => err.message);
}

/**
 * Helper to get field-specific errors
 */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (path) {
      fieldErrors[path] = err.message;
    }
  });
  return fieldErrors;
}
