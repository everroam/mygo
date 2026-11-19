import { describe, expect, test } from "bun:test";
import { externalFiles } from "./file-drag";

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
