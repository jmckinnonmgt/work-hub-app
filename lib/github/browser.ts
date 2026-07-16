import { getToken } from "./token-store";
import { listTasks, moveTask, createTask, updateTask, deleteTask, addBuildOption } from "./tasks";
import { loadFlow, saveFlow } from "./flow";
import type { ColumnId, EditedTask, FieldMeta, NewTask, ProjectData } from "@/lib/types";
import type { FlowState } from "@/lib/flow/types";

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
export function addCard(meta: FieldMeta, t: NewTask): Promise<{ itemId: string; issueNumber: number }> {
  return createTask(requireToken(), meta, t);
}
export function editCard(meta: FieldMeta, t: EditedTask): Promise<void> {
  return updateTask(requireToken(), meta, t);
}
export function deleteCard(meta: FieldMeta, itemId: string, issueNumber: number): Promise<void> {
  return deleteTask(requireToken(), meta, itemId, issueNumber);
}
export function createBuildOption(name: string): Promise<string[]> {
  return addBuildOption(requireToken(), name);
}
export function loadFlowState(): Promise<{ state: FlowState | null; sha: string | null }> {
  return loadFlow(requireToken());
}
export function saveFlowState(state: FlowState, sha: string | null): Promise<string> {
  return saveFlow(requireToken(), state, sha);
}
