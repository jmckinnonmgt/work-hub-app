import { describe, it, expect } from "vitest";
import { sortColumn, reorderIds } from "@/lib/views/order";
import type { Task } from "@/lib/types";

const mk = (id: string): Task => ({
  itemId: id, issueNumber: 1, title: `T-${id}`, url: "", build: "General",
  category: "Build", source: "Self", column: "next", repo: "", branch: "",
});

describe("sortColumn", () => {
  it("returns tasks unchanged when there is no saved order", () => {
    const tasks = [mk("a"), mk("b"), mk("c")];
    expect(sortColumn(tasks, undefined).map((t) => t.itemId)).toEqual(["a", "b", "c"]);
  });
  it("orders tasks by the saved order", () => {
    const tasks = [mk("a"), mk("b"), mk("c")];
    expect(sortColumn(tasks, ["c", "a", "b"]).map((t) => t.itemId)).toEqual(["c", "a", "b"]);
  });
  it("appends tasks missing from the order, keeping their incoming order", () => {
    const tasks = [mk("a"), mk("b"), mk("new")];
    expect(sortColumn(tasks, ["b", "a"]).map((t) => t.itemId)).toEqual(["b", "a", "new"]);
  });
  it("ignores ids in the order that are no longer present", () => {
    const tasks = [mk("a"), mk("b")];
    expect(sortColumn(tasks, ["gone", "b", "a"]).map((t) => t.itemId)).toEqual(["b", "a"]);
  });
});

describe("reorderIds", () => {
  it("moves a card up within the same column", () => {
    expect(reorderIds(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
  });
  it("moves a card down within the same column", () => {
    expect(reorderIds(["a", "b", "c"], "a", 3)).toEqual(["b", "c", "a"]);
  });
  it("is a no-op when dropped in its own slot", () => {
    expect(reorderIds(["a", "b", "c"], "b", 1)).toEqual(["a", "b", "c"]);
    expect(reorderIds(["a", "b", "c"], "b", 2)).toEqual(["a", "b", "c"]);
  });
  it("inserts a card arriving from another column at the slot", () => {
    expect(reorderIds(["a", "b"], "x", 1)).toEqual(["a", "x", "b"]);
    expect(reorderIds(["a", "b"], "x", 0)).toEqual(["x", "a", "b"]);
    expect(reorderIds(["a", "b"], "x", 2)).toEqual(["a", "b", "x"]);
  });
  it("inserts into an empty column", () => {
    expect(reorderIds([], "x", 0)).toEqual(["x"]);
  });
});
