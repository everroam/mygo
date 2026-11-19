import { describe, expect, test } from "bun:test";
import { acceptFileDrag, externalFiles, type FileDragAcceptanceEvent } from "./file-drag";

function drag(types: string[], defaultPrevented = false, dropEffect: FileDragAcceptanceEvent["dropEffect"] = "none") {
  return {
    types,
    defaultPrevented,
    dropEffect,
    preventDefaultCalls: 0,
    preventDefault() {
      this.defaultPrevented = true;
      this.preventDefaultCalls++;
    },
  };
}

describe("externalFiles", () => {
  test("recognizes file drags on every platform", () => {
    for (const platform of ["linux", "darwin", "win32"] as const) {
      expect(externalFiles(["Files"], platform)).toBe(true);
    }
  });

  test("recognizes uri-list drags only on Linux", () => {
    expect(externalFiles(["text/uri-list"], "linux")).toBe(true);
    expect(externalFiles(["text/uri-list"], "darwin")).toBe(false);
    expect(externalFiles(["text/uri-list"], "win32")).toBe(false);
  });

  test("ignores other types", () => {
    for (const platform of ["linux", "darwin", "win32"] as const) {
      expect(externalFiles(["text/plain"], platform)).toBe(false);
    }
  });
});

describe("acceptFileDrag", () => {
  test("accepts Linux uri-list dragenter and dragover with copy semantics", () => {
    for (const phase of ["dragenter", "dragover"] as const) {
      const event = drag(["text/uri-list"]);
      acceptFileDrag(event, "linux", phase);
      expect(event.defaultPrevented).toBe(true);
      expect(event.preventDefaultCalls).toBe(1);
      expect(event.dropEffect).toBe("copy");
    }
  });

  test("preserves the page's selected effect when it already canceled the event", () => {
    for (const phase of ["dragenter", "dragover", "drop"] as const) {
      const event = drag(["text/uri-list"], true, "move");
      acceptFileDrag(event, "linux", phase);
      expect(event.defaultPrevented).toBe(true);
      expect(event.preventDefaultCalls).toBe(0);
      expect(event.dropEffect).toBe("move");
    }
  });

  test("leaves non-Linux uri-list drags untouched", () => {
    for (const platform of ["darwin", "win32"] as const) {
      for (const phase of ["dragenter", "dragover", "drop"] as const) {
        const event = drag(["text/uri-list"], false, "link");
        acceptFileDrag(event, platform, phase);
        expect(event.defaultPrevented).toBe(false);
        expect(event.preventDefaultCalls).toBe(0);
        expect(event.dropEffect).toBe("link");
      }
    }
  });

  test("keeps Files dragover and drop behavior without accepting Files at dragenter", () => {
    const enter = drag(["Files"], false, "move");
    acceptFileDrag(enter, "linux", "dragenter");
    expect(enter.defaultPrevented).toBe(false);
    expect(enter.dropEffect).toBe("move");

    for (const phase of ["dragover", "drop"] as const) {
      const event = drag(["Files"], false, "move");
      acceptFileDrag(event, "linux", phase);
      expect(event.defaultPrevented).toBe(true);
      expect(event.preventDefaultCalls).toBe(1);
      expect(event.dropEffect).toBe("move");
    }
  });
});
