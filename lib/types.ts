export type ColumnId = "next" | "inprogress" | "blocked" | "done";
export type Category = "Build" | "Learn" | "Administrative";
export type Source = string;
export type Build = string;

export interface NewTask {
  title: string;
  category: Category;
  build?: string;
  column?: ColumnId;
}

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
  options: { id: string; name: string; color?: string; description?: string }[];
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
export interface EditedTask {
  itemId: string;
  issueNumber: number;
  title: string;
  category: Category;
  build: string;
  source: string;
  column: ColumnId | null;
  repo: string;
  branch: string;
}

export interface ProjectData { meta: FieldMeta; tasks: Task[]; }
export interface ColumnDef { id: ColumnId; label: string; statusName: string; }
