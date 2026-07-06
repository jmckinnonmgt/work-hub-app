import { describe, it, expect } from "vitest";
import { tokens, COLUMNS } from "@/lib/tokens";

describe("tokens", () => {
  it("uses the approved dark palette", () => {
    expect(tokens.bg).toBe("#131417");
    expect(tokens.accent).toBe("#7aa7c7");
    expect(tokens.status.inprogress).toBe("#c49a58");
  });
  it("defines the five columns in order", () => {
    expect(COLUMNS.map((c) => c.id)).toEqual([
      "backlog", "next", "inprogress", "blocked", "done",
    ]);
    expect(COLUMNS.map((c) => c.label)).toEqual([
      "Backlog", "Next", "In progress", "Blocked", "Done",
    ]);
  });
});
