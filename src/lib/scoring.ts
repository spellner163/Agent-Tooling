import { ESTATE } from "../data/estate";
import { C, F, copies, plural } from "./model";
import type { Agent, Component } from "./types";

/* Two scoring schemes, chosen by the Score toggle in the guide bar.
   "prd":     Readiness, PRD v6 / MVP requirements §4.1. The shipped criteria with the PRD's weights, out of 55, shown as a percentage.
              Runs and failed runs are value signals (§4.2), not readiness. Decision complexity is informational, 0 points.
   "shipped": Agent Tool Scoring as shipped (Jira ITEM-182 §3). Nine metrics, out of 100, with Include Runtime Data ON. */
export type ScoreMode = "prd" | "shipped";

export interface ScoreDef {
  name: string; max: number; desc: string; info?: boolean;
  value: (c: Component) => number;
  fmt: (v: number) => string;
  /* [threshold, points, label], highest threshold first; the first band whose threshold the value reaches wins */
  bands: [number, number, string][];
}

const secretCount = (c: Component) => { const b = c.blockers.find((x) => x.name === "Hard-coded secret"); return b ? parseInt(b.why, 10) || 1 : 0; };

export const PRD_DEFS: ScoreDef[] = [
  { name: "Actions", max: 10, desc: "Actions in the tree after migration artifacts (expression shims, guards) are stripped. Larger consolidated tools are fine, so the weight is 10.", value: (c) => c.actions, fmt: (v) => plural(v, "action"), bands: [[151, 0, "151+ actions"], [101, 2, "101-150 actions"], [71, 4, "71-100 actions"], [41, 6, "41-70 actions"], [21, 8, "21-40 actions"], [0, 10, "1-20 actions"]] },
  { name: "Inputs", max: 10, desc: "Inputs the agent must supply. Outputs are required, not a cost, so they are not counted.", value: (c) => c.inputs.length, fmt: (v) => plural(v, "input"), bands: [[11, 0, "11+ inputs"], [7, 4, "7-10 inputs"], [3, 7, "3-6 inputs"], [0, 10, "0-2 inputs"]] },
  { name: "Applications and Integrations", max: 15, desc: "Applications, databases, file systems and API calls used.", value: (c) => c.apps.length, fmt: (v) => plural(v, "application"), bands: [[6, 0, "6+ applications"], [4, 5, "4-5 applications"], [2, 10, "2-3 applications"], [0, 15, "0-1 application"]] },
  { name: "Hardcoded Sensitive Values", max: 5, desc: "Hardcoded emails, credentials, file paths and similar values. Also raised as a blocker.", value: secretCount, fmt: (v) => (v ? plural(v, "instance") : "none detected"), bands: [[4, 0, "4+ instances"], [1, 3, "1-3 instances"], [0, 5, "None detected"]] },
  { name: "Undeclared Variables", max: 10, desc: "Values read from the parent that the subflow does not declare, framework globals excluded. Exact for local subflows.", value: (c) => c.hiddenInputs.length + c.configInputs.length, fmt: (v) => plural(v, "reference"), bands: [[4, 0, "4+ references"], [1, 6, "1-3 references"], [0, 10, "None"]] },
  { name: "Error Handling", max: 5, desc: "5 if errors reach the caller (a throw, or every block handler rethrows); 3 if some handlers swallow errors; 0 if all swallow or none exist.", value: (c) => c.effort.exception, fmt: (v) => (v >= 5 ? "errors reach the caller" : v >= 3 ? "some handlers swallow" : "swallowed, or none"), bands: [[5, 5, "Errors reach the caller"], [3, 3, "Some handlers swallow"], [0, 0, "All swallow, or no handling"]] },
  { name: "Decision Complexity", max: 0, info: true, desc: "If branches, switch cases and loops, counted after the artifact filter. Informational only; no points.", value: (c) => c.branches, fmt: (v) => `${v} branches/loops`, bands: [[0, 0, "informational"]] },
];

