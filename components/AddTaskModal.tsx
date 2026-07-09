"use client";
import { useState } from "react";
import { tokens } from "@/lib/tokens";
import type { NewTask } from "@/lib/types";

type TypeChoice = "Administrative" | "Learn" | "Build";

export function AddTaskModal({ builds, onAdd, onClose, onAddBuild }: { builds: string[]; onAdd: (t: NewTask) => void; onClose: () => void; onAddBuild?: (name: string) => Promise<void> | void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TypeChoice>("Build");
  const [build, setBuild] = useState(builds[0] ?? "General");
  const [addingBuild, setAddingBuild] = useState(false);
  const [newBuildName, setNewBuildName] = useState("");

  async function addBuild() {
    const n = newBuildName.trim();
    if (!n) return;
    await onAddBuild?.(n);
    setBuild(n);
    setAddingBuild(false);
    setNewBuildName("");
  }

  function submit() {
    const t = title.trim();
    if (!t) return;
    if (type === "Learn") onAdd({ title: t, category: "Learn" });
    else if (type === "Administrative") onAdd({ title: t, category: "Administrative", column: "next" });
    else onAdd({ title: t, category: "Build", build, column: "next" });
    onClose();
  }

  const typeBtn = (x: TypeChoice) => ({
    flex: 1, padding: "8px 0", borderRadius: 6, cursor: "pointer", fontSize: 13,
    background: type === x ? tokens.accentSoft : "transparent",
    color: type === x ? tokens.accent : tokens.ink2,
    border: `1px solid ${type === x ? tokens.accent : tokens.line}`,
  }) as React.CSSProperties;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: "90vw", background: tokens.panel, border: `1px solid ${tokens.line}`, borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 650, color: tokens.ink, marginBottom: 14 }}>Add task</div>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Task title" aria-label="Task title"
          style={{ width: "100%", background: tokens.bg, border: `1px solid ${tokens.line}`, color: tokens.ink, borderRadius: 6, padding: "8px 10px", fontSize: 13, marginBottom: 14 }} />
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.ink3, marginBottom: 6 }}>Type</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {(["Administrative", "Learn", "Build"] as TypeChoice[]).map((x) => (
            <button key={x} onClick={() => setType(x)} style={typeBtn(x)}>{x}</button>
          ))}
        </div>
        {type === "Build" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.ink3, marginBottom: 6 }}>Build</div>
            <select aria-label="Build" value={build} onChange={(e) => setBuild(e.target.value)} style={{ width: "100%", background: tokens.bg, border: `1px solid ${tokens.line}`, color: tokens.ink, borderRadius: 6, padding: "7px 9px", fontSize: 13 }}>
              {builds.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {addingBuild ? (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input autoFocus value={newBuildName} onChange={(e) => setNewBuildName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addBuild(); }} placeholder="New build name" aria-label="New build name"
                  style={{ flex: 1, background: tokens.bg, border: `1px solid ${tokens.line}`, color: tokens.ink, borderRadius: 6, padding: "7px 9px", fontSize: 13 }} />
                <button onClick={addBuild} aria-label="Add build" style={{ background: tokens.accent, color: tokens.onAccent, border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Add</button>
              </div>
            ) : (
              <button onClick={() => setAddingBuild(true)} style={{ background: "transparent", color: tokens.accent, border: "none", padding: 0, marginTop: 8, fontSize: 12, cursor: "pointer" }}>+ New build</button>
            )}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ background: "transparent", color: tokens.ink2, border: `1px solid ${tokens.line}`, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} style={{ background: tokens.accent, color: tokens.onAccent, border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer" }}>Add</button>
        </div>
      </div>
    </div>
  );
}
