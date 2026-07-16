import type {
  ColumnId, Build, Category, ProjectData, Source, Task, SingleSelectMeta, FieldMeta,
} from "@/lib/types";
import { COLUMNS } from "@/lib/tokens";

export function columnIdForStatus(statusName: string | null): ColumnId | null {
  if (!statusName) return null;
  const norm = statusName.trim().toLowerCase();
  const hit = COLUMNS.find((c) => c.statusName.toLowerCase() === norm);
  return hit ? hit.id : null;
}

export function statusNameForColumn(id: ColumnId): string {
  const hit = COLUMNS.find((c) => c.id === id);
  if (!hit) throw new Error(`Unknown column id: ${id}`);
  return hit.statusName;
}

interface RawOption { id: string; name: string; color?: string; description?: string; }
interface RawField {
  __typename: string; id: string; name: string; options?: RawOption[];
}
interface RawFieldValue {
  __typename: string; name?: string; text?: string; field?: { name?: string };
}
interface RawItem {
  id: string;
  content?: { __typename: string; number?: number; title?: string; url?: string };
  fieldValues: { nodes: RawFieldValue[] };
}
export interface RawProject {
  id: string;
  fields: { nodes: RawField[] };
  items: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: RawItem[] };
}

function selectMeta(fields: RawField[], name: string): SingleSelectMeta {
  const f = fields.find((x) => x.name === name && x.options);
  if (!f) throw new Error(`Missing single-select field: ${name}`);
  return { id: f.id, name: f.name, options: (f.options ?? []).map((o) => ({ id: o.id, name: o.name, color: o.color, description: o.description })) };
}
function textFieldId(fields: RawField[], name: string): string {
  const f = fields.find((x) => x.name === name);
  if (!f) throw new Error(`Missing field: ${name}`);
  return f.id;
}
function valueByField(item: RawItem, field: string): RawFieldValue | undefined {
  return item.fieldValues.nodes.find((v) => v.field?.name === field);
}

export function mapProject(raw: RawProject): ProjectData {
  const fields = raw.fields.nodes;
  const meta: FieldMeta = {
    projectId: raw.id,
    status: selectMeta(fields, "Status"),
    category: selectMeta(fields, "Category"),
    build: selectMeta(fields, "Build"),
    source: selectMeta(fields, "Source"),
    repoNameFieldId: textFieldId(fields, "Repo name"),
    branchFieldId: textFieldId(fields, "Branch"),
  };

  const tasks: Task[] = raw.items.nodes
    .filter((it) => it.content?.__typename === "Issue")
    .map((it) => {
      const status = valueByField(it, "Status")?.name ?? null;
      return {
        itemId: it.id,
        issueNumber: it.content!.number!,
        title: it.content!.title ?? "",
        url: it.content!.url ?? "",
        build: (valueByField(it, "Build")?.name as Build) ?? null,
        category: (valueByField(it, "Category")?.name as Category) ?? null,
        source: (valueByField(it, "Source")?.name as Source) ?? null,
        column: columnIdForStatus(status),
        repo: valueByField(it, "Repo name")?.text ?? "",
        branch: valueByField(it, "Branch")?.text ?? "",
      };
    });

  return { meta, tasks };
}
