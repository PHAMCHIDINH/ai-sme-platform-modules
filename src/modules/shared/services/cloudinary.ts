type CloudinaryEnv = {
  [key: string]: string | undefined;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
};

type CloudinaryUploadConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getCloudinaryUploadConfig(env: CloudinaryEnv = process.env): CloudinaryUploadConfig | null {
  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiKey = env.CLOUDINARY_API_KEY?.trim() ?? "";
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim() ?? "";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

export async function buildCloudinarySignature(
  params: Record<string, string | number | null | undefined>,
  apiSecret: string,
) {
  const canonical = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = await globalThis.crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${canonical}${apiSecret}`),
  );

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
