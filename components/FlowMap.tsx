"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FlowDiagram, FlowNode, FlowNodeType, FlowState } from "@/lib/flow/types";
import { tokens } from "@/lib/tokens";
import { addBuild, addEdge, addNode, deleteBuild, deleteEdge, deleteNode, moveNode, renameBuild, updateNode } from "@/lib/flow/model";

// Approx node sizes used for centering edges / geometry (per design README).
const SIZE: Record<FlowNodeType, { w: number; h: number }> = {
  lane: { w: 212, h: 80 },
  pr: { w: 172, h: 64 },
  prod: { w: 196, h: 70 },
};

function geom(n: FlowNode): { w: number; h: number } {
  const lines = n.notes ? n.notes.split("\n").length : 0;
  if (n.type === "lane") return { w: 212, h: Math.max(80, 40 + lines * 16) };
  if (n.type === "prod") return { w: 196, h: 70 };
  return { w: 172, h: Math.max(48, 28 + 18 + lines * 16 + (n.pr ? 18 : 0)) };
}

type DragInfo = { id: string; sx: number; sy: number; ox: number; oy: number };
type PanInfo = { sx: number; sy: number; sl: number; st: number };

export function FlowMap({ state, onChange }: { state: FlowState; onChange: (next: FlowState) => void }) {
  const [st, setSt] = useState<FlowState>(state);
  const stRef = useRef(st);
  stRef.current = st;

  useEffect(() => {
    onChange(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st]);

  const [selected, setSelected] = useState<string | null>(null);
  const [linking, setLinking] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [tabDraft, setTabDraft] = useState("");

  const dragRef = useRef<DragInfo | null>(null);
  const panRef = useRef<PanInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const diagram = st.diagrams[st.active];
  const setDiagram = (nd: FlowDiagram) => setSt((s) => ({ ...s, diagrams: { ...s.diagrams, [s.active]: nd } }));

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = dragRef.current;
      if (d) {
        const dx = e.clientX - d.sx;
        const dy = e.clientY - d.sy;
        const s = stRef.current;
        const dia = s.diagrams[s.active];
        setDiagram(moveNode(dia, d.id, d.ox + dx, d.oy + dy));
        return;
      }
      const p = panRef.current;
      if (p) {
        const el = scrollRef.current;
        if (el) {
          el.scrollLeft = p.sl - (e.clientX - p.sx);
          el.scrollTop = p.st - (e.clientY - p.sy);
        }
      }
    }
    function onUp() {
      if (dragRef.current) dragRef.current = null;
      if (panRef.current) {
        panRef.current = null;
        setPanning(false);
      }
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const geomOf = useMemo(() => {
    const map: Record<string, { w: number; h: number }> = {};
    for (const n of diagram.nodes) map[n.id] = geom(n);
    return map;
  }, [diagram.nodes]);

  let maxX = 1040, maxY = 430;
  for (const n of diagram.nodes) {
    const g = geomOf[n.id];
    maxX = Math.max(maxX, n.x + g.w);
    maxY = Math.max(maxY, n.y + g.h);
  }
  const canvasW = maxX + 160, canvasH = maxY + 120;

  const nmap = useMemo(() => {
    const m: Record<string, FlowNode> = {};
    for (const n of diagram.nodes) m[n.id] = n;
    return m;
  }, [diagram.nodes]);

  const cx = (n: FlowNode) => n.x + geomOf[n.id].w / 2;
  const cy = (n: FlowNode) => n.y + geomOf[n.id].h / 2;

  const edgeVals = diagram.edges
    .filter((e) => nmap[e.from] && nmap[e.to])
    .map((e) => {
      const a = nmap[e.from], b = nmap[e.to];
      const x1 = cx(a), y1 = cy(a), x2 = cx(b), y2 = cy(b);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return { id: e.id, x1, y1, x2, y2, mx, my };
    });

  const selectedNode = selected ? nmap[selected] ?? null : null;

  function handleNodeDown(id: string, e: React.PointerEvent) {
    e.stopPropagation();
    if (linking) {
      if (linking !== id) setDiagram(addEdge(diagram, linking, id));
      setLinking(null);
      setSelected(id);
      return;
    }
    const n = nmap[id];
    if (!n) return;
    setSelected(id);
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y };
  }

  function handleCanvasDown(e: React.PointerEvent) {
    const el = scrollRef.current;
    panRef.current = { sx: e.clientX, sy: e.clientY, sl: el ? el.scrollLeft : 0, st: el ? el.scrollTop : 0 };
    setSelected(null);
    setLinking(null);
    setPanning(true);
  }

  function handleAdd(type: FlowNodeType) {
    const { diagram: nd, id } = addNode(diagram, type);
    setDiagram(nd);
    setSelected(id);
  }

  function handleStartLink() {
    if (!selected) return;
    setLinking((cur) => (cur ? null : selected));
  }

  function handleDeleteEdge(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDiagram(deleteEdge(diagram, id));
  }

  function handleDeleteSelected() {
    if (!selected) return;
    setDiagram(deleteNode(diagram, selected));
    setSelected(null);
    setLinking(null);
  }

  function selectTab(b: string) {
    setSt((s) => ({ ...s, active: b }));
    setSelected(null);
    setLinking(null);
  }

  function renameStart(b: string) {
    setEditingTab(b);
    setTabDraft(b);
  }

  function commitTab() {
    const from = editingTab;
    if (!from) return;
    const to = tabDraft.trim();
    if (!to || to === from || st.builds.includes(to)) {
      setEditingTab(null);
      return;
    }
    setSt((s) => renameBuild(s, from, to));
    setEditingTab(null);
    setTabDraft("");
  }

  function handleAddBuild() {
    let i = 1, name = "";
    const set = new Set(st.builds);
    do {
      name = "Build " + i;
      i++;
    } while (set.has(name));
    setSt((s) => addBuild(s, name));
    setSelected(null);
    setLinking(null);
    setEditingTab(name);
    setTabDraft(name);
  }

  function handleDeleteBuild(b: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSt((s) => deleteBuild(s, b));
  }

  const linkFg = linking ? tokens.accent : tokens.ink2;
  const linkBg = linking ? tokens.accentSoft : tokens.panel;
  const linkBorder = linking ? tokens.accent : tokens.line;
  const hint = linking ? "Click the shape to connect to" : selected ? "Drag to move · edit in the panel" : "Click a shape to edit · drag to move";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", background: tokens.bg, color: tokens.ink }}>
      {/* Toolbar */}
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", borderBottom: `1px solid ${tokens.line}` }}>
        <span style={{ fontSize: 13, fontWeight: 650, letterSpacing: "-0.01em", color: tokens.ink, marginRight: 6 }}>{st.active} pipeline</span>
        <button onClick={() => handleAdd("lane")} style={toolbarBtnStyle()}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1.5 7 h8" /><path d="M8 4 l3 3 l-3 3" /></svg>
          Branch lane
        </button>
        <button onClick={() => handleAdd("pr")} style={toolbarBtnStyle()}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="3" width="11" height="8" rx="1.3" /></svg>
          PR / feature
        </button>
        <button onClick={() => handleAdd("prod")} style={toolbarBtnStyle()}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1.5" y="3.5" width="11" height="7" rx="0.8" /></svg>
          Prod box
        </button>
        <button
          onClick={handleStartLink}
          disabled={!selected && !linking}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: linkFg, background: linkBg, border: `1px solid ${linkBorder}`, borderRadius: 5, padding: "5px 10px", cursor: "pointer" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 9 L9 5" /><path d="M8 3.2 a2.4 2.4 0 0 1 3.4 3.4 l-1.3 1.3" /><path d="M6 10.8 a2.4 2.4 0 0 1 -3.4 -3.4 l1.3 -1.3" /></svg>
          {linking ? "Linking…" : "Link"}
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: tokens.ink3 }}>{hint}</span>
      </div>

      {/* Middle: canvas + inspector */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div ref={scrollRef} style={{ flex: 1, minWidth: 0, overflow: "auto", position: "relative", background: tokens.bg }}>
          <div
            onPointerDown={handleCanvasDown}
            style={{
              position: "relative",
              minWidth: canvasW, minHeight: canvasH, width: canvasW, height: canvasH,
              backgroundImage: `radial-gradient(circle, ${tokens.chip} 1px, transparent 1px)`,
              backgroundSize: "22px 22px",
              cursor: linking ? "crosshair" : panning ? "grabbing" : "grab",
            }}
          >
            <svg width={canvasW} height={canvasH} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", zIndex: 0 }}>
              {edgeVals.map((e) => (
                <g key={e.id}>
                  <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={tokens.ink3} strokeWidth={1.5} />
                  <circle
                    cx={e.mx} cy={e.my} r={6}
                    fill={tokens.panel} stroke={tokens.ink3} strokeWidth={1.2}
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                    onClick={(ev) => handleDeleteEdge(e.id, ev)}
                  />
                </g>
              ))}
            </svg>

            {diagram.nodes.map((n) => {
              const g = geomOf[n.id];
              const sel = selected === n.id;
              const wrapStyle: React.CSSProperties = {
                position: "absolute", left: n.x, top: n.y, width: g.w, height: g.h,
                cursor: dragRef.current ? "grabbing" : "grab",
                zIndex: sel ? 4 : 2, touchAction: "none", userSelect: "none",
              };
              return (
                <div key={n.id} style={wrapStyle} onPointerDown={(e) => handleNodeDown(n.id, e)}>
                  {n.type === "lane" && <LaneShape n={n} w={g.w} h={g.h} selected={sel} />}
                  {n.type === "pr" && <PrShape n={n} selected={sel} />}
                  {n.type === "prod" && <ProdShape n={n} selected={sel} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector */}
        <div style={{ width: 246, flex: "none", borderLeft: `1px solid ${tokens.line}`, background: tokens.panel2, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {selectedNode ? (
            <Inspector
              node={selectedNode}
              linking={linking === selectedNode.id}
              onType={(type) => setDiagram(updateNode(diagram, selectedNode.id, type === "pr" ? { type, pr: selectedNode.pr ?? "", merged: selectedNode.merged ?? false } : { type }))}
              onLabel={(label) => setDiagram(updateNode(diagram, selectedNode.id, { label }))}
              onNotes={(notes) => setDiagram(updateNode(diagram, selectedNode.id, { notes }))}
              onPr={(pr) => setDiagram(updateNode(diagram, selectedNode.id, { pr }))}
              onToggleMerged={() => setDiagram(updateNode(diagram, selectedNode.id, { merged: !selectedNode.merged }))}
              onLink={handleStartLink}
              onDelete={handleDeleteSelected}
            />
          ) : (
            <NoSelection />
          )}
        </div>
      </div>

      {/* Bottom build tabs */}
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderTop: `1px solid ${tokens.line}`, background: tokens.panel2, overflowX: "auto" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.ink3, fontWeight: 600, padding: "0 6px", flex: "none" }}>Builds</span>
        {st.builds.map((b) => {
          const active = st.active === b;
          const editing = editingTab === b;
          if (editing) {
            return (
              <input
                key={b}
                autoFocus
                value={tabDraft}
                onChange={(e) => setTabDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  else if (e.key === "Escape") setEditingTab(null);
                }}
                onBlur={commitTab}
                style={{ width: 90, border: `1px solid ${tokens.accent}`, background: tokens.panel, color: tokens.ink, borderRadius: "5px 5px 0 0", padding: "5px 8px", fontSize: 12, fontWeight: 600, outline: "none", flex: "none" }}
              />
            );
          }
          return (
            <div
              key={b}
              onClick={() => selectTab(b)}
              onDoubleClick={() => renameStart(b)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, flex: "none", cursor: "pointer",
                fontSize: 12, fontWeight: active ? 600 : 500, padding: "6px 11px",
                borderRadius: "5px 5px 0 0",
                border: `1px solid ${active ? tokens.line : "transparent"}`,
                borderBottom: active ? `1px solid ${tokens.panel}` : "1px solid transparent",
                marginBottom: -8,
                background: active ? tokens.panel : "transparent",
                color: active ? tokens.ink : tokens.ink3,
              }}
            >
              <span>{b}</span>
              {st.builds.length > 1 && active && (
                <span onClick={(e) => handleDeleteBuild(b, e)} style={{ fontSize: 13, lineHeight: 1, color: tokens.ink3, padding: "0 1px" }}>×</span>
              )}
            </div>
          );
        })}
        <button
          onClick={handleAddBuild}
          style={{ flex: "none", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: tokens.ink3, background: "transparent", border: `1px solid ${tokens.line}`, borderRadius: 5, cursor: "pointer" }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function toolbarBtnStyle(): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: tokens.ink2, background: tokens.panel, border: `1px solid ${tokens.line}`, borderRadius: 5, padding: "5px 10px", cursor: "pointer" };
}

function LaneShape({ n, w, h, selected }: { n: FlowNode; w: number; h: number; selected: boolean }) {
  const nx = +(w * 0.7).toFixed(1), t = +(h * 0.18).toFixed(1), b = +(h * 0.82).toFixed(1), mid = +(h * 0.5).toFixed(1);
  const points = `0,${t} ${nx},${t} ${nx},0 ${w},${mid} ${nx},${h} ${nx},${b} 0,${b}`;
  return (
    <>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, display: "block" }}>
        <polygon points={points} fill={tokens.panel} stroke={selected ? tokens.accent : tokens.ink2} strokeWidth={selected ? 2.4 : 1.6} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 12, top: 0, width: w * 0.66 - 14, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2px 2px", pointerEvents: "none" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink, lineHeight: 1.2 }}>{n.label}</div>
        {n.notes && <div style={{ fontSize: 10.5, color: tokens.ink2, whiteSpace: "pre-line", lineHeight: 1.3, marginTop: 3 }}>{n.notes}</div>}
      </div>
    </>
  );
}

