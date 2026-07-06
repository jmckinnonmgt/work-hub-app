"use client";
import { useState } from "react";
import { getToken, setToken } from "@/lib/github/token-store";
import { tokens } from "@/lib/tokens";

export function TokenGate({ children }: { children: React.ReactNode }) {
  const [has, setHas] = useState<boolean>(() => !!getToken());
  const [value, setValue] = useState("");
  if (has) return <>{children}</>;
  function save() {
    const v = value.trim();
    if (!v) return;
    setToken(v);
    setHas(true);
  }
  return (
    <main style={{ height: "100vh", display: "grid", placeItems: "center", background: tokens.bg, color: tokens.ink }}>
      <div style={{ width: 380, maxWidth: "90vw", border: `1px solid ${tokens.line}`, borderRadius: 8, padding: 24, background: tokens.panel }}>
        <div style={{ fontSize: 16, fontWeight: 650, marginBottom: 8 }}>Work Hub</div>
        <p style={{ fontSize: 12.5, color: tokens.ink3, lineHeight: 1.5 }}>
          Paste a GitHub personal access token with access to the work-hub repo and its projects. It is stored only in this browser.
        </p>
        <input
          type="password" value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
          placeholder="github_pat_..."
          aria-label="GitHub token"
          style={{ width: "100%", background: tokens.bg, border: `1px solid ${tokens.line}`, color: tokens.ink, borderRadius: 6, padding: "8px 10px", fontSize: 13, marginTop: 12 }}
        />
        <button onClick={save} style={{ marginTop: 12, width: "100%", background: tokens.accent, color: tokens.onAccent, border: "none", borderRadius: 6, padding: "9px 12px", fontSize: 14, cursor: "pointer" }}>Save token</button>
      </div>
    </main>
  );
}
