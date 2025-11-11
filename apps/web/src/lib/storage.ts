import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

/**
 * File Storage Service
 * Supports AWS S3 and Cloudflare R2 (S3-compatible)
 */

interface StorageConfig {
  provider: "s3" | "r2";
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint?: string; // Required for R2
  publicUrl?: string; // Custom public URL (e.g., CDN)
}

class StorageService {
  private client: S3Client | null = null;
  private config: StorageConfig | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if storage is configured
    const provider = process.env.STORAGE_PROVIDER as "s3" | "r2" | undefined;
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
    const bucket = process.env.STORAGE_BUCKET;
    const region = process.env.STORAGE_REGION || "auto";
    const endpoint = process.env.STORAGE_ENDPOINT; // For R2 or custom S3 endpoint
    const publicUrl = process.env.STORAGE_PUBLIC_URL;

    if (!provider || !accessKeyId || !secretAccessKey || !bucket) {
      console.log("File storage not configured. Using base64 storage (not recommended for production).");
      this.enabled = false;
      return;
    }

    this.config = {
      provider,
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      endpoint,
      publicUrl,
    };

    // Initialize S3 client
    this.client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      ...(this.config.endpoint && { endpoint: this.config.endpoint }),
    });

    this.enabled = true;
    console.log(`File storage initialized: ${provider} (bucket: ${bucket})`);
  }

  /**
   * Check if file storage is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Upload a file to S3/R2
   * @param base64Data Base64 encoded file data (with or without data URI prefix)
   * @param filename Optional filename
   * @param contentType MIME type (e.g., "image/png")
   * @returns Public URL of uploaded file
   */
  async upload(
    base64Data: string,
    filename?: string,
    contentType: string = "image/png"
  ): Promise<string> {
    if (!this.enabled || !this.client || !this.config) {
      throw new Error("File storage is not configured");
    }

    try {
      // Remove data URI prefix if present (e.g., "data:image/png;base64,")
      const base64Clean = base64Data.includes(",")
        ? base64Data.split(",")[1]
        : base64Data;

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Clean, "base64");

      // Generate unique filename if not provided
      const key = filename || this.generateFilename(contentType);

      // Upload to S3/R2
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read", // Make file publicly accessible
      });

      await this.client.send(command);

      // Return public URL
      return this.getPublicUrl(key);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file to storage");
    }
  }

  /**
   * Delete a file from S3/R2
   * @param key File key (path in bucket) or full URL
   */
  async delete(key: string): Promise<void> {
    if (!this.enabled || !this.client || !this.config) {
      throw new Error("File storage is not configured");
    }

    try {
      // Extract key from URL if full URL is provided
      const fileKey = key.includes("://") ? this.extractKeyFromUrl(key) : key;

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file from storage");
    }
  }

  /**
   * Generate a unique filename
   */
  private generateFilename(contentType: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString("hex");
    const extension = this.getExtensionFromMimeType(contentType);
    return `uploads/${timestamp}-${randomBytes}${extension}`;
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "application/pdf": ".pdf",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
    };
    return map[mimeType] || "";
  }

  /**
   * Get public URL for a file
   */
  private getPublicUrl(key: string): string {
    if (!this.config) {
      throw new Error("Storage not configured");
    }

    // Use custom public URL if provided (e.g., CDN)
    if (this.config.publicUrl) {
      return `${this.config.publicUrl}/${key}`;
    }

    // Default S3 URL
    if (this.config.provider === "s3") {
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
    }

    // Default R2 URL (requires custom domain or public endpoint)
    if (this.config.provider === "r2" && this.config.endpoint) {
      // Extract domain from endpoint
      const domain = this.config.endpoint.replace("https://", "").replace("http://", "");
      return `https://${domain}/${this.config.bucket}/${key}`;
    }

    throw new Error("Cannot determine public URL. Please configure STORAGE_PUBLIC_URL");
  }

  /**
   * Extract file key from full URL
   */
  private extractKeyFromUrl(url: string): string {
    if (!this.config) {
      throw new Error("Storage not configured");
    }

    // Remove protocol and domain
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Remove leading slash and bucket name if present
    let key = path.startsWith("/") ? path.slice(1) : path;
    if (key.startsWith(this.config.bucket + "/")) {
      key = key.slice(this.config.bucket.length + 1);
    }

    return key;
  }
}

// Export singleton instance
export const storageService = new StorageService();
