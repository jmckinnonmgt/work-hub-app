"use client";
import type { Task } from "@/lib/types";
import { tokens } from "@/lib/tokens";

export function TaskCard({ task, onDragStart, onOpen }: { task: Task; onDragStart?: (id: string) => void; onOpen?: (task: Task) => void }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(task.itemId)}
      onClick={() => onOpen?.(task)}
      style={{
        border: `1px solid ${tokens.line}`, background: tokens.panel, borderRadius: 6,
        padding: "11px 12px", cursor: "grab",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 550, color: tokens.ink, lineHeight: 1.35, letterSpacing: "-0.005em", marginBottom: 8 }}>
        {task.title}
      </div>
      {task.repo && (
        <div className="mono" style={{ fontSize: 11, color: tokens.ink2, letterSpacing: "-0.01em", marginBottom: 9 }}>
          {task.repo}{task.branch ? ` : ${task.branch}` : ""}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {task.build && (
          <span style={{ textTransform: "uppercase", fontSize: 10, fontWeight: 600, color: tokens.chipInk, background: tokens.chip, padding: "2px 6px", borderRadius: 4 }}>
            {task.build}
          </span>
        )}
        {task.category && (
          <span style={{ fontSize: 11, color: tokens.ink2, border: `1px solid ${tokens.line}`, padding: "1px 6px", borderRadius: 4 }}>
            {task.category}
          </span>
        )}
        {task.source && (
          <span style={{ fontSize: 11, color: tokens.ink3, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: tokens.ink3 }} />
            {task.source}
          </span>
        )}
      </div>
    </div>
  );
}
