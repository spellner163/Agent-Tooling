/* Agents list and agent detail. Agents are ranked on columns, never one number (PRD §6). */
import { ESTATE } from "../data/estate";
import { C, agentAccess, dispName, flowName, plural, prepItems } from "../lib/model";
import { agentStats } from "../lib/scoring";
import type { Agent } from "../lib/types";
import { useApp } from "../state/store";
import { AccessChip, ModeChips, Pager, ScoreWidget, StatusChip, Tbar, ValueWidget } from "./ui";
import { TIPS } from "./ComponentTable";

export function AgentsList() {
  const { act } = useApp();
  const agents = ESTATE.agents.slice().sort((a, b) => { const x = agentStats(a), y = agentStats(b); return y.ready - x.ready || y.runs12m - x.runs12m; });
  const line = (a: Agent, mode: string, cls: string, label: string) => {
    const ts = a.tools.filter((t) => t.mode === mode);
    return ts.length ? <div className="tl"><b>{ts.length}</b> {label}: {ts.map((t) => <span key={t.c} className={`flag ${cls}`} title={flowName(C[t.c])}>{dispName(C[t.c])}</span>)}</div> : null;
  };
  return (
    <>
      <Tbar n={agents.length}><span style={{ width: 10 }} /><span>Ranked by tools Ready, then runs behind the tools. Columns, never one number.</span></Tbar>
      <div className="scroll">
        <table className="grid agents">
          <colgroup><col className="c-ck" /><col className="c-agent" /><col className="c-aacc" style={{ width: 120 }} /><col style={{ width: 64 }} /><col style={{ width: 84 }} /><col style={{ width: 110 }} /><col style={{ width: 90 }} /><col className="c-atools" style={{ width: 400 }} /></colgroup>
          <thead><tr><th className="ck"><span className="cb" /></th><th>Agent</th><th title="what the agent's tools do to data, combined">Access</th><th className="num" title="tools that can be attached today">Ready</th><th className="num" title="tools that become their own desktop flow first">Needs prep</th><th className="num" title="12-month runs of the flows behind the tools">Runs behind tools</th><th className="num" title="prep flags and warnings across the tools">Blockers to resolve</th><th>Tools</th></tr></thead>
          <tbody>
            {agents.map((a, i) => { const st = agentStats(a); return (
              <tr key={a.id} className="row" role="button" tabIndex={0} onClick={() => act(`agent:${a.id}`)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(`agent:${a.id}`); } }}>
                <td className="ck"><span className="cb" /></td>
                <td className="acell"><span className="idx">#{i + 1}</span><span className="an">{a.name}</span><span className="aj">{a.job}</span></td>
                <td><AccessChip k={agentAccess(a)} /></td>
                <td className="num rpm">{st.ready}</td><td className="num rpm">{st.prep}</td><td className="num rpm">{st.runs12m.toLocaleString()}</td><td className="num rpm">{st.blockers}</td>
                <td className="wrap tools">{line(a, "ready to connect", "ok", "Ready")}{line(a, "needs prep", "prep", "Needs prep")}</td>
              </tr>); })}
          </tbody>
        </table>
        <Pager />
      </div>
    </>
  );
}

/* Keep? control: two segments, the chosen one filled. A left-out tool is unchecked in the Create dialog. */
function Seg({ k }: { k: string }) {
  const { S, act } = useApp();
  const d = S.dec[k];
  return <span className="seg" role="group" aria-label="Keep this tool?" onClick={(e) => e.stopPropagation()}><button className={d === "keep" ? "on" : ""} type="button" onClick={() => act(`dec:${k}:keep`)}>Keep</button><button className={d === "leave" ? "on" : ""} type="button" onClick={() => act(`dec:${k}:leave`)}>Leave out</button></span>;
}

