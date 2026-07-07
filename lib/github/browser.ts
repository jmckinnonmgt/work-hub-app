import { getToken } from "./token-store";
import { listTasks, moveTask, createTask, updateTask, deleteTask } from "./tasks";
import type { ColumnId, EditedTask, FieldMeta, NewTask, ProjectData } from "@/lib/types";

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
export function addCard(meta: FieldMeta, t: NewTask): Promise<string> {
  return createTask(requireToken(), meta, t);
}
export function editCard(meta: FieldMeta, t: EditedTask): Promise<void> {
  return updateTask(requireToken(), meta, t);
}
export function deleteCard(meta: FieldMeta, itemId: string, issueNumber: number): Promise<void> {
  return deleteTask(requireToken(), meta, itemId, issueNumber);
}
