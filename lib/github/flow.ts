import { OWNER, REPO } from "@/lib/constants";
import type { FlowState } from "@/lib/flow/types";
import { githubRest } from "./client";

const PATH = "flow/flowmap.json";

type RestFactory = typeof githubRest;
let _rest: RestFactory = githubRest;
export function __setFlowRestForTest(r: RestFactory) { _rest = r; }

function encode(s: string): string { return btoa(unescape(encodeURIComponent(s))); }
function decode(b: string): string { return decodeURIComponent(escape(atob(b.replace(/\s/g, "")))); }

export async function loadFlow(token: string): Promise<{ state: FlowState | null; sha: string | null }> {
  const rest = _rest(token);
  try {
    const res = await rest.rest.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
    const data = res.data as { content?: string; sha: string };
    if (!data.content) return { state: null, sha: data.sha ?? null };
    return { state: JSON.parse(decode(data.content)) as FlowState, sha: data.sha };
  } catch (e) {
    if ((e as { status?: number }).status === 404) return { state: null, sha: null };
    throw e;
  }
}

export async function saveFlow(token: string, state: FlowState, sha: string | null): Promise<string> {
  const rest = _rest(token);
  const content = encode(JSON.stringify(state, null, 2));
  const put = (useSha: string | null) => rest.rest.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path: PATH, message: "chore: update flow map", content,
    ...(useSha ? { sha: useSha } : {}),
  });
  try {
    const res = await put(sha);
    return (res.data as { content: { sha: string } }).content.sha;
  } catch (e) {
    if ((e as { status?: number }).status === 409) {
      const cur = await loadFlow(token);
      const res = await put(cur.sha);
      return (res.data as { content: { sha: string } }).content.sha;
    }
    throw e;
  }
}
