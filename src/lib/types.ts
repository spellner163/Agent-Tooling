/* Shapes of the estate data. Kept loose on purpose: the data file is hand-written sample data. */

export type Level = "fail" | "prep" | "warn" | "info";
export type AccessKind = "read" | "none" | "write" | "readwrite";
export type RecordKind = "flow" | "subtree" | "subflow";
export type StatusCls = "fail" | "prep" | "warn" | "ok";

export interface Blocker { name: string; level: Level; why: string }
export interface Claim { type: string; value: string; ref: string; ok: boolean }

export interface Flow {
  id: string; name: string; kind: "flow"; migrated: boolean;
  runs90: number; runs12m: number; hours12m: number; successRate: number; trigger: string; lastRun: string;
}

export interface Effort { actions: number; inputs: number; apps: number; sensitive: number; undeclared: number; exception: number }

export interface Component {
  id: string; flow: string; name: string; kind: "flow" | "local subflow" | "global subflow";
  tree: string[]; inputs: string[]; outputs: string[]; hiddenInputs: string[]; configInputs: string[]; apps: string[];
  actions: number; branches: number; shims: number; guards: number; todos: number;
  hidden: string | null; hiddenWhy?: string; blockers: Blocker[]; effort: Effort; fp: string; family: string | null;
  wireNow?: boolean; writes?: boolean; readOnly?: boolean; selfContained?: boolean; step?: boolean; hollow?: boolean; clone?: boolean;
  role?: string; description?: string; claims?: Claim[];
  /* derived at load */
  access?: AccessKind; uiActions?: number;
}

export interface Family { id: string; fp: string; members: string[]; copies: number; scaffolding: boolean; representative: string; tokens: string; differs: string }

export interface AgentTool { c: string; mode: "ready to connect" | "needs prep"; role: string; climbedFrom?: string[]; writes?: boolean }
export interface Agent {
  id: string; name: string; job: string; tools: AgentTool[];
  proposedAndDropped: { c: string; why: string }[];
  score: { wireNow: number; harvest: number; runs12m: number };
  prepWork: { c: string; text: string }[];
}

export interface Estate {
  name: string; flows: Flow[]; components: Component[]; families: Family[]; agents: Agent[];
  summary: { flows: number; components: number; hidden: number; hiddenPct: number; candidates: number; agents: number };
  describeJob: { canned: { q: string; results: string[] }[] };
}
