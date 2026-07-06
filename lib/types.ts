export type ColumnId = "backlog" | "next" | "inprogress" | "blocked" | "done";
export type Category = "Task" | "Overnight review" | "Learn" | "Meeting" | "Branch-context";
export type Source = string;
export type Build = string;

export interface Task {
  itemId: string;          // Projects v2 item node id
  issueNumber: number;
  title: string;
  url: string;
  build: Build | null;
  category: Category | null;
  source: Source | null;
  column: ColumnId | null; // derived from Status option name
  repo: string;            // Repo name field, "" when empty
  branch: string;          // Branch field, "" when empty
}

export interface SingleSelectMeta {
  id: string;
  name: string;
  options: { id: string; name: string }[];
}
export interface FieldMeta {
  projectId: string;
  status: SingleSelectMeta;
  category: SingleSelectMeta;
  build: SingleSelectMeta;
  source: SingleSelectMeta;
  repoNameFieldId: string;
  branchFieldId: string;
}
export interface ProjectData { meta: FieldMeta; tasks: Task[]; }
export interface ColumnDef { id: ColumnId; label: string; statusName: string; }