export const SHIPPED_DEFS: ScoreDef[] = [
  { name: "Total Runs", max: 20, desc: "Runs per month, from Flow Activity. A subflow uses its flow's runs.", value: (c) => F[c.flow].runs12m / 12, fmt: (v) => `${Math.round(v)} runs/month`, bands: [[50, 20, "50+ runs/month"], [20, 15, "20-49 runs/month"], [10, 10, "10-19 runs/month"], [1, 5, "1-9 runs/month"], [0, 0, "0 runs/month"]] },
  { name: "Total Failed Runs", max: 10, desc: "Failed runs as a percentage of total runs, from Flow Activity.", value: (c) => Math.round((1 - F[c.flow].successRate) * 100), fmt: (v) => `${v}% failed`, bands: [[36, 0, "36%+"], [21, 2, "21-35%"], [11, 5, "11-20%"], [6, 8, "6-10%"], [0, 10, "0-5%"]] },
  { name: "Actions", max: 20, desc: "Number of actions in the subflow or flow.", value: (c) => c.actions, fmt: (v) => plural(v, "action"), bands: [[151, 0, "151+ actions"], [101, 4, "100-150 actions"], [71, 8, "71-100 actions"], [41, 12, "41-70 actions"], [21, 16, "21-40 actions"], [0, 20, "1-20 actions"]] },
  { name: "Arguments", max: 10, desc: "Input and output arguments declared on the subflow or flow.", value: (c) => c.inputs.length + c.outputs.length, fmt: (v) => plural(v, "argument"), bands: [[11, 0, "10+ arguments"], [7, 4, "7-10 arguments"], [3, 7, "3-6 arguments"], [0, 10, "0-2 arguments"]] },
  { name: "Applications and Integrations", max: 15, desc: "Applications, databases, file systems and API calls used.", value: (c) => c.apps.length, fmt: (v) => plural(v, "application"), bands: [[6, 0, "6+ applications"], [4, 5, "4-5 applications"], [2, 10, "2-3 applications"], [0, 15, "0-1 application"]] },
  { name: "Hardcoded Sensitive Values", max: 5, desc: "Hardcoded emails, credentials, file paths and similar values.", value: secretCount, fmt: (v) => (v ? plural(v, "instance") : "none detected"), bands: [[4, 0, "4+ instances"], [1, 3, "1-3 instances"], [0, 5, "None detected"]] },
  { name: "Undeclared Variables", max: 5, desc: "Variables referenced in the subflow but not declared in it.", value: (c) => c.hiddenInputs.length + c.configInputs.length, fmt: (v) => plural(v, "reference"), bands: [[4, 0, "4+ references"], [1, 3, "1-3 references"], [0, 5, "None"]] },
  { name: "Decision Complexity", max: 10, desc: "If branches, switch cases and loops.", value: (c) => c.branches, fmt: (v) => `${v} branches/loops`, bands: [[11, 0, "11+ branches/loops"], [6, 4, "6-10 branches/loops"], [3, 7, "3-5 branches/loops"], [0, 10, "0-2 branches/loops"]] },
  { name: "Error Handling", max: 5, desc: "Structured: an On Error block around the whole subflow (70% or more covered). Partial: some actions covered, or action-level only.", value: (c) => c.effort.exception, fmt: (v) => (v >= 5 ? "structured" : v >= 3 ? "partial or action-level" : "none"), bands: [[5, 5, "Structured error handling"], [3, 3, "Partial or action-level only"], [0, 0, "None"]] },
];

export interface ScoreRow { d: ScoreDef; v: number; pts: number; band: string }
export interface Score { rows: ScoreRow[]; total: number; max: number; pct: number }

export function scoreOf(c: Component, mode: ScoreMode): Score {
  const defs = mode === "shipped" ? SHIPPED_DEFS : PRD_DEFS;
  const rows = defs.map((d) => { const v = d.value(c); const b = d.bands.find((x) => v >= x[0]) || d.bands[d.bands.length - 1]; return { d, v, pts: b[1], band: b[2] }; });
  const total = rows.reduce((s, r) => s + r.pts, 0), max = rows.reduce((s, r) => s + r.d.max, 0);
  return { rows, total, max, pct: Math.round((total / max) * 100) };
}
export const gradeOf = (p: number): [string, "ok" | "warn" | "orange" | "fail"] => (p >= 80 ? ["Strong Candidate", "ok"] : p >= 60 ? ["Good Candidate", "warn"] : p >= 40 ? ["Fair Candidate", "orange"] : ["Poor Candidate", "fail"]);
/* The number a row shows: readiness % in PRD mode, the score out of 100 in shipped mode (both are 0-100). */
export const effortPct = (c: Component, mode: ScoreMode) => scoreOf(c, mode).pct;

/* Value (PRD §4.2): three signals, each as a percentile within this estate, averaged. A missing signal is left out and named; no data is never 0. */
export interface ValueSignal { name: string; value: (c: Component) => number | null; fmt: (v: number) => string; inherited?: boolean }
export const VALUE_SIGNALS: ValueSignal[] = [
  { name: "Runs, 12 months", value: (c) => F[c.flow].runs12m, fmt: (v) => v.toLocaleString(), inherited: true },
  { name: "Success rate", value: (c) => F[c.flow].successRate, fmt: (v) => Math.round(v * 100) + "%", inherited: true },
  { name: "Copies across flows", value: (c) => copies(c) || 1, fmt: (v) => plural(v, "flow") },
];
const pctile = (vals: number[], x: number) => { const n = vals.length; if (!n) return null; let below = 0, eq = 0; vals.forEach((v) => { if (v < x) below++; else if (v === x) eq++; }); return (below + eq / 2) / n; };
let VALUE_POOL: number[][] | null = null;
export interface ValueRow { s: ValueSignal; v: number | null; p: number | null }
export interface Value { rows: ValueRow[]; score: number | null; missing: string[] }
export function valueOf(c: Component): Value {
  if (!VALUE_POOL) { const vis = ESTATE.components.filter((x) => !x.hidden); VALUE_POOL = VALUE_SIGNALS.map((s) => vis.map(s.value).filter((v): v is number => v != null)); }
  const pool = VALUE_POOL;
  const rows = VALUE_SIGNALS.map((s, i) => { const v = s.value(c); const p = v == null ? null : pctile(pool[i], v); return { s, v, p }; });
  const have = rows.filter((r) => r.p != null), missing = rows.filter((r) => r.p == null).map((r) => r.s.name);
  const score = have.length ? Math.round((have.reduce((a, r) => a + (r.p as number), 0) / have.length) * 100) : null;
  return { rows, score, missing };
}

/* Agent columns (PRD §6): ready count, needs-prep count, runs behind the tools, blockers to resolve. No agent-level score, on purpose. */
export function agentStats(a: Agent) {
  const tools = a.tools.map((t) => C[t.c]);
  const ready = a.tools.filter((t) => t.mode === "ready to connect").length;
  const runs12m = [...new Set(tools.map((c) => c.flow))].reduce((s, f) => s + F[f].runs12m, 0);
  return { ready, prep: a.tools.length - ready, runs12m, blockers: tools.reduce((s, c) => s + c.blockers.length, 0) };
}
