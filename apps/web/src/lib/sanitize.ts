/**
 * XSS Sanitization Utilities
 *
 * This module provides sanitization functions to prevent Cross-Site Scripting (XSS) attacks.
 * It uses:
 * - DOMPurify for HTML sanitization (works on both client and server)
 * - validator for string sanitization and validation
 *
 * Usage:
 * - Server-side: Use sanitizeInput() for plain text, sanitizeHtml() for rich text
 * - Client-side: Use sanitizeHtml() before rendering user content with dangerouslySetInnerHTML
 */

import DOMPurify from "isomorphic-dompurify";
import validator from "validator";

/**
 * Configuration for allowed HTML tags and attributes
 * This whitelist approach is more secure than blacklisting
 */
const ALLOWED_TAGS = [
  // Text formatting
  "p",
  "br",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  // Headings
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // Lists
  "ul",
  "ol",
  "li",
  // Links
  "a",
  // Code
  "code",
  "pre",
  // Blockquote
  "blockquote",
  // Tables (for structured feedback)
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "class",
  "id",
  "title",
  "alt",
  "style",
];

/**
 * Sanitize HTML content using DOMPurify
 * Use this for user-generated content that may contain HTML
 *
 * @param html - The HTML string to sanitize
 * @param allowedTags - Optional custom list of allowed tags
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * const safeHtml = sanitizeHtml(userInput);
 * <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
 */
export function sanitizeHtml(
  html: string,
  allowedTags: string[] = ALLOWED_TAGS
): string {
  if (!html) return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false, // Prevent data-* attributes
    ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow http/https/mailto
    SAFE_FOR_TEMPLATES: true, // Escape template strings
    RETURN_DOM: false, // Return string, not DOM
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
}

/**
 * Sanitize plain text input (strips all HTML)
 * Use this for input fields that should contain only text
 *
 * @param input - The input string to sanitize
 * @returns Sanitized plain text string
 *
 * @example
 * const safeName = sanitizeInput(userInput.name);
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Strip all HTML tags
  let sanitized = validator.stripLow(input, true); // Remove control characters
  sanitized = validator.escape(sanitized); // Escape HTML entities
  sanitized = validator.trim(sanitized); // Trim whitespace

  return sanitized;
}

/**
 * Sanitize email address
 *
 * @param email - The email to sanitize
 * @returns Normalized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  const trimmed = validator.trim(email.toLowerCase());
  return validator.isEmail(trimmed) ? validator.normalizeEmail(trimmed) || trimmed : "";
}

/**
 * Sanitize URL
 *
 * @param url - The URL to sanitize
 * @param allowedProtocols - Allowed URL protocols (default: http, https)
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ["http", "https"]
): string {
  if (!url) return "";

  const trimmed = validator.trim(url);

  // Check if URL is valid
  if (!validator.isURL(trimmed, { protocols: allowedProtocols })) {
    return "";
  }

  // Additional check: ensure no javascript: protocol
  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return "";
  }

  return trimmed;
}

/**
 * Sanitize feedback content
 * Allows basic formatting but removes dangerous HTML
 *
 * @param content - Feedback content to sanitize
 * @returns Sanitized feedback content
 */
export function sanitizeFeedback(content: string): string {
  return sanitizeHtml(content, [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "code",
    "pre",
    "ul",
    "ol",
    "li",
    "blockquote",
  ]);
}

/**
 * Sanitize comment content
 * Similar to feedback but more restricted
 *
 * @param content - Comment content to sanitize
 * @returns Sanitized comment content
 */
export function sanitizeComment(content: string): string {
  return sanitizeHtml(content, ["p", "br", "strong", "em", "code", "a"]);
}

/**
 * Sanitize changelog content
 * Allows more formatting for product updates
 *
 * @param content - Changelog content to sanitize
 * @returns Sanitized changelog content
 */
export function sanitizeChangelog(content: string): string {
  return sanitizeHtml(content, ALLOWED_TAGS); // Allow all tags
}

/**
 * Sanitize search query
 * Removes special characters that could be used for injection
 *
 * @param query - Search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";

  let sanitized = validator.trim(query);
  // Escape special regex characters
  sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return sanitized;
}

/**
 * Sanitize filename
 * Removes path traversal characters and dangerous filenames
 *
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "";

  let sanitized = validator.trim(filename);

  // Remove path traversal
  sanitized = sanitized.replace(/\.\./g, "");
  sanitized = sanitized.replace(/[\/\\]/g, "");

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, "");

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split(".").pop();
    const name = sanitized.substring(0, 255 - (ext?.length || 0) - 1);
    sanitized = ext ? `${name}.${ext}` : name;
  }

  return sanitized;
}

/**
 * Validate and sanitize object keys
 * Prevents prototype pollution attacks
 *
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const key in obj) {
    // Skip prototype properties
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Skip dangerous keys
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }

    const value = obj[key];

    // Recursively sanitize nested objects
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    }
    // Sanitize arrays
    else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" && item !== null ? sanitizeObject(item) : item
      );
    }
    // Keep primitives as-is
    else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Create a safe string for use in RegExp
 * Escapes all special regex characters
 *
 * @param str - String to escape
 * @returns Escaped string safe for RegExp
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sanitize JSON input
 * Safely parse JSON and sanitize object keys
 *
 * @param json - JSON string to parse and sanitize
 * @returns Sanitized parsed object or null if invalid
 */
export function sanitizeJson<T = any>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);
    return sanitizeObject(parsed);
  } catch {
    return null;
  }
}

/**
 * Check if string contains potential XSS patterns
 * This is a defensive check, not a replacement for sanitization
 *
 * @param input - Input to check
 * @returns true if suspicious patterns detected
 */
export function containsXssPatterns(input: string): boolean {
  if (!input) return false;

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitization middleware helper
 * Sanitizes all string fields in request body
 *
 * @param body - Request body object
 * @param htmlFields - Fields that should allow HTML (will use sanitizeHtml)
 * @returns Sanitized body
 */
export function sanitizeRequestBody<T extends Record<string, any>>(
  body: T,
  htmlFields: string[] = []
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      // Use HTML sanitization for specified fields
      if (htmlFields.includes(key)) {
        sanitized[key] = sanitizeHtml(value);
      }
      // Plain text sanitization for others
      else {
        sanitized[key] = sanitizeInput(value);
      }
    }
    // Recursively sanitize nested objects
    else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    }
    // Keep other types as-is
    else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
