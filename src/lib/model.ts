import { ESTATE, ACCESS } from "../data/estate";
import type { Agent, AccessKind, Component, Family, Flow, RecordKind, StatusCls } from "./types";

/* Indexes over the estate, built once. The load step also derives each component's access and strips the
   informational "attended machine" note out of the blocker list (it is kept as uiActions). */
export const C: Record<string, Component> = {};
export const F: Record<string, Flow> = {};
export const FAM: Record<string, Family> = {};
export const A: Record<string, Agent> = {};

ESTATE.components.forEach((c) => {
  c.access = ACCESS[c.id] || (c.writes ? "write" : "read");
  c.writes = c.access === "write" || c.access === "readwrite";
  c.readOnly = c.access === "read";
  const ui = c.blockers.find((b) => b.level === "info");
  c.uiActions = ui ? parseInt(ui.why, 10) || 0 : 0;
  c.blockers = c.blockers.filter((b) => b.level !== "info");
  C[c.id] = c;
});
ESTATE.flows.forEach((f) => (F[f.id] = f));
ESTATE.families.forEach((f) => (FAM[f.id] = f));
ESTATE.agents.forEach((a) => (A[a.id] = a));

export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const flowName = (c: Component) => F[c.flow].name;
export const dispName = (c: Component) => (c.kind === "flow" ? flowName(c) : c.name);
export const flowRuns = (c: Component) => F[c.flow].runs12m;
export const failCount = (c: Component) => c.blockers.filter((b) => b.level === "fail").length;
export const copies = (c: Component): number | null => { const f = c.family ? FAM[c.family] : null; return f && !f.scaffolding ? f.copies : null; };

/* Access labels: four values, one bit of safety each side of the line. */
export const ACCESS_LABEL: Record<AccessKind, string> = { read: "Read-only", none: "No data access", write: "Writes only", readwrite: "Reads and writes" };
export const ACCESS_TIP: Record<AccessKind, string> = {
  read: "Looks data up and changes nothing. Safe to call speculatively.",
  none: "Touches no business data: opens a session or moves between screens.",
  write: "Pushes its inputs out without looking anything up first. Calling it changes a system.",
  readwrite: "Looks something up, then changes something. Calling it changes a system.",
};
export const ACCESS_RANK: Record<AccessKind, number> = { none: 0, read: 1, write: 2, readwrite: 3 };

/* Status: the one coloured element in a row. Blocked / Needs prep / Ready, with warnings / Ready. */
export const STATUS_ORDER: StatusCls[] = ["fail", "prep", "warn", "ok"];
export const STATUS_LABEL: Record<StatusCls, string> = { fail: "Blocked", prep: "Needs prep", warn: "Ready, with warnings", ok: "Ready" };
export function statusOf(c: Component): { cls: StatusCls; label: string; rank: number } {
  if (failCount(c)) return { cls: "fail", label: "Blocked", rank: 3 };
  if (!c.wireNow) return { cls: "prep", label: "Needs prep", rank: 2 };
  if (c.blockers.length) return { cls: "warn", label: "Ready, with warnings", rank: 1 };
  return { cls: "ok", label: "Ready", rank: 0 };
}

/* Record kinds (ITEM-459): a flow is the entire process; a sub-tree is a subflow scored with every subflow it calls; a subflow (leaf) calls none. */
export const recKind = (c: Component): RecordKind => (c.kind === "flow" ? "flow" : c.tree.length > 1 ? "subtree" : "subflow");
export function recLabel(c: Component): string {
  const k = recKind(c);
  if (k === "flow") return "Flow";
  const g = c.kind === "global subflow" ? "Global " : "";
  return k === "subtree" ? `${g}Sub-tree · contains ${plural(c.tree.length - 1, "subflow")}` : `${g}Subflow`;
}

/* Agent helpers */
export function instructionsFor(a: Agent): string {
  const ready = a.tools.filter((t) => t.mode === "ready to connect").map((t) => `Call ${dispName(C[t.c])} to ${t.role}.`);
  return `${a.job} ${ready.join(" ")} Ask for any input a tool needs. Report what the tool returns; do not guess figures.`;
}
/* What stands between a suggested tool and Copilot Studio: a needs-prep subflow first becomes its own desktop flow, then its own items. */
export function prepItems(a: Agent, c: Component, mode: string): string[] {
  const out: string[] = [];
  if (mode !== "ready to connect" && c.kind !== "flow") out.push("Make it its own desktop flow");
  (a.prepWork || []).filter((w) => w.c === c.id).forEach((w) => out.push(w.text));
  return out;
}
export function agentAccess(a: Agent): AccessKind {
  const ks = a.tools.map((t) => C[t.c].access as AccessKind);
  const r = ks.some((k) => k === "read" || k === "readwrite"), w = ks.some((k) => k === "write" || k === "readwrite");
  return r && w ? "readwrite" : w ? "write" : r ? "read" : "none";
}
export const A2 = ESTATE.agents.find((a) => a.id === "a2")!;
