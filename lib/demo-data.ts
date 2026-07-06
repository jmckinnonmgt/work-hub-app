import type { ProjectData, Task } from "@/lib/types";

const t = (
  itemId: string, title: string, build: Task["build"], category: Task["category"],
  source: Task["source"], column: Task["column"], repo = "", branch = "",
): Task => ({ itemId, issueNumber: 0, title, url: "", build, category, source, column, repo, branch });

const opt = (id: string, name: string) => ({ id, name });

export const DEMO_DATA: ProjectData = {
  meta: {
    projectId: "DEMO",
    status: { id: "st", name: "Status", options: [opt("s1","Backlog"),opt("s2","Next"),opt("s3","In progress"),opt("s4","Blocked"),opt("s5","Done")] },
    category: { id: "ct", name: "Category", options: [opt("c1","Task"),opt("c2","Overnight review"),opt("c3","Learn"),opt("c4","Meeting"),opt("c5","Branch-context")] },
    build: { id: "bd", name: "Build", options: [opt("b1","Alpha"),opt("b2","Beta"),opt("b3","Gamma"),opt("b4","General")] },
    source: { id: "sr", name: "Source", options: [opt("o1","Global team"),opt("o2","Mentor"),opt("o3","Self")] },
    repoNameFieldId: "rf", branchFieldId: "bf",
  },
  tasks: [
    t("d1","Fix login redirect bug","Alpha","Task","Self","inprogress","alpha","fix/login"),
    t("d2","Add rate limiting to the API","Beta","Task","Global team","next","beta","feat/ratelimit"),
    t("d3","Read up on vector databases","General","Learn","Self","backlog"),
    t("d4","Weekly mentor 1:1","General","Meeting","Mentor","next"),
    t("d5","Triage overnight test failures","Gamma","Overnight review","Global team","blocked"),
    t("d6","Refactor the auth module","Alpha","Branch-context","Self","inprogress","alpha","chore/auth"),
    t("d7","Ship the search feature","Beta","Task","Self","done","beta","feat/search"),
    t("d8","Study prompt caching","General","Learn","Mentor","backlog"),
    t("d9","Dataset dedup pass","Gamma","Task","Self","done","gamma","chore/dedup"),
    t("d10","Plan next quarter roadmap","General","Meeting","Global team","next"),
  ],
};
