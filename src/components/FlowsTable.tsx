/* Flows & subflows tab: toolbar with search, the status key with live counts, the Flow and Kind filters, then the table. */
import { ESTATE } from "../data/estate";
import { dispName, flowName, recKind, statusOf, STATUS_LABEL, STATUS_ORDER } from "../lib/model";
import type { StatusCls } from "../lib/types";
import { useApp } from "../state/store";
import { ComponentTable, COLS, defaultSort } from "./ComponentTable";
import { Pager, Tbar } from "./ui";

export function FlowsTable() {
  const { S, act, set } = useApp();
  const all = ESTATE.components, hidden = all.filter((c) => c.hidden), q = (S.fq || "").trim().toLowerCase();
  let base = all.filter((c) => S.hid || !c.hidden);
  if (S.flow !== "all") base = base.filter((c) => c.flow === S.flow);
  if (S.kind !== "all") base = base.filter((c) => recKind(c) === S.kind);
  if (q) base = base.filter((c) => dispName(c).toLowerCase().includes(q) || flowName(c).toLowerCase().includes(q));
  const counts: Record<StatusCls, number> = { fail: 0, prep: 0, warn: 0, ok: 0 };
  base.forEach((c) => { if (!c.hidden) counts[statusOf(c).cls]++; });
  let rows = S.status ? base.filter((c) => !c.hidden && statusOf(c).cls === S.status) : base.slice();
  const col = COLS.find((x) => x.k === S.sort);
  if (col) rows.sort((a, b) => { const x = col.v(a, S.scoreMode), y = col.v(b, S.scoreMode); const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y)); return (+!!a.hidden - +!!b.hidden) || (S.asc ? r : -r); });
  else rows = rows.sort(defaultSort(S.scoreMode));

  return (
    <>
      <Tbar n={rows.length}>
        <span className="sp" />
        <div className="srch">
          <input type="text" id="fQ" placeholder="Search flows and subflows" value={S.fq} aria-label="Search flows and subflows" onChange={(e) => set({ fq: e.target.value })} />
          <em role="button" tabIndex={0} title="Describe a job instead" onClick={() => act("tab:describe")}>Ask AI <i /></em>
        </div>
      </Tbar>
      <div className="skey">
        <div className="frow">
          {STATUS_ORDER.map((k, i) => (
            <span key={k}>
              {i > 0 ? <span className="sepd">·</span> : null}
              <span className={`flag ${k} sk${S.status === k ? " on" : ""}`} role="button" tabIndex={0} title={S.status === k ? "show every status" : "show only " + STATUS_LABEL[k]} onClick={() => act(`status:${k}`)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(`status:${k}`); } }}>{STATUS_LABEL[k]} <b>{counts[k]}</b></span>
            </span>
          ))}
          <span className="gap" />
          <label>Flow <select value={S.flow} onChange={(e) => set({ flow: e.target.value })}><option value="all">All flows</option>{ESTATE.flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
          <label title="Flows are entire processes. A sub-tree is a subflow scored together with every subflow it calls. A subflow calls none.">Kind <select value={S.kind} onChange={(e) => set({ kind: e.target.value })}>{[["all", "All"], ["flow", "Flows"], ["subtree", "Sub-trees"], ["subflow", "Subflows"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label title={`${hidden.length} of ${all.length} are framework plumbing (login, cleanup, error handling), batch loops or small helpers and are set aside; shown greyed at the bottom with the reason under the name`}><input type="checkbox" checked={S.hid} onChange={(e) => set({ hid: e.target.checked })} /> Show set-aside rows</label>
          <span className="sp" />
          {S.sort ? <button className="gbtn" type="button" onClick={() => act("resetsort")}>Default sort</button> : <span>Sorted by status, then {S.scoreMode === "shipped" ? "tool score" : "readiness"}</span>}
        </div>
        <div>Blocked: cannot be a tool as written · Needs prep: becomes its own desktop flow first · Ready: can be attached today · Access: Read-only looks up, No data access touches nothing, Writes only pushes its inputs out, Reads and writes does both</div>
      </div>
      <div className="scroll"><ComponentTable comps={rows} sortable /><Pager /></div>
    </>
  );
}
