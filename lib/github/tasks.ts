import { OWNER, REPO, PROJECT_NUMBER } from "@/lib/constants";
import type { ColumnId, FieldMeta, ProjectData } from "@/lib/types";
import { mapProject, type RawProject } from "./mapping";
import { statusNameForColumn } from "./mapping";
import { githubGraphql, githubRest } from "./client";
import {
  PROJECT_QUERY, UPDATE_FIELD_MUTATION, UPDATE_TEXT_MUTATION, ADD_ITEM_MUTATION, CLEAR_FIELD_MUTATION,
  DELETE_ITEM_MUTATION, UPDATE_BUILD_OPTIONS_MUTATION,
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

export async function createTask(token: string, meta: FieldMeta, t: import("@/lib/types").NewTask): Promise<{ itemId: string; issueNumber: number }> {
  const rest = _rest(token);
  const issue = await rest.rest.issues.create({ owner: OWNER, repo: REPO, title: t.title });
  const contentId = issue.data.node_id;
  const issueNumber = issue.data.number;
  const added = await _gql<{ addProjectV2ItemById: { item: { id: string } } }>(
    token, ADD_ITEM_MUTATION, { project: meta.projectId, content: contentId },
  );
  const itemId = added.addProjectV2ItemById.item.id;

  const sets: [FieldMeta["category"], string | undefined][] = [
    [meta.category, t.category],
    [meta.source, "Self"],
  ];
  if (t.build) sets.push([meta.build, t.build]);
  if (t.column) sets.push([meta.status, statusNameForColumn(t.column)]);

  for (const [field, name] of sets) {
    if (!name) continue;
    const opt = field.options.find((o) => o.name === name);
    if (!opt) continue;
    await _gql(token, UPDATE_FIELD_MUTATION, {
      project: meta.projectId, item: itemId, field: field.id, option: opt.id,
    });
  }
  return { itemId, issueNumber };
}

export async function updateTask(token: string, meta: FieldMeta, t: import("@/lib/types").EditedTask): Promise<void> {
  // Guard against issue_number 0/undefined (e.g. a just-created task whose real
  // number hasn't propagated into local state yet) — PATCH /issues/0 would 404.
  if (t.issueNumber) {
    const rest = _rest(token);
    await rest.rest.issues.update({ owner: OWNER, repo: REPO, issue_number: t.issueNumber, title: t.title });
  }

  const setSel = async (field: FieldMeta["category"], name: string) => {
    const o = field.options.find((x) => x.name === name);
    if (o) await _gql(token, UPDATE_FIELD_MUTATION, { project: meta.projectId, item: t.itemId, field: field.id, option: o.id });
  };
  const clear = async (field: FieldMeta["category"]) => {
    await _gql(token, CLEAR_FIELD_MUTATION, { project: meta.projectId, item: t.itemId, field: field.id });
  };
  await setSel(meta.category, t.category);
  if (t.build) await setSel(meta.build, t.build); else await clear(meta.build);
  if (t.source) await setSel(meta.source, t.source);
  if (t.column) await setSel(meta.status, statusNameForColumn(t.column)); else await clear(meta.status);

  await _gql(token, UPDATE_TEXT_MUTATION, { project: meta.projectId, item: t.itemId, field: meta.repoNameFieldId, text: t.repo });
  await _gql(token, UPDATE_TEXT_MUTATION, { project: meta.projectId, item: t.itemId, field: meta.branchFieldId, text: t.branch });
}

export async function addBuildOption(token: string, newName: string): Promise<string[]> {
  const name = newName.trim();
  const { meta } = await listTasks(token);
  const names = meta.build.options.map((o) => o.name);
  if (!name || names.includes(name)) return names;
  // updateProjectV2Field replaces the whole option set. Send every existing option
  // back WITH its id (and color/description) so GitHub keeps it — and every card's
  // build assignment — untouched, then append the new option with no id.
  const options = [
    ...meta.build.options.map((o) => ({ id: o.id, name: o.name, color: o.color ?? "GRAY", description: o.description ?? "" })),
    { name, color: "GRAY", description: "" },
  ];
  await _gql(token, UPDATE_BUILD_OPTIONS_MUTATION, { field: meta.build.id, options });
  return [...names, name];
}

export async function deleteTask(token: string, meta: FieldMeta, itemId: string, issueNumber: number): Promise<void> {
  await _gql(token, DELETE_ITEM_MUTATION, { project: meta.projectId, item: itemId });
  if (issueNumber) {
    const rest = _rest(token);
    await rest.rest.issues.update({ owner: OWNER, repo: REPO, issue_number: issueNumber, state: "closed" });
  }
}
