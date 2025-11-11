/**
 * Pagination Utility
 * Provides consistent pagination across all API endpoints
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parse and validate pagination parameters
 * @param params Raw pagination params from query string
 * @returns Validated pagination params with defaults
 */
export function parsePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
} {
  // Parse page (default: 1, min: 1)
  let page = params.page ? parseInt(String(params.page)) : 1;
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Parse limit (default: 20, min: 1, max: 100)
  let limit = params.limit ? parseInt(String(params.limit)) : 20;
  if (isNaN(limit) || limit < 1) {
    limit = 20;
  }
  if (limit > 100) {
    limit = 100; // Prevent abuse
  }

  // Calculate skip for database query
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated response
 * @param items Array of items for current page
 * @param total Total count of all items
 * @param page Current page number
 * @param limit Items per page
 * @returns Formatted paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

/**
 * Get pagination metadata from query params
 * Useful for extracting pagination from NextRequest
 */
export function getPaginationFromSearchParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  return parsePaginationParams({
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
}

/**
 * Build pagination links (for HATEOAS-style APIs)
 * @param baseUrl Base URL for the endpoint
 * @param page Current page
 * @param totalPages Total pages
 * @param limit Items per page
 * @returns Object with next/prev URLs
 */
export function buildPaginationLinks(
  baseUrl: string,
  page: number,
  totalPages: number,
  limit: number
): {
  self: string;
  first: string;
  last: string;
  next?: string;
  prev?: string;
} {
  const buildUrl = (p: number) => {
    const url = new URL(baseUrl);
    url.searchParams.set("page", p.toString());
    url.searchParams.set("limit", limit.toString());
    return url.toString();
  };

  return {
    self: buildUrl(page),
    first: buildUrl(1),
    last: buildUrl(totalPages),
    ...(page < totalPages && { next: buildUrl(page + 1) }),
    ...(page > 1 && { prev: buildUrl(page - 1) }),
  };
}
