import type { Build, ColumnId, Task } from "@/lib/types";
import { COLUMNS } from "@/lib/tokens";

export interface Filters {
  build: "All" | Build;
}

export function applyFilters(tasks: Task[], f: Filters): Task[] {
  return tasks.filter((t) => f.build === "All" || t.build === f.build);
}

// Board shows Build + Administrative (everything except Learn).
export function boardTasks(filtered: Task[]): Task[] {
  return filtered.filter((t) => t.category !== "Learn");
}
// Table shows only Build tasks.
export function buildTasks(filtered: Task[]): Task[] {
  return filtered.filter((t) => t.category === "Build");
}
export function learnList(filtered: Task[]): Task[] {
  return filtered.filter((t) => t.category === "Learn");
}
export function adminList(filtered: Task[]): Task[] {
  return filtered.filter((t) => t.category === "Administrative");
}

export function tasksByColumn(board: Task[]): Record<ColumnId, Task[]> {
  const out = {} as Record<ColumnId, Task[]>;
  for (const c of COLUMNS) out[c.id] = [];
  for (const t of board) if (t.column) out[t.column].push(t);
  return out;
}
export function columnCounts(board: Task[]): Record<ColumnId, number> {
  const by = tasksByColumn(board);
  const out = {} as Record<ColumnId, number>;
  for (const c of COLUMNS) out[c.id] = by[c.id].length;
  return out;
}
export function tableGroups(board: Task[], buildOrder: string[]): { build: string; tasks: Task[] }[] {
  return buildOrder
    .map((build) => ({ build, tasks: board.filter((t) => t.build === build) }))
    .filter((g) => g.tasks.length > 0);
}
