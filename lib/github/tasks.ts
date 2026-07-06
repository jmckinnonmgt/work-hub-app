import { OWNER, REPO, PROJECT_NUMBER } from "@/lib/constants";
import type { ColumnId, FieldMeta, ProjectData } from "@/lib/types";
import { mapProject, type RawProject } from "./mapping";
import { statusNameForColumn } from "./mapping";
import { githubGraphql, githubRest } from "./client";
import {
  PROJECT_QUERY, UPDATE_FIELD_MUTATION, ADD_ITEM_MUTATION,
} from "./queries";

// Test seam: allow tests to inject fake transports.
type Gql = <T>(token: string, query: string, vars: Record<string, unknown>) => Promise<T>;
let _gql: Gql = githubGraphql;
let _rest = githubRest;
export function __setTransportsForTest(t: { gql?: Gql; rest?: typeof githubRest }) {
  if (t.gql) _gql = t.gql;
  if (t.rest) _rest = t.rest;
}

function optionId(meta: FieldMeta, field: "status" | "category" | "build" | "source", name: string): string {
  const hit = meta[field].options.find((o) => o.name === name);
  if (!hit) throw new Error(`No option "${name}" on field ${field}`);
  return hit.id;
}

export async function listTasks(token: string): Promise<ProjectData> {
  let cursor: string | null = null;
  let base: ProjectData | null = null;
  const all: ProjectData["tasks"] = [];
  do {
    const data: { user: { projectV2: RawProject } } = await _gql<{ user: { projectV2: RawProject } }>(
      token, PROJECT_QUERY, { login: OWNER, number: PROJECT_NUMBER, cursor },
    );
    const page = mapProject(data.user.projectV2);
    if (!base) base = page;
    all.push(...page.tasks);
    cursor = data.user.projectV2.items.pageInfo.hasNextPage
      ? data.user.projectV2.items.pageInfo.endCursor : null;
  } while (cursor);
  return { meta: base!.meta, tasks: all };
}

export async function moveTask(token: string, meta: FieldMeta, itemId: string, column: ColumnId): Promise<void> {
  const option = optionId(meta, "status", statusNameForColumn(column));
  await _gql(token, UPDATE_FIELD_MUTATION, {
    project: meta.projectId, item: itemId, field: meta.status.id, option,
  });
}

export async function createTask(token: string, meta: FieldMeta, title: string, column: ColumnId): Promise<void> {
  const rest = _rest(token);
  const issue = await rest.rest.issues.create({ owner: OWNER, repo: REPO, title });
  const contentId = issue.data.node_id;
  const added = await _gql<{ addProjectV2ItemById: { item: { id: string } } }>(
    token, ADD_ITEM_MUTATION, { project: meta.projectId, content: contentId },
  );
  const itemId = added.addProjectV2ItemById.item.id;
  const defaults: [FieldMeta["status"] | FieldMeta["category"] | FieldMeta["build"] | FieldMeta["source"], string][] = [
    [meta.status, statusNameForColumn(column)],
    [meta.category, "Build"],
    [meta.source, "Self"],
    [meta.build, "General"],
  ];
  for (const [field, name] of defaults) {
    const opt = field.options.find((o) => o.name === name);
    if (!opt) continue;
    await _gql(token, UPDATE_FIELD_MUTATION, {
      project: meta.projectId, item: itemId, field: field.id, option: opt.id,
    });
  }
}
