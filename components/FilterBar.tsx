"use client";
import type { Build } from "@/lib/types";
import { tokens } from "@/lib/tokens";

export function FilterBar({ fBuild, setFBuild, builds, children }: {
  fBuild: "All" | Build; setFBuild: (b: "All" | Build) => void;
  builds: string[];
  children?: React.ReactNode;
}) {
  const selStyle: React.CSSProperties = { appearance: "none", background: tokens.panel, color: tokens.ink, border: `1px solid ${tokens.line}`, borderRadius: 5, padding: "5px 9px", fontSize: 12.5, cursor: "pointer" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 22px", borderBottom: `1px solid ${tokens.line}` }}>
      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: tokens.ink3 }}>Filter</span>
      <select aria-label="Build" value={fBuild} onChange={(e) => setFBuild(e.target.value as "All" | Build)} style={selStyle}>
        <option value="All">All builds</option>
        {builds.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <div style={{ flex: 1 }} />
      {children}
    </div>
  );
}
