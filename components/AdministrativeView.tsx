"use client";
import type { Task } from "@/lib/types";
import { tokens, COLUMNS } from "@/lib/tokens";

export function AdministrativeView({ tasks }: { tasks: Task[] }) {
  return (
    <div style={{ maxWidth: 720, margin: "20px 22px", display: "flex", flexDirection: "column", gap: 9 }}>
      {tasks.map((m) => (
        <div key={m.itemId} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${tokens.line}`, background: tokens.panel, borderRadius: 7, padding: "13px 15px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 550, color: tokens.ink }}>{m.title}</div>
            <div style={{ fontSize: 12, color: tokens.ink3 }}>{m.build ?? "General"}{m.source ? ` · ${m.source}` : ""}</div>
          </div>
          {m.column && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: tokens.ink2, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: tokens.status[m.column] }} />
              {COLUMNS.find((c) => c.id === m.column)?.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
