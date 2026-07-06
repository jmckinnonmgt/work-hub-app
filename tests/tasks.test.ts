import { describe, it, expect, vi } from "vitest";
import raw from "./fixtures/project.json";
import { moveTask, __setTransportsForTest } from "@/lib/github/tasks";
import { mapProject } from "@/lib/github/mapping";
import { createTask } from "@/lib/github/tasks";
import { updateTask } from "@/lib/github/tasks";

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
    const id = await createTask("tok", meta, { title: "New thing", category: "Build", build: "General", column: "next" });
    expect(id).toBe("NEW");
    expect(issuesCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "New thing" }));
    // 1 add + category + source + build + status = 5 gql calls
    expect(gql).toHaveBeenCalledTimes(5);
  });
});

describe("updateTask", () => {
  it("clears build and status fields when the edited task has none", async () => {
    const gql = vi.fn().mockResolvedValue({});
    const issuesUpdate = vi.fn().mockResolvedValue({});
    const rest = () => ({ rest: { issues: { update: issuesUpdate } } }) as any;
    __setTransportsForTest({ gql, rest });
    const { meta } = mapProject(raw as any);
    await updateTask("tok", meta, {
      itemId: "I_1", issueNumber: 2, title: "Fix legacy model string",
      category: "Learn", build: "", source: "Self", column: null, repo: "gamma", branch: "fix/model-string",
    });
    const clearCalls = gql.mock.calls.filter(([, query]) => query.includes("clearProjectV2ItemFieldValue"));
    expect(clearCalls.length).toBe(2);
    const clearedFields = clearCalls.map(([, , vars]) => vars.field);
    expect(clearedFields).toContain(meta.build.id);
    expect(clearedFields).toContain(meta.status.id);
  });
});
