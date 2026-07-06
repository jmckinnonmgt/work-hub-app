"use client";
import type { Task } from "@/lib/types";
import { tokens } from "@/lib/tokens";

export function MeetingsView({ meetings }: { meetings: Task[] }) {
  return (
    <div style={{ maxWidth: 720, margin: "20px 22px", display: "flex", flexDirection: "column", gap: 9 }}>
      {meetings.map((m) => (
        <div key={m.itemId} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${tokens.line}`, background: tokens.panel, borderRadius: 7, padding: "13px 15px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: tokens.ink3, flex: "none" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 550, color: tokens.ink }}>{m.title}</div>
            <div style={{ fontSize: 12, color: tokens.ink3 }}>{m.build ?? "General"}{m.source ? ` · ${m.source}` : ""}</div>
          </div>
          <button disabled style={{ fontSize: 12, color: tokens.ink3, border: `1px solid ${tokens.line}`, background: "transparent", borderRadius: 5, padding: "5px 10px", cursor: "default" }}>Set up</button>
        </div>
      ))}
    </div>
  );
}
