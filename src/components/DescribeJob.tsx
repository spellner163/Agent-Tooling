/* Describe a job: the other way in. Three canned queries with fixed results; free text falls back to the first list. No model is called. */
import { ESTATE } from "../data/estate";
import { C } from "../lib/model";
import type { Component } from "../lib/types";
import { useApp } from "../state/store";
import { ComponentTable } from "./ComponentTable";
import { Tbar } from "./ui";

export function DescribeJob() {
  const { S, act, set } = useApp();
  const dj = ESTATE.describeJob;
  const hit = dj.canned.findIndex((x) => x.q.trim().toLowerCase() === S.q.trim().toLowerCase());
  const ids = dj.canned[hit >= 0 ? hit : 0].results;
  const what = (c: Component) => { const d = c.description || ""; if (!d) return <span className="muted">no description generated</span>; const m = /^(.*?\.)(\s|$)/.exec(d); return m ? m[1] : d; };
  return (
    <>
      <div className={`jobp${S.searched ? "" : " alone"}`}>
        <div className="jrow"><input type="text" placeholder="Describe the job in a sentence, e.g. open PO balance and waiting invoices" value={S.q} aria-label="Describe the job" onChange={(e) => set({ q: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); act("find"); } }} /><button className="btn lg pri" type="button" onClick={() => act("find")}>Find matching flows</button></div>
        <div className="try"><span>Try one:</span> {dj.canned.map((x, i) => <button key={i} className={`btn${S.searched && hit === i ? " on" : " mut"}`} type="button" onClick={() => act(`canned:${i}`)}>{x.q}</button>)}</div>
        {S.searched ? null : <div className="dsub">Matches against the description written from each flow's code; results come back in the same table, with the same status.</div>}
      </div>
      {S.searched ? (
        <>
          {S.finding ? <div className="bar"><span>Searching tool descriptions…</span></div> : <Tbar n={ids.length} label="matching flows and subflows"><span style={{ width: 10 }} />{hit < 0 ? <span className="muted">Showing the closest fixed result set: “{dj.canned[0].q}”</span> : null}</Tbar>}
          <div className="scroll" style={S.finding ? { opacity: 0.4 } : undefined}><ComponentTable comps={ids.map((id) => C[id])} what={what} /></div>
        </>
      ) : null}
    </>
  );
}
