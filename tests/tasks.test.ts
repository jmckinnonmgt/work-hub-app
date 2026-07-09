import { describe, it, expect, vi } from "vitest";
import raw from "./fixtures/project.json";
import { moveTask, __setTransportsForTest } from "@/lib/github/tasks";
import { mapProject } from "@/lib/github/mapping";
import { createTask } from "@/lib/github/tasks";
import { updateTask } from "@/lib/github/tasks";
import { deleteTask } from "@/lib/github/tasks";
import { addBuildOption } from "@/lib/github/tasks";
import { PROJECT_QUERY } from "@/lib/github/queries";

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

describe("addBuildOption", () => {
  function rawProject(buildOptions: { id: string; name: string }[], itemBuildName: string | null) {
    return {
      id: "PVT_kwHOEW9rns4BcTpJ",
      fields: { nodes: [
        { __typename: "ProjectV2SingleSelectField", id: "F_status", name: "Status",
          options: [{ id: "o_next", name: "Next" }, { id: "o_done", name: "Done" }] },
        { __typename: "ProjectV2SingleSelectField", id: "F_cat", name: "Category",
          options: [{ id: "c_build", name: "Build" }, { id: "c_learn", name: "Learn" }] },
        { __typename: "ProjectV2SingleSelectField", id: "F_build", name: "Build", options: buildOptions },
        { __typename: "ProjectV2SingleSelectField", id: "F_source", name: "Source",
          options: [{ id: "s_self", name: "Self" }] },
        { __typename: "ProjectV2Field", id: "F_repo", name: "Repo name" },
        { __typename: "ProjectV2Field", id: "F_branch", name: "Branch" },
      ] },
      items: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [
        { id: "I_1", content: { __typename: "Issue", number: 2, title: "Some task", url: "https://x/2" },
          fieldValues: { nodes: [
            { __typename: "ProjectV2ItemFieldSingleSelectValue", name: "Next", field: { name: "Status" } },
            { __typename: "ProjectV2ItemFieldSingleSelectValue", name: "Build", field: { name: "Category" } },
            ...(itemBuildName ? [{ __typename: "ProjectV2ItemFieldSingleSelectValue", name: itemBuildName, field: { name: "Build" } }] : []),
            { __typename: "ProjectV2ItemFieldSingleSelectValue", name: "Self", field: { name: "Source" } },
          ] } },
      ] },
    };
  }

  it("reads current build values, updates options, then re-applies item build values", async () => {
    const beforeProject = rawProject([{ id: "b1", name: "Atlas" }, { id: "b2", name: "Morpheus" }], "Atlas");
    const afterProject = rawProject([{ id: "b1n", name: "Atlas" }, { id: "b2n", name: "Morpheus" }, { id: "b3n", name: "Zephyr" }], "Atlas");
    let projectCallCount = 0;
    const gql = vi.fn().mockImplementation((_token: string, query: string) => {
      if (query === PROJECT_QUERY) {
        projectCallCount += 1;
        const raw = projectCallCount === 1 ? beforeProject : afterProject;
        return Promise.resolve({ user: { projectV2: raw } });
      }
      if (query.includes("singleSelectOptions")) return Promise.resolve({});
      if (query.includes("updateProjectV2ItemFieldValue")) return Promise.resolve({});
      return Promise.resolve({});
    });
    __setTransportsForTest({ gql });

    const result = await addBuildOption("tok", "Zephyr");

    expect(result).toEqual(["Atlas", "Morpheus", "Zephyr"]);

    const optionsCall = gql.mock.calls.find(([, query]) => query.includes("singleSelectOptions"));
    expect(optionsCall).toBeTruthy();
    const optionNames = (optionsCall![2] as any).options.map((o: any) => o.name);
    expect(optionNames).toEqual(["Atlas", "Morpheus", "Zephyr"]);

    const reapplyCall = gql.mock.calls.find(
      ([, query, vars]) => query.includes("updateProjectV2ItemFieldValue") && (vars as any).item === "I_1",
    );
    expect(reapplyCall).toBeTruthy();
    expect((reapplyCall![2] as any).option).toBe("b1n");
  });
});

describe("deleteTask", () => {
  it("deletes the project item and closes the issue", async () => {
    const gql = vi.fn().mockResolvedValue({});
    const issuesUpdate = vi.fn().mockResolvedValue({});
    const rest = () => ({ rest: { issues: { update: issuesUpdate, create: vi.fn() } } }) as any;
    __setTransportsForTest({ gql, rest });
    const { meta } = mapProject(raw as any);
    await deleteTask("tok", meta, "I_1", 2);
    expect(gql).toHaveBeenCalledOnce();
    const [, query, vars] = gql.mock.calls[0];
    expect(query).toContain("deleteProjectV2Item");
    expect(vars.item).toBe("I_1");
    expect(issuesUpdate).toHaveBeenCalledWith(expect.objectContaining({ issue_number: 2, state: "closed" }));
  });
});
