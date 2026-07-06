import { describe, it, expect } from "vitest";
import { PROJECT_QUERY, UPDATE_FIELD_MUTATION, ADD_ITEM_MUTATION } from "@/lib/github/queries";

describe("graphql documents", () => {
  it("query fetches fields and items with field values", () => {
    expect(PROJECT_QUERY).toContain("projectV2");
    expect(PROJECT_QUERY).toContain("fieldValues");
    expect(PROJECT_QUERY).toContain("ProjectV2SingleSelectField");
  });
  it("mutations name their operations", () => {
    expect(UPDATE_FIELD_MUTATION).toContain("updateProjectV2ItemFieldValue");
    expect(ADD_ITEM_MUTATION).toContain("addProjectV2ItemById");
  });
});
