import type { Platform } from "./types";

type DropEffect = "none" | "copy" | "link" | "move";

export type FileDragAcceptanceEvent = {
  types: readonly string[];
  dropEffect: DropEffect;
  defaultPrevented: boolean;
  preventDefault(): void;
};

export function externalFiles(types: readonly string[], platform: Platform): boolean {
  return types.includes("Files") || (platform === "linux" && types.includes("text/uri-list"));
}

export function acceptFileDrag(
  event: FileDragAcceptanceEvent,
  platform: Platform,
  phase: "dragenter" | "dragover" | "drop",
): void {
  const uriListOnly =
    platform === "linux" && event.types.includes("text/uri-list") && !event.types.includes("Files");
  if (event.defaultPrevented || (phase === "dragenter" ? !uriListOnly : !uriListOnly && !event.types.includes("Files"))) {
    return;
  }
  event.preventDefault();
  if (uriListOnly && phase !== "drop") event.dropEffect = "copy";
}
