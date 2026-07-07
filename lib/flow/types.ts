export type FlowNodeType = "lane" | "pr" | "prod";

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  notes: string;
  x: number;
  y: number;
  pr?: string;       // pr nodes only
  merged?: boolean;  // pr nodes only
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
}

export interface FlowDiagram {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowState {
  builds: string[];
  active: string;
  diagrams: Record<string, FlowDiagram>;
}
