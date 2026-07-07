import { describe, it, expect } from "vitest";
import { skeleton, addNode, updateNode, moveNode, deleteNode, addEdge, deleteEdge, addBuild, renameBuild, deleteBuild, initialState } from "@/lib/flow/model";

describe("flow model", () => {
  it("skeleton has 3 nodes and 2 edges (Test->Dev->Prod)", () => {
    const d = skeleton();
    expect(d.nodes).toHaveLength(3);
    expect(d.edges).toHaveLength(2);
    expect(d.nodes.map((n) => n.type)).toEqual(["lane", "lane", "prod"]);
  });
  it("addNode appends a node and returns its id; pr nodes get pr/merged", () => {
    const d = skeleton();
    const { diagram, id } = addNode(d, "pr");
    expect(diagram.nodes).toHaveLength(4);
    const n = diagram.nodes.find((x) => x.id === id)!;
    expect(n.type).toBe("pr");
    expect(n.pr).toBe("");
    expect(n.merged).toBe(false);
  });
  it("updateNode/moveNode change fields immutably and clamp to >= 0", () => {
    const d = skeleton();
    const id = d.nodes[0].id;
    expect(updateNode(d, id, { label: "X" }).nodes[0].label).toBe("X");
    expect(d.nodes[0].label).toBe("Test"); // original unchanged
    expect(moveNode(d, id, -5, 10).nodes[0]).toMatchObject({ x: 0, y: 10 });
  });
  it("deleteNode removes the node and any edges touching it", () => {
    const d = skeleton();
    const dev = d.nodes[1].id;
    const out = deleteNode(d, dev);
    expect(out.nodes).toHaveLength(2);
    expect(out.edges).toHaveLength(0); // both edges touched Dev
  });
  it("addEdge ignores self-links and duplicates", () => {
    const d = skeleton();
    const [a, b] = [d.nodes[0].id, d.nodes[2].id];
    const one = addEdge(d, a, b);
    expect(one.edges).toHaveLength(3);
    expect(addEdge(one, a, b).edges).toHaveLength(3); // duplicate ignored
    expect(addEdge(one, b, a).edges).toHaveLength(3); // reverse duplicate ignored
    expect(addEdge(one, a, a).edges).toHaveLength(3); // self ignored
  });
  it("deleteEdge removes by id", () => {
    const d = skeleton();
    const eid = d.edges[0].id;
    expect(deleteEdge(d, eid).edges).toHaveLength(1);
  });
  it("addBuild seeds a skeleton and switches active; dupes ignored", () => {
    const s = initialState(["Alpha"]);
    const s2 = addBuild(s, "Beta");
    expect(s2.builds).toEqual(["Alpha", "Beta"]);
    expect(s2.active).toBe("Beta");
    expect(s2.diagrams["Beta"].nodes).toHaveLength(3);
    expect(addBuild(s2, "Beta")).toBe(s2); // duplicate ignored (same ref)
  });
  it("renameBuild moves the diagram and updates active", () => {
    const s = addBuild(initialState(["Alpha"]), "Beta");
    const r = renameBuild(s, "Beta", "Gamma");
    expect(r.builds).toContain("Gamma");
    expect(r.builds).not.toContain("Beta");
    expect(r.diagrams["Gamma"]).toBeTruthy();
    expect(r.active).toBe("Gamma");
  });
  it("deleteBuild removes a build but never the last one", () => {
    const s = addBuild(initialState(["Alpha"]), "Beta");
    const d = deleteBuild(s, "Beta");
    expect(d.builds).toEqual(["Alpha"]);
    expect(deleteBuild(d, "Alpha")).toBe(d); // last build kept
  });
  it("initialState seeds one skeleton per build", () => {
    const s = initialState(["Alpha", "Beta"]);
    expect(s.builds).toEqual(["Alpha", "Beta"]);
    expect(s.active).toBe("Alpha");
    expect(Object.keys(s.diagrams)).toEqual(["Alpha", "Beta"]);
  });
});
