import type { FlowDiagram, FlowNode, FlowNodeType, FlowState } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "n_" + Math.random().toString(36).slice(2);
}

// A generic Test -> Dev -> Prod skeleton (no real names).
export function skeleton(): FlowDiagram {
  const test: FlowNode = { id: uid(), type: "lane", label: "Test", notes: "", x: 40, y: 250 };
  const dev: FlowNode = { id: uid(), type: "lane", label: "Dev", notes: "", x: 340, y: 250 };
  const prod: FlowNode = { id: uid(), type: "prod", label: "Prod / Main", notes: "", x: 660, y: 255 };
  return {
    nodes: [test, dev, prod],
    edges: [
      { id: uid(), from: test.id, to: dev.id },
      { id: uid(), from: dev.id, to: prod.id },
    ],
  };
}

export function addNode(d: FlowDiagram, type: FlowNodeType): { diagram: FlowDiagram; id: string } {
  const id = uid();
  const base: FlowNode = {
    id, type, notes: "", x: 60, y: 60,
    label: type === "prod" ? "Prod" : type === "pr" ? "feature/new" : "New branch",
  };
  const node: FlowNode = type === "pr" ? { ...base, pr: "", merged: false } : base;
  return { diagram: { ...d, nodes: [...d.nodes, node] }, id };
}

export function updateNode(d: FlowDiagram, id: string, patch: Partial<FlowNode>): FlowDiagram {
  return { ...d, nodes: d.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) };
}

export function moveNode(d: FlowDiagram, id: string, x: number, y: number): FlowDiagram {
  return updateNode(d, id, { x: Math.max(0, x), y: Math.max(0, y) });
}

export function deleteNode(d: FlowDiagram, id: string): FlowDiagram {
  return {
    nodes: d.nodes.filter((n) => n.id !== id),
    edges: d.edges.filter((e) => e.from !== id && e.to !== id),
  };
}

export function addEdge(d: FlowDiagram, from: string, to: string): FlowDiagram {
  if (from === to) return d;
  const exists = d.edges.some((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from));
  if (exists) return d;
  return { ...d, edges: [...d.edges, { id: uid(), from, to }] };
}

export function deleteEdge(d: FlowDiagram, id: string): FlowDiagram {
  return { ...d, edges: d.edges.filter((e) => e.id !== id) };
}

export function addBuild(s: FlowState, name: string): FlowState {
  const n = name.trim();
  if (!n || s.builds.includes(n)) return s;
  return { ...s, builds: [...s.builds, n], active: n, diagrams: { ...s.diagrams, [n]: skeleton() } };
}

export function renameBuild(s: FlowState, oldName: string, newName: string): FlowState {
  const n = newName.trim();
  if (!n || s.builds.includes(n)) return s;
  const builds = s.builds.map((b) => (b === oldName ? n : b));
  const diagrams = { ...s.diagrams };
  if (diagrams[oldName]) { diagrams[n] = diagrams[oldName]; delete diagrams[oldName]; }
  return { ...s, builds, active: s.active === oldName ? n : s.active, diagrams };
}

export function deleteBuild(s: FlowState, name: string): FlowState {
  if (s.builds.length <= 1) return s;
  const builds = s.builds.filter((b) => b !== name);
  const diagrams = { ...s.diagrams };
  delete diagrams[name];
  return { ...s, builds, active: s.active === name ? builds[0] : s.active, diagrams };
}

// Build an initial FlowState from a list of build names (each seeded with a skeleton).
export function initialState(buildNames: string[]): FlowState {
  const names = buildNames.length ? buildNames : ["General"];
  const diagrams: Record<string, FlowDiagram> = {};
  for (const b of names) diagrams[b] = skeleton();
  return { builds: names, active: names[0], diagrams };
}
