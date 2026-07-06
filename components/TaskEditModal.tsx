"use client";
import { useState } from "react";
import { tokens, COLUMNS } from "@/lib/tokens";
import type { Category, ColumnId, EditedTask, Task } from "@/lib/types";

const TYPES: Category[] = ["Administrative", "Learn", "Build"];

export function TaskEditModal({ task, builds, sources, onSave, onClose }: {
  task: Task; builds: string[]; sources: string[];
  onSave: (t: EditedTask) => void; onClose: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<Category>(task.category ?? "Build");
  const [build, setBuild] = useState(task.build || builds[0] || "General");
  const [source, setSource] = useState(task.source || sources[0] || "Self");
  const [column, setColumn] = useState<ColumnId | null>(task.column);
  const [repo, setRepo] = useState(task.repo);
  const [branch, setBranch] = useState(task.branch);

  function save() {
    const t = title.trim();
    if (!t) return;
    onSave({
      itemId: task.itemId, issueNumber: task.issueNumber, title: t,
      category, build: category === "Build" ? build : "",
      source, column: category === "Learn" ? null : (column ?? "next"), repo, branch,
    });
    onClose();
  }

  const label: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.ink3, margin: "12px 0 6px" };
  const field: React.CSSProperties = { width: "100%", background: tokens.bg, border: `1px solid ${tokens.line}`, color: tokens.ink, borderRadius: 6, padding: "7px 9px", fontSize: 13 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: "92vw", maxHeight: "88vh", overflow: "auto", background: tokens.panel, border: `1px solid ${tokens.line}`, borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 650, color: tokens.ink }}>Edit task</div>
        <div style={label}>Title</div>
        <input aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={field} />
        <div style={label}>Type</div>
        <div style={{ display: "flex", gap: 8 }}>
          {TYPES.map((x) => (
            <button key={x} onClick={() => setCategory(x)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, cursor: "pointer", fontSize: 13, background: category === x ? tokens.accentSoft : "transparent", color: category === x ? tokens.accent : tokens.ink2, border: `1px solid ${category === x ? tokens.accent : tokens.line}` }}>{x}</button>
          ))}
        </div>
        {category === "Build" && (<><div style={label}>Build</div>
          <select aria-label="Build" value={build} onChange={(e) => setBuild(e.target.value)} style={field}>{builds.map((b) => <option key={b} value={b}>{b}</option>)}</select></>)}
        {category !== "Learn" && (<><div style={label}>Status</div>
          <select aria-label="Status" value={column ?? ""} onChange={(e) => setColumn(e.target.value as ColumnId)} style={field}>{COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></>)}
        <div style={label}>Source</div>
        <select aria-label="Source" value={source} onChange={(e) => setSource(e.target.value)} style={field}>{sources.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <div style={label}>Repo</div>
        <input aria-label="Repo" value={repo} onChange={(e) => setRepo(e.target.value)} style={field} />
        <div style={label}>Branch</div>
        <input aria-label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} style={field} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{ background: "transparent", color: tokens.ink2, border: `1px solid ${tokens.line}`, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} style={{ background: tokens.accent, color: tokens.onAccent, border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}
