"use client";
import { tokens, COLUMNS } from "@/lib/tokens";
import type { ColumnId } from "@/lib/types";
import type { View } from "./AppClient";

const icons: Record<View, React.ReactNode> = {
  board: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="2.5" width="3.4" height="11" rx="1"/><rect x="6.3" y="2.5" width="3.4" height="7.5" rx="1"/><rect x="11.1" y="2.5" width="3.4" height="9.5" rx="1"/></svg>,
  table: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="2.5" width="13" height="11" rx="1.2"/><line x1="1.5" y1="6.3" x2="14.5" y2="6.3"/><line x1="6" y1="6.3" x2="6" y2="13.5"/></svg>,
  flow: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="4" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="8" r="2"/><path d="M4 6 v4 M6 4 h2 a2 2 0 0 1 2 2 v0 M6 12 h2 a2 2 0 0 0 2 -2 v0"/></svg>,
  learn: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 2.5 h8 v11 l-4 -2.4 -4 2.4 z"/></svg>,
  administrative: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="3" width="13" height="11" rx="1.2"/><line x1="1.5" y1="6.2" x2="14.5" y2="6.2"/><line x1="5" y1="1.6" x2="5" y2="4"/><line x1="11" y1="1.6" x2="11" y2="4"/></svg>,
};
const NAV: { id: View; label: string }[] = [
  { id: "board", label: "Board" }, { id: "table", label: "Table" }, { id: "flow", label: "Flow" },
  { id: "learn", label: "Learn" }, { id: "administrative", label: "Administrative" },
];

export function NavRail({ view, setView, counts }: { view: View; setView: (v: View) => void; counts: Record<ColumnId, number> }) {
  return (
    <nav style={{ width: 206, flex: "none", borderRight: `1px solid ${tokens.line}`, display: "flex", flexDirection: "column", padding: "16px 12px", gap: 2, background: tokens.panel2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 18px" }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: tokens.accent, color: tokens.onAccent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>W</span>
        <span style={{ fontSize: 14.5, fontWeight: 650, color: tokens.ink }}>Work Hub</span>
      </div>
      {NAV.map((n) => {
        const active = view === n.id;
        return (
          <button key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", padding: "7px 9px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: active ? tokens.accentSoft : "transparent", color: active ? tokens.ink : tokens.ink2 }}>
            {icons[n.id]}<span>{n.label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: `1px solid ${tokens.line}`, marginTop: 8, paddingTop: 13, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.ink3, padding: "0 9px" }}>Columns</span>
        {COLUMNS.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 9px", fontSize: 12, color: tokens.ink2 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: tokens.status[c.id], flex: "none" }} />
            <span style={{ flex: 1 }}>{c.label}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: tokens.ink3 }}>{counts[c.id]}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}
