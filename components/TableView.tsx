"use client";
import { useState } from "react";
import type { Task } from "@/lib/types";
import { tokens, COLUMNS } from "@/lib/tokens";
import { tableGroups } from "@/lib/views/derive";

export function TableView({ tasks, buildOrder, onOpen }: { tasks: Task[]; buildOrder: string[]; onOpen?: (task: Task) => void }) {
  const groups = tableGroups(tasks, buildOrder);
  const [collapsed, setCollapsed] = useState<Partial<Record<string, boolean>>>({});
  return (
    <div style={{ margin: "20px 22px", border: `1px solid ${tokens.line}`, borderRadius: 7, overflow: "hidden" }}>
      {groups.map((g) => (
        <div key={g.build}>
          <button
            data-testid="build-group"
            onClick={() => setCollapsed((c) => ({ ...c, [g.build]: !c[g.build] }))}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: tokens.groupBg, color: tokens.groupInk, border: "none", padding: "10px 16px", cursor: "pointer", fontSize: 13.5, fontWeight: 650 }}
          >
            {g.build}
            <span style={{ background: tokens.chip, color: tokens.chipInk, borderRadius: 20, fontSize: 11, padding: "1px 8px" }}>{g.tasks.length}</span>
          </button>
          {!collapsed[g.build] && g.tasks.map((t) => (
            <div key={t.itemId} onClick={() => onOpen?.(t)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 10px 37px", borderBottom: `1px solid ${tokens.line}`, fontSize: 13, color: tokens.ink, cursor: "pointer" }}>
              <span style={{ flex: 1 }}>{t.title}</span>
              {t.column && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: tokens.ink2, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: tokens.status[t.column] }} />
                  {COLUMNS.find((c) => c.id === t.column)?.label}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
