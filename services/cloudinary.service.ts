import { normalizeApiError } from "@/services/api";
import type { UploadSignatureResponse } from "@/services/profile.service";

interface CloudinaryUploadResult {
  secure_url?: string;
}

export const uploadToCloudinary = async (
  file: File,
  signature: UploadSignatureResponse,
): Promise<string> => {
  const payload = new FormData();
  payload.set("file", file);
  payload.set("api_key", signature.apiKey);
  payload.set("timestamp", String(signature.timestamp));
  payload.set("signature", signature.signature);
  payload.set("folder", signature.folder);
  payload.set("public_id", signature.publicId);

  try {
    const response = await fetch(signature.uploadUrl, {
      method: "POST",
      body: payload,
    });

    const body = (await response.json()) as CloudinaryUploadResult;

    if (!response.ok || typeof body.secure_url !== "string") {
      throw new Error("Image upload failed.");
    }

    return body.secure_url;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
