import { describe, it, expect } from "vitest";
import { tokens, COLUMNS } from "@/lib/tokens";

describe("tokens", () => {
  it("uses the approved dark palette", () => {
    expect(tokens.bg).toBe("#131417");
    expect(tokens.accent).toBe("#7aa7c7");
    expect(tokens.status.inprogress).toBe("#c49a58");
  });
  it("defines the four columns in order", () => {
    expect(COLUMNS.map((c) => c.id)).toEqual([
      "next", "blocked", "inprogress", "done",
    ]);
    expect(COLUMNS.map((c) => c.label)).toEqual([
      "Next", "Blocked", "In progress", "Done",
    ]);
  });
});
