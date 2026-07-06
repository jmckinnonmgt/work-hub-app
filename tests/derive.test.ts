import { describe, it, expect } from "vitest";
import { applyFilters, boardTasks, tableGroups, learnList, tasksByColumn } from "@/lib/views/derive";
import type { Task } from "@/lib/types";

const t = (p: Partial<Task>): Task => ({
  itemId: "x", issueNumber: 1, title: "t", url: "", build: "General",
  category: "Task", source: "Self", column: "backlog", repo: "", branch: "", ...p,
});

const ORDER = ["Alpha", "Beta", "Gamma", "General"];

describe("derive", () => {
  const tasks: Task[] = [
    t({ build: "Gamma", category: "Task", column: "inprogress" }),
    t({ build: "General", category: "Learn", column: "backlog" }),
    t({ build: "Alpha", category: "Meeting", column: "next" }),
  ];

  it("filters by build", () => {
    expect(applyFilters(tasks, { build: "Gamma", category: "All", adminOnly: false })).toHaveLength(1);
  });
  it("adminOnly keeps only Meeting and Overnight review", () => {
    const r = applyFilters(tasks, { build: "All", category: "All", adminOnly: true });
    expect(r.every((x) => x.category === "Meeting" || x.category === "Overnight review")).toBe(true);
  });
  it("boardTasks excludes Learn", () => {
    expect(boardTasks(tasks).some((x) => x.category === "Learn")).toBe(false);
  });
  it("learnList keeps only Learn", () => {
    expect(learnList(tasks).every((x) => x.category === "Learn")).toBe(true);
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
