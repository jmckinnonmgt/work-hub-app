import { describe, it, expect, vi } from "vitest";
import raw from "./fixtures/project.json";
import { moveTask, __setTransportsForTest } from "@/lib/github/tasks";
import { mapProject } from "@/lib/github/mapping";
import { createTask } from "@/lib/github/tasks";

describe("moveTask", () => {
  it("updates the Status field with the option id for the target column", async () => {
    const gql = vi.fn().mockResolvedValue({});
    __setTransportsForTest({ gql });
    const { meta } = mapProject(raw as any);
    await moveTask("tok", meta, "I_1", "done");
    expect(gql).toHaveBeenCalledOnce();
    const vars = gql.mock.calls[0][2];
    expect(vars.item).toBe("I_1");
    expect(vars.field).toBe("F_status");
    expect(vars.option).toBe("o_done");
  });
});

describe("createTask", () => {
  it("creates an issue, adds it, and sets default fields", async () => {
    const gql = vi.fn()
      .mockResolvedValueOnce({ addProjectV2ItemById: { item: { id: "NEW" } } })
      .mockResolvedValue({});
    const issuesCreate = vi.fn().mockResolvedValue({ data: { node_id: "NODE" } });
    const rest = () => ({ rest: { issues: { create: issuesCreate } } }) as any;
    __setTransportsForTest({ gql, rest });
    const { meta } = mapProject(raw as any);
    await createTask("tok", meta, "New thing", "backlog");
    expect(issuesCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "New thing" }));
    // 1 add + 4 field updates
    expect(gql).toHaveBeenCalledTimes(5);
  });
});
