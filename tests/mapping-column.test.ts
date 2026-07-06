import { describe, it, expect } from "vitest";
import { columnIdForStatus, statusNameForColumn } from "@/lib/github/mapping";

describe("column mapping", () => {
  it("maps status names to column ids case-insensitively", () => {
    expect(columnIdForStatus("Next")).toBe("next");
    expect(columnIdForStatus("In progress")).toBe("inprogress");
    expect(columnIdForStatus("in Progress")).toBe("inprogress");
    expect(columnIdForStatus(null)).toBe(null);
    expect(columnIdForStatus("Weird")).toBe(null);
  });
  it("maps column ids back to canonical status names", () => {
    expect(statusNameForColumn("inprogress")).toBe("In progress");
  });
});
