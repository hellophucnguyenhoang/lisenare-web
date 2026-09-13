// src/api/endpoints.ts
import { ASSET_BASE_URL } from "@/config/env";

export const resolveAudioUrl = (relativePath: string) => {
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://") ||
    relativePath.startsWith("blob:")
  ) {
    return relativePath;
  }
  const cleanPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;
  return `${ASSET_BASE_URL}/${cleanPath}`;
};
