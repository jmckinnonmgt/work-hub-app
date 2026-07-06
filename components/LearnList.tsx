"use client";
import type { Task } from "@/lib/types";
import { tokens } from "@/lib/tokens";

export function LearnList({ tasks }: { tasks: Task[] }) {
  return (
    <div style={{ maxWidth: 720, margin: "20px 22px" }}>
      <div style={{ fontSize: 12.5, color: tokens.ink3, marginBottom: 8 }}>Study topics queued from reviews and 1:1s.</div>
      {tasks.map((t) => (
        <div key={t.itemId} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "15px 4px", borderBottom: `1px solid ${tokens.line}` }}>
          <span className="mono" style={{ width: 56, flex: "none", fontSize: 11, color: tokens.ink3 }}>Learn</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 550, color: tokens.ink }}>{t.title}</div>
            <div style={{ fontSize: 12, color: tokens.ink3 }}>{t.build ?? "General"}{t.source ? ` · from ${t.source}` : ""}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