function PrShape({ n, selected }: { n: FlowNode; selected: boolean }) {
  const prColor = n.merged ? tokens.status.done : tokens.status.blocked;
  return (
    <div
      style={{
        width: "100%", height: "100%", boxSizing: "border-box",
        border: `1.5px solid ${selected ? tokens.accent : tokens.line}`,
        background: tokens.panel, borderRadius: 6, padding: "8px 10px",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 4,
        boxShadow: selected ? `0 0 0 3px ${tokens.accentSoft}` : "none",
      }}
    >
      <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: tokens.ink, lineHeight: 1.2 }}>{n.label}</div>
      {n.notes && <div style={{ fontSize: 10.5, color: tokens.ink2, whiteSpace: "pre-line", lineHeight: 1.3 }}>{n.notes}</div>}
      {n.pr && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: prColor }}>{n.pr}</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: prColor, flex: "none" }} />
          <span style={{ fontSize: 9.5, letterSpacing: "0.05em", textTransform: "uppercase", color: prColor }}>{n.merged ? "merged" : "open"}</span>
        </div>
      )}
    </div>
  );
}

function ProdShape({ n, selected }: { n: FlowNode; selected: boolean }) {
  return (
    <div
      style={{
        width: "100%", height: "100%", boxSizing: "border-box",
        border: `2px solid ${selected ? tokens.accent : tokens.ink}`,
        background: tokens.panel, borderRadius: 3, padding: "8px 10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: selected ? `0 0 0 3px ${tokens.accentSoft}` : "none",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 650, letterSpacing: "-0.01em", color: tokens.ink, textAlign: "center", width: "100%" }}>{n.label}</div>
    </div>
  );
}

function segStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, fontSize: 11.5, fontWeight: 600, padding: "6px 0", borderRadius: 5, cursor: "pointer",
    border: `1px solid ${active ? tokens.accent : tokens.line}`,
    background: active ? tokens.accentSoft : tokens.panel,
    color: active ? tokens.accent : tokens.ink2,
  };
}

