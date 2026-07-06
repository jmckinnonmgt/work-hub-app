import { getToken } from "./token-store";
import { listTasks, moveTask, createTask } from "./tasks";
import type { ColumnId, FieldMeta, ProjectData } from "@/lib/types";

function requireToken(): string {
  const t = getToken();
  if (!t) throw new Error("No GitHub token set");
  return t;
}

export function loadBoard(): Promise<ProjectData> {
  return listTasks(requireToken());
}
export function moveCard(meta: FieldMeta, itemId: string, column: ColumnId): Promise<void> {
  return moveTask(requireToken(), meta, itemId, column);
}
export function addCard(meta: FieldMeta, title: string, column: ColumnId): Promise<void> {
  return createTask(requireToken(), meta, title, column);
}
