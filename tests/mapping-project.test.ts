import { describe, it, expect } from "vitest";
import raw from "./fixtures/project.json";
import { mapProject } from "@/lib/github/mapping";

describe("mapProject", () => {
  it("extracts field metadata with option ids", () => {
    const { meta } = mapProject(raw as any);
    expect(meta.projectId).toBe("PVT_kwHOEW9rns4BcTpJ");
    expect(meta.status.id).toBe("F_status");
    expect(meta.status.options.find((o) => o.name === "In progress")?.id).toBe("o_inprog");
    expect(meta.repoNameFieldId).toBe("F_repo");
    expect(meta.branchFieldId).toBe("F_branch");
  });
  it("maps an item into a Task", () => {
    const { tasks } = mapProject(raw as any);
    expect(tasks).toHaveLength(1);
    const t = tasks[0];
    expect(t.issueNumber).toBe(2);
    expect(t.title).toBe("Fix legacy model string");
    expect(t.column).toBe("inprogress");
    expect(t.build).toBe("Gamma");
    expect(t.source).toBe("Manager");
    expect(t.repo).toBe("gamma");
    expect(t.branch).toBe("fix/model-string");
    expect(t.category).toBe("Build");
  });
});
