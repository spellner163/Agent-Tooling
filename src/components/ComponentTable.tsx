/* The flows-and-subflows table, shared by the Flows tab and the Describe a job results. */
import { useEffect, useRef } from "react";
import { ACCESS_RANK, copies, dispName, flowName, flowRuns, recLabel, statusOf, F } from "../lib/model";
import { effortPct, valueOf, type ScoreMode } from "../lib/scoring";
import type { AccessKind, Component } from "../lib/types";
import { useApp } from "../state/store";
import { ModeChips, ScoreWidget, StatusChip, ValueWidget } from "./ui";

export interface Col { k: string; h: string; v: (c: Component, mode: ScoreMode) => number | string; num?: boolean; cls: string; prdOnly?: boolean }
export const COLS: Col[] = [
  { k: "name", h: "Name", v: (c) => dispName(c), cls: "name" },
  { k: "status", h: "Status", v: (c) => (c.hidden ? 9 : statusOf(c).rank), cls: "status" },
  { k: "mode", h: "Access", v: (c) => (c.hidden ? 9 : ACCESS_RANK[c.access as AccessKind]), cls: "access" },
  { k: "effort", h: "Readiness", v: (c, m) => (c.hidden ? -1 : effortPct(c, m)), cls: "effort" },
  { k: "value", h: "Value", v: (c) => (c.hidden ? -1 : valueOf(c).score ?? -1), cls: "value", prdOnly: true },
  { k: "runs", h: "Runs", v: (c) => flowRuns(c), num: true, cls: "runs" },
  { k: "success", h: "Success", v: (c) => F[c.flow].successRate, num: true, cls: "succ" },
  { k: "copies", h: "Copies", v: (c) => copies(c) || 1, num: true, cls: "succ", prdOnly: true },
];
export const TIPS: Record<string, string> = {
  status: "Blocked: cannot be a tool as written. Needs prep: becomes its own desktop flow first. Ready: can be attached today. Click a chip for the detail.",
  effort: "Readiness, out of 55 shown as a percentage: actions, inputs, applications, sensitive values, undeclared variables, error handling. Decision complexity is informational. Click the row for the breakdown.",
  effortShipped: "Agent tool score out of 100 (runs, failed runs, actions, arguments, applications, sensitive values, undeclared variables, decision complexity, error handling). Click the row for the breakdown.",
  value: "Value for ranking: the mean of three signals, each as a percentile within this estate: runs in 12 months, success rate, copies across flows. Click the row for the signals.",
  success: "success rate of the flow; a subflow shows its parent flow's",
  runs: "runs of the flow in the last 12 months, with the 90-day count and trigger beneath; a subflow shows its parent flow's",
  copies: "distinct flows that contain the same code; framework plumbing excluded",
  mode: "What the tool does to data. Read-only: looks up only. No data access: opens a session or moves screens. Writes only: pushes its inputs out. Reads and writes: looks up, then changes.",
};
export const visibleCols = (mode: ScoreMode) => COLS.filter((c) => mode === "prd" || !c.prdOnly).map((c) => (c.k === "effort" && mode === "shipped" ? { ...c, h: "Tool score" } : c));

/* Default order: usable first (Ready, Ready with warnings, Needs prep, Blocked), then score, set-aside rows last. */
export const defaultSort = (mode: ScoreMode) => (a: Component, b: Component) => (+!!a.hidden - +!!b.hidden) || (a.hidden ? 0 : statusOf(a).rank - statusOf(b).rank) || effortPct(b, mode) - effortPct(a, mode) || dispName(a).localeCompare(dispName(b));

function Cell({ c, col, mode }: { c: Component; col: Col; mode: ScoreMode }) {
  switch (col.k) {
    case "name": {
      const sub = c.kind === "flow" ? [] : [`${recLabel(c)} · ${flowName(c)}`];
      if (c.hidden) sub.push(`set aside: ${c.hiddenWhy}`);
      return <><span className="nm">{dispName(c)}</span>{sub.length ? <span className="sub">{sub.join(" · ")}</span> : null}</>;
    }
    case "status": return <StatusChip c={c} />;
    case "effort": return <ScoreWidget c={c} mode={mode} />;
    case "value": return <ValueWidget c={c} />;
    case "runs": { const f = F[c.flow]; return mode === "shipped" ? <>{Math.round(f.runs12m / 12).toLocaleString()}<span className="sub">per month</span></> : <>{f.runs12m.toLocaleString()}<span className="sub">{f.runs90} in 90 d · {f.trigger.split(",")[0].toLowerCase()}</span></>; }
    case "success": return <>{Math.round(F[c.flow].successRate * 100)}%</>;
    case "copies": { const k = copies(c); return k ? <>{k} flows</> : <span className="muted">1 flow</span>; }
    case "mode": return <ModeChips c={c} />;
    default: return <>{String(col.v(c, mode))}</>;
  }
}

export function ComponentTable({ comps, sortable, what }: { comps: Component[]; sortable?: boolean; what?: (c: Component) => React.ReactNode }) {
  const { S, act } = useApp();
  const cols = visibleCols(S.scoreMode);
  const selRef = useRef<HTMLTableRowElement>(null);
  /* A newly selected row is centred in the table so the drawer and the row it describes are on screen together. */
  useEffect(() => { selRef.current?.scrollIntoView({ block: "center", behavior: "auto" }); }, [S.sel]);
  const colgroup = (
    <colgroup><col className="c-ck" /><col className="c-name" />{what ? <col className="c-what" /> : null}<col className="c-status" /><col className="c-access" /><col className="c-score" />{S.scoreMode === "prd" ? <col className="c-value" /> : null}<col className="c-runs" /><col className="c-succ" />{S.scoreMode === "prd" ? <col className="c-succ" /> : null}</colgroup>
  );
  return (
    <table className={`grid${what ? " withwhat" : ""}`}>
      {colgroup}
      <thead><tr>
        <th className="ck"><span className="cb" /></th>
        {cols.map((col, i) => {
          const s = sortable && S.sort === col.k ? ` s${S.asc ? " asc" : ""}` : "";
          const tip = col.k === "effort" && S.scoreMode === "shipped" ? TIPS.effortShipped : TIPS[col.k] || "";
          const th = <th key={col.k} className={`${col.num ? "num " : ""}${col.cls}${s}`} onClick={sortable ? () => act(`sort:${col.k}`) : undefined} title={tip} data-act={sortable ? `sort:${col.k}` : undefined}>{col.h}</th>;
          return i === 1 && what ? [th, <th key="what">What it does</th>] : th;
        })}
      </tr></thead>
      <tbody>
        {comps.length ? comps.map((c) => (
          <tr key={c.id} ref={S.sel === c.id ? selRef : null} className={`row${c.hidden ? " hid" : ""}${S.sel === c.id ? " sel" : ""}`} role="button" tabIndex={0} onClick={() => act(`comp:${c.id}`)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(`comp:${c.id}`); } }}>
            <td className="ck"><span className="cb" /></td>
            {cols.map((col, i) => {
              const td = <td key={col.k} className={`${col.num ? "num " : ""}${col.cls}${(col.k === "runs" || col.k === "success") && c.kind !== "flow" ? " c2" : ""}`}><Cell c={c} col={col} mode={S.scoreMode} /></td>;
              return i === 1 && what ? [td, <td key="what" className="wrap what">{what(c)}</td>] : td;
            })}
          </tr>
        )) : (
          <tr><td colSpan={10}><div className="empty">No flows or subflows match the current filters.<button className="btn" type="button" onClick={() => act("clearfilters")}>Clear filters</button></div></td></tr>
        )}
      </tbody>
    </table>
  );
}
