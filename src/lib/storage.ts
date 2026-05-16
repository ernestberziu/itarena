import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";

export type PreparedUpload = {
  /** POST target for multipart upload (include `file` + uploadFields). */
  uploadUrl: string;
  /** Stable delivery URL after upload completes (same `public_id`). */
  fileUrl: string;
  /** Cloudinary `public_id` — pass to `deleteFile` / `getFileUrl`. */
  key: string;
  resourceType: "image" | "raw";
  /** Form fields to send alongside `file` in the multipart POST. */
  uploadFields: Record<string, string>;
};

type CloudinarySecrets = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getCredentials(): CloudinarySecrets {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url) {
    try {
      const normalized = url.replace(/^cloudinary:\/\//i, "https://");
      const u = new URL(normalized);
      const cloudName = u.hostname;
      const apiKey = decodeURIComponent(u.username || "");
      const apiSecret = decodeURIComponent(u.password || "");
      if (cloudName && apiKey && apiSecret) {
        return { cloudName, apiKey, apiSecret };
      }
    } catch {
      /* fall through */
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  throw new Error(
    "Missing Cloudinary configuration. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
  );
}

function applyConfig(c: CloudinarySecrets): void {
  cloudinary.config({
    cloud_name: c.cloudName,
    api_key: c.apiKey,
    api_secret: c.apiSecret,
    secure: true,
  });
}

function resolveCloudName(): string {
  const pub = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (pub) return pub;
  const direct = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (direct) return direct;
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url?.toLowerCase().startsWith("cloudinary://")) {
    try {
      const normalized = url.replace(/^cloudinary:\/\//i, "https://");
      const u = new URL(normalized);
      if (u.hostname) return u.hostname;
    } catch {
      /* fall through */
    }
  }
  return getCredentials().cloudName;
}

function resourceTypeFromContentType(contentType: string): "image" | "raw" {
  return contentType.trim().toLowerCase().startsWith("image/") ? "image" : "raw";
}

/**
 * Prepare a browser direct upload to Cloudinary (signed).
 * Client: `POST uploadUrl` as `multipart/form-data` with `uploadFields` + `file`.
 */
export async function getUploadUrl(
  folder: string,
  contentType: string,
  _extension: string
): Promise<PreparedUpload> {
  const creds = getCredentials();
  applyConfig(creds);

  const resourceType = resourceTypeFromContentType(contentType);
  const public_id = `${folder.replace(/^\/+|\/+$/g, "")}/${uuid()}`;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    public_id,
  };
  if (resourceType === "raw") {
    paramsToSign.resource_type = "raw";
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, creds.apiSecret);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${creds.cloudName}/${resourceType}/upload`;

  const fileUrl = getFileUrl(public_id, resourceType);

  return {
    uploadUrl,
    fileUrl,
    key: public_id,
    resourceType,
    uploadFields: {
      api_key: creds.apiKey,
      timestamp: String(timestamp),
      signature,
      public_id,
    },
  };
}

export async function deleteFile(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  const creds = getCredentials();
  applyConfig(creds);
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function getFileUrl(publicId: string, resourceType: "image" | "raw" = "image"): string {
  const cloud = resolveCloudName();
  return `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${publicId}`;
}
