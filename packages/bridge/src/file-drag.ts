import type { Platform } from "./types";

export function externalFiles(types: readonly string[], platform: Platform): boolean {
  return types.includes("Files") || (platform === "linux" && types.includes("text/uri-list"));
}
