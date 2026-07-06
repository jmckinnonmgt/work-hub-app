import { describe, it, expect } from "vitest";
import { applyFilters, boardTasks, buildTasks, tableGroups, learnList, adminList, tasksByColumn } from "@/lib/views/derive";
import type { Task } from "@/lib/types";

const t = (p: Partial<Task>): Task => ({
  itemId: "x", issueNumber: 1, title: "t", url: "", build: "General",
  category: "Build", source: "Self", column: "next", repo: "", branch: "", ...p,
});

const ORDER = ["Alpha", "Beta", "Gamma", "General"];

describe("derive", () => {
  const tasks: Task[] = [
    t({ build: "Gamma", category: "Build", column: "inprogress" }),
    t({ build: "General", category: "Learn", column: "next" }),
    t({ build: "Alpha", category: "Administrative", column: "next" }),
  ];

  it("filters by build", () => {
    expect(applyFilters(tasks, { build: "Gamma" })).toHaveLength(1);
  });
  it("boardTasks excludes Learn", () => {
    expect(boardTasks(tasks).some((x) => x.category === "Learn")).toBe(false);
  });
  it("buildTasks keeps only Build", () => {
    expect(buildTasks(tasks).every((x) => x.category === "Build")).toBe(true);
    expect(buildTasks(tasks)).toHaveLength(1);
  });
  it("learnList keeps only Learn", () => {
    expect(learnList(tasks).every((x) => x.category === "Learn")).toBe(true);
  });
  it("adminList keeps only Administrative", () => {
    expect(adminList(tasks).every((x) => x.category === "Administrative")).toBe(true);
    expect(adminList(tasks)).toHaveLength(1);
  });
  it("tableGroups follows build order and drops empty builds", () => {
    const g = tableGroups(boardTasks(tasks), ORDER);
    expect(g.map((x) => x.build)).toEqual(["Alpha", "Gamma"]);
  });
  it("tasksByColumn buckets by column", () => {
    const by = tasksByColumn(boardTasks(tasks));
    expect(by.inprogress).toHaveLength(1);
    expect(by.next).toHaveLength(1);
  });
});
