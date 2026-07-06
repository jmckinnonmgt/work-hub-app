"use client";
import { AppClient } from "./AppClient";
import { DEMO_DATA } from "@/lib/demo-data";
import { tokens } from "@/lib/tokens";

export function DemoApp({ onExit }: { onExit: () => void }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: tokens.accentSoft, color: tokens.accent, fontSize: 12.5, borderBottom: `1px solid ${tokens.line}` }}>
        <span>Demo mode - example data, not connected to any account.</span>
        <button onClick={onExit} style={{ marginLeft: "auto", background: "transparent", color: tokens.accent, border: `1px solid ${tokens.accent}`, borderRadius: 5, padding: "3px 10px", cursor: "pointer", fontSize: 12 }}>Exit demo</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <AppClient initial={DEMO_DATA} demo />
      </div>
    </div>
  );
}
