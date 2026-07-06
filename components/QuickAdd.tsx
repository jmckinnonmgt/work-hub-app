"use client";
import { useState } from "react";
import { tokens } from "@/lib/tokens";

export function QuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [text, setText] = useState("");
  function submit() { const v = text.trim(); if (v) { onAdd(v); setText(""); } }
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder="Add a task..."
        style={{ background: tokens.panel, border: `1px solid ${tokens.line}`, color: tokens.ink, borderRadius: 5, padding: "6px 9px", fontSize: 13 }}
      />
      <button onClick={submit} style={{ background: tokens.accent, color: tokens.onAccent, border: "none", borderRadius: 5, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>Add</button>
    </div>
  );
}
