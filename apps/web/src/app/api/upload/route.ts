import { NextRequest, NextResponse } from "next/server";
import { storageService } from "@/lib/storage";
import { z } from "zod";

const uploadSchema = z.object({
  file: z.string(), // Base64 encoded file
  contentType: z.string().optional(),
  filename: z.string().optional(),
});

/**
 * POST /api/upload
 * Upload a file to S3/R2 storage
 *
 * Body:
 * - file: Base64 encoded file (with or without data URI prefix)
 * - contentType: MIME type (optional, defaults to image/png)
 * - filename: Custom filename (optional, auto-generated if not provided)
 *
 * Returns:
 * - url: Public URL of uploaded file
 *
 * Note: This endpoint is public but rate limiting should be added in production
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file, contentType, filename } = uploadSchema.parse(body);

    // Check if storage is configured
    if (!storageService.isEnabled()) {
      return NextResponse.json(
        {
          error: "File storage is not configured. Please configure S3 or R2 storage.",
          hint: "Set STORAGE_PROVIDER, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY, and STORAGE_BUCKET environment variables",
        },
        { status: 503 }
      );
    }

    // Validate file size (prevent uploading huge files)
    // Base64 encoding increases size by ~33%, so 5MB base64 = ~3.75MB actual
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.length > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 413 }
      );
    }

    // Upload file
    const url = await storageService.upload(
      file,
      filename,
      contentType || "image/png"
    );

    return NextResponse.json({
      success: true,
      url,
      message: "File uploaded successfully",
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete a file from S3/R2 storage
 *
 * Body:
 * - url: Full URL or file key to delete
 *
 * Note: Add authentication in production
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    // Check if storage is configured
    if (!storageService.isEnabled()) {
      return NextResponse.json(
        { error: "File storage is not configured" },
        { status: 503 }
      );
    }

    // Delete file
    await storageService.delete(url);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