function Inspector({
  node, linking, onType, onLabel, onNotes, onPr, onToggleMerged, onLink, onDelete,
}: {
  node: FlowNode;
  linking: boolean;
  onType: (t: FlowNodeType) => void;
  onLabel: (v: string) => void;
  onNotes: (v: string) => void;
  onPr: (v: string) => void;
  onToggleMerged: () => void;
  onLink: () => void;
  onDelete: () => void;
}) {
  const isPr = node.type === "pr";
  return (
    <div style={{ padding: "15px 15px 18px" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.ink3, fontWeight: 600, marginBottom: 12 }}>Edit shape</div>

      <div style={{ fontSize: 11, color: tokens.ink2, marginBottom: 6 }}>Type</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        <button onClick={() => onType("lane")} style={segStyle(node.type === "lane")}>Lane</button>
        <button onClick={() => onType("pr")} style={segStyle(isPr)}>PR</button>
        <button onClick={() => onType("prod")} style={segStyle(node.type === "prod")}>Prod</button>
      </div>

      <div style={{ fontSize: 11, color: tokens.ink2, marginBottom: 6 }}>Name</div>
      <input
        value={node.label}
        onChange={(e) => onLabel(e.target.value)}
        style={{ width: "100%", border: `1px solid ${tokens.line}`, background: tokens.panel, color: tokens.ink, borderRadius: 5, padding: "7px 9px", fontSize: 13, outline: "none", marginBottom: 14 }}
      />

      <div style={{ fontSize: 11, color: tokens.ink2, marginBottom: 6 }}>Notes / held branches</div>
      <textarea
        value={node.notes}
        onChange={(e) => onNotes(e.target.value)}
        rows={4}
        placeholder={"e.g.\n• fix/brandlogo\n• fix/update"}
        style={{ width: "100%", border: `1px solid ${tokens.line}`, background: tokens.panel, color: tokens.ink, borderRadius: 5, padding: "7px 9px", fontSize: 12, lineHeight: 1.4, outline: "none", resize: "vertical", marginBottom: 14 }}
      />

      {isPr && (
        <>
          <div style={{ fontSize: 11, color: tokens.ink2, marginBottom: 6 }}>PR reference</div>
          <input
            className="mono"
            value={node.pr ?? ""}
            onChange={(e) => onPr(e.target.value)}
            placeholder="e.g. PR #30"
            style={{ width: "100%", border: `1px solid ${tokens.line}`, background: tokens.panel, color: tokens.ink, borderRadius: 5, padding: "7px 9px", fontSize: 12, outline: "none", marginBottom: 12 }}
          />
          <button
            onClick={onToggleMerged}
            style={{
              width: "100%", fontSize: 12.5, fontWeight: 600, padding: 8, borderRadius: 5, cursor: "pointer",
              border: `1px solid ${node.merged ? tokens.status.done : tokens.line}`,
              background: node.merged ? tokens.accentSoft : tokens.panel,
              color: node.merged ? tokens.status.done : tokens.ink2,
            }}
          >
            {node.merged ? "✓ Merged to target" : "Mark as merged"}
          </button>
        </>
      )}

      <div style={{ height: 1, background: tokens.line, margin: "16px 0" }} />
      <button
        onClick={onLink}
        style={{
          width: "100%", fontSize: 12.5, fontWeight: 600, borderRadius: 5, padding: 8, cursor: "pointer", marginBottom: 8,
          color: linking ? tokens.accent : tokens.ink2,
          background: linking ? tokens.accentSoft : tokens.panel,
          border: `1px solid ${linking ? tokens.accent : tokens.line}`,
        }}
      >
        {linking ? "Click a target shape…" : "Link to shape…"}
      </button>
      <button onClick={onDelete} style={{ width: "100%", fontSize: 12.5, fontWeight: 500, color: tokens.status.blocked, background: "transparent", border: `1px solid ${tokens.line}`, borderRadius: 5, padding: 8, cursor: "pointer" }}>
        Delete shape
      </button>
    </div>
  );
}

