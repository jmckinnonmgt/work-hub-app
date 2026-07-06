import type { Build, Category, ColumnId, Task } from "@/lib/types";
import { COLUMNS } from "@/lib/tokens";

export interface Filters {
  build: "All" | Build;
  category: "All" | Category;
  adminOnly: boolean;
}

export function applyFilters(tasks: Task[], f: Filters): Task[] {
  return tasks.filter((t) => {
    if (f.build !== "All" && t.build !== f.build) return false;
    if (f.adminOnly) return t.category === "Meeting" || t.category === "Overnight review";
    if (f.category !== "All" && t.category !== f.category) return false;
    return true;
  });
}

export function boardTasks(filtered: Task[]): Task[] {
  return filtered.filter((t) => t.category !== "Learn");
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

export function learnList(filtered: Task[]): Task[] {
  return filtered.filter((t) => t.category === "Learn");
}
