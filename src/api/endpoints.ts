// src/api/endpoints.ts
import { ASSET_BASE_URL } from "@/config/env";

export const resolveAudioUrl = (relativePath: string) =>
  `${ASSET_BASE_URL}/${relativePath}`;