export function AgentDetail({ a }: { a: Agent }) {
  const { S, act } = useApp();
  const created = S.created[a.id], dismissed = !!S.dismissed[a.id], st = agentStats(a);
  const decided = a.tools.filter((t) => S.dec[`tool:${a.id}:${t.c}`]).length;
  return (
    <>
      <div className="ahead">
        <button className="btn mut" type="button" onClick={() => act("back")}>← Agents</button>
        <div className="grow"><h2>{a.name}</h2><p className="j">{a.job}</p></div>
        <div className="act">{created ? <><span className="flag ok">created in Copilot Studio</span><button className="btn lg pri" type="button" onClick={() => act(`open:${a.id}`)}>Open in Copilot Studio</button></> : <button className="btn lg pri" type="button" disabled={dismissed} title={dismissed ? "agent dismissed" : undefined} onClick={() => act(`create:${a.id}`)}>Create agent</button>}</div>
      </div>
      <div className="abar">
        <span className="flag ok">{st.ready} Ready</span><span>·</span><span className="flag prep">{st.prep} Needs prep</span><span>·</span>
        <span>{st.runs12m.toLocaleString()} runs behind the tools</span><span>·</span><span>{plural(st.blockers, "blocker")} to resolve</span><span>·</span><span>{decided} of {a.tools.length} tools decided</span>
        <span className="sp" /><button className={`btn${dismissed ? " on" : ""}`} type="button" title={dismissed ? "restore the agent and its tools" : "leave out every tool and disable Create"} onClick={() => act(`dismiss:${a.id}`)}>{dismissed ? "Restore agent" : "Dismiss agent"}</button>
      </div>
      <div className="scroll">
        <table className="grid tools">
          <colgroup><col className="t-name" style={{ width: 170 }} /><col className="t-status" style={{ width: 130 }} /><col className="t-ready" style={{ width: 96 }} />{S.scoreMode === "prd" ? <col className="t-value" style={{ width: 84 }} /> : null}<col className="t-role" /><col className="t-access" style={{ width: 90 }} /><col className="t-before" style={{ width: 360 }} /><col className="t-keep" style={{ width: 130 }} /><col className="t-act" style={{ width: 150 }} /></colgroup>
          <thead><tr><th>Tool</th><th>Status</th><th title={S.scoreMode === "shipped" ? TIPS.effortShipped : TIPS.effort}>{S.scoreMode === "shipped" ? "Tool score" : "Readiness"}</th>{S.scoreMode === "prd" ? <th title={TIPS.value}>Value</th> : null}<th>The agent uses it to</th><th>Access</th><th>Before it can be attached</th><th>Keep?</th><th></th></tr></thead>
          <tbody>
            {a.tools.map((t) => {
              const c = C[t.c], key = `tool:${a.id}:${t.c}`, d = S.dec[key], w = S.wired[`${a.id}:${t.c}`], ready = t.mode === "ready to connect";
              const items = prepItems(a, c, t.mode), warns = c.blockers.filter((b) => b.level === "warn").length;
              return (
                <tr key={t.c} className={`row${S.sel === t.c ? " sel" : ""}${d === "leave" ? " out" : ""}`} role="button" tabIndex={0} onClick={() => act(`comp:${t.c}`)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(`comp:${t.c}`); } }}>
                  <td className="name"><span className="nm">{dispName(c)}</span><span className="sub">{c.kind === "flow" ? "desktop flow" : flowName(c)}</span></td>
                  <td><StatusChip c={c} /></td>
                  <td><ScoreWidget c={c} mode={S.scoreMode} /></td>
                  {S.scoreMode === "prd" ? <td><ValueWidget c={c} /></td> : null}
                  <td className="wrap">{t.role}</td>
                  <td><ModeChips c={c} /></td>
                  <td className="wrap before">{items.length ? <ul className="todo">{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <span className="muted">nothing to fix</span>}{warns ? <span className="muted"> +{plural(warns, "warning")}</span> : null}</td>
                  <td className="kcell"><Seg k={key} /></td>
                  <td onClick={(e) => e.stopPropagation()}>{!ready ? null : created ? (w ? <span className="chip">added to {w.agent}</span> : <button className="btn" type="button" onClick={() => act(`wire:${a.id}:${t.c}`)}>Add to an existing agent</button>) : <span className="muted">attached on Create</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="sect"><h3>Also suggested, but left out</h3>
          {a.proposedAndDropped.length ? <div className="left">{a.proposedAndDropped.map((d) => <div className="it" key={d.c}><a href="#" className="lnk" onClick={(e) => { e.preventDefault(); act(`comp:${d.c}`); }}>{dispName(C[d.c])}</a> <span className="muted">· {flowName(C[d.c])}</span><br /><span className="muted">{d.why}</span></div>)}</div> : <span className="muted">None</span>}
        </div>
        <div style={{ height: 20 }} />
      </div>
    </>
  );
}