function NoSelection() {
  return (
    <div style={{ padding: "16px 15px" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.ink3, fontWeight: 600, marginBottom: 12 }}>How to use</div>
      <div style={{ fontSize: 12, color: tokens.ink2, lineHeight: 1.55, marginBottom: 16 }}>
        Click a shape to edit its name, notes and status. Drag to move. Use <b style={{ color: tokens.ink, fontWeight: 600 }}>Link</b> to connect two shapes.
      </div>
      <div style={{ fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.ink3, fontWeight: 600, marginBottom: 10 }}>Legend</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="34" height="20" viewBox="0 0 34 20"><polygon points="0,4 22,4 22,0 34,10 22,20 22,16 0,16" fill={tokens.panel} stroke={tokens.ink2} strokeWidth={1.4} /></svg>
          <span style={{ fontSize: 11.5, color: tokens.ink2 }}>Long-standing branch</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="34" height="20" viewBox="0 0 34 20"><rect x="1" y="2" width="32" height="16" rx="3" fill={tokens.panel} stroke={tokens.line} strokeWidth={1.4} /></svg>
          <span style={{ fontSize: 11.5, color: tokens.ink2 }}>PR / feature branch</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="34" height="20" viewBox="0 0 34 20"><rect x="1" y="2" width="32" height="16" rx="1" fill={tokens.panel} stroke={tokens.ink} strokeWidth={2} /></svg>
          <span style={{ fontSize: 11.5, color: tokens.ink2 }}>Prod / main</span>
        </div>
      </div>
    </div>
  );
}
