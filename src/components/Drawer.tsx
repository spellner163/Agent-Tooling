/* Component drawer (Action Properties pattern). Leads with the reason the viewer clicked: Why → What it does → Readiness → Value → Details → Same code. */
import { C, F, FAM, dispName, flowName, statusOf } from "../lib/model";
import { gradeOf, scoreOf, valueOf, type ScoreMode } from "../lib/scoring";
import type { Claim, Component } from "../lib/types";
import { useApp } from "../state/store";
import { ModeChips, StatusChip } from "./ui";

function Why({ c }: { c: Component }) {
  if (c.hidden) return <div className="dsec"><div className="dlab">Set aside</div><div className="dsub">{c.hiddenWhy}. Set-aside rows are never offered as tools.</div></div>;
  const s = statusOf(c);
  const groups = ([["fail", "Stops it"], ["prep", "Prep will fix"], ["warn", "Worth knowing"]] as const).map(([lv, h]) => {
    const items = c.blockers.filter((b) => b.level === lv).map((b) => ({ name: b.name, why: b.why }));
    if (lv === "prep" && s.cls === "prep" && !items.length && c.kind !== "flow") items.push({ name: "It is a subflow", why: "it becomes its own desktop flow before Copilot Studio can call it" });
    return items.length ? <div key={lv}><h5>{h}</h5>{items.map((b, i) => <div className="it" key={i}><b>{b.name}</b><span>{b.why}</span></div>)}</div> : null;
  }).filter(Boolean);
  if (!groups.length) return null;
  const head = s.cls === "fail" ? "Why it is Blocked" : s.cls === "prep" ? "Why it is Needs prep" : "Warnings";
  return <div className="dsec why"><div className="dlab">{head}</div>{groups}</div>;
}

const failNote = (k: Claim) => k.type === "output" ? "Not in the code: no output variable is declared, so it was removed from the description" : k.type === "reads" ? "Not in the code: nothing in its tree reads it, so it was removed from the description" : "Not in the code, so it was removed from the description";
function Claims({ c }: { c: Component }) {
  if (!c.description) return <div className="dsec"><span className="muted">No description generated</span></div>;
  return (
    <div className="dsec"><div className="dlab">What it does</div><div className="dsub">Description written from the code; every claim checked against it</div><p className="desc">{c.description}</p>
      {(c.claims || []).map((k, i) => (
        <div key={i} className={`claim ${k.ok ? "ok" : "no"}`}><span className="m">{k.ok ? "✓" : "✗"}</span><span><div className="l1"><b>{k.type}</b> · {k.value}{k.ok ? <code>{k.ref}</code> : null}</div>{k.ok ? null : <div className="l2">{failNote(k)}</div>}</span></div>
      ))}
    </div>
  );
}

/* Readiness / Tool score: the ITEM-182 side-panel layout (badge, candidate label, metric rows, legend) with whichever scheme the toggle selects. */
function ScorePanel({ c, mode }: { c: Component; mode: ScoreMode }) {
  const title = mode === "shipped" ? "Tool score" : "Readiness";
  if (c.hidden) return <div className="dsec"><div className="dlab">{title}</div><span className="muted">Set-aside rows are not scored.</span></div>;
  const s = scoreOf(c, mode), [label, cls] = gradeOf(s.pct);
  return (
    <details className="tscore dsec" open>
      <summary><span className="dlab">{title}</span><span className={`badge g-${cls}`}>{mode === "shipped" ? `${s.total}/${s.max}` : `${s.pct}%`}</span><b>{label}</b><span className="muted">· {mode === "shipped" ? `${s.rows.length} metrics` : `${s.total} of ${s.max} points`}</span></summary>
      <div className="dsub">{mode === "shipped" ? "Scores code quality and usage, as the product ships it today. Whether Copilot Studio can call it today is the Status above." : "How close the code is to tool-ready: six scored criteria and one informational. Usage is in Value below; whether Copilot Studio can call it today is the Status above."}</div>
      <div className="mgrid">
        {s.rows.map((r) => {
          if (r.d.info) return <div key={r.d.name} className="mcard infoonly"><span className="mh">{r.d.name}<i className="info" title={r.d.desc}>ⓘ</i></span><span className="mv">{r.d.fmt(r.v)}</span><span className="mbar" /><span className="pts">info</span></div>;
          const p = r.d.max ? Math.round((r.pts / r.d.max) * 100) : 0, cc = gradeOf(p)[1];
          const tip = `${r.d.name}. ${r.d.desc} Bands: ` + r.d.bands.map((b) => `${b[2]}: ${b[1]} pts`).join("; ") + `. This one: ${r.band}, ${r.pts}/${r.d.max}.`;
          return <div key={r.d.name} className="mcard"><span className="mh">{r.d.name}<i className="info" title={tip}>ⓘ</i></span><span className="mv">{r.d.fmt(r.v)}</span><span className="mbar"><b className={`g-${cc}`} style={{ width: `${p}%` }} /></span><span className="pts">{r.pts}/{r.d.max}</span><span className="mt">Threshold met: {r.band} · {r.pts} of {r.d.max} points</span></div>;
        })}
      </div>
      <div className="slegend"><span><i className="g-ok" />80–100 Strong</span><span><i className="g-warn" />60–79 Good</span><span><i className="g-orange" />40–59 Fair</span><span><i className="g-fail" />&lt;40 Poor</span></div>
    </details>
  );
}

function ValuePanel({ c }: { c: Component }) {
  if (c.hidden) return null;
  const v = valueOf(c), f = F[c.flow], inh = c.kind !== "flow";
  return (
    <details className="tscore dsec" open>
      <summary><span className="dlab">Value</span><span className="badge vb">{v.score == null ? "—" : v.score}</span><b>of 100</b><span className="muted">· 3 signals</span></summary>
      <div className="dsub">Mean of three signals, each as a percentile within this estate. Used to rank, never to gate.</div>
      <div className="mgrid">
        {v.rows.map((r) => {
          if (r.p == null || r.v == null) return <div key={r.s.name} className="mcard infoonly"><span className="mh">{r.s.name}</span><span className="mv muted">no data</span><span className="mbar" /><span className="pts">left out</span></div>;
          const pc = Math.round(r.p * 100);
          return <div key={r.s.name} className="mcard"><span className="mh">{r.s.name}{r.s.inherited && inh ? <i className="info" title="inherited from the parent flow; per-subflow run history is not available">ⓘ</i> : null}</span><span className="mv">{r.s.fmt(r.v)}{r.s.inherited && inh ? <span className="muted"> (flow)</span> : null}</span><span className="mbar"><b style={{ width: `${pc}%`, background: "#64748b" }} /></span><span className="pts">{pc}th</span><span className="mt">Percentile within this estate: {pc} of 100</span></div>;
        })}
      </div>
      {v.missing.length ? <div className="dsub">Left out, no data: {v.missing.join(", ")}.</div> : null}
      <div className="dsub">Context, not a signal: last run {f.lastRun} · {f.hours12m.toLocaleString()} hours executed in 12 months · {f.trigger}</div>
    </details>
  );
}

const List = ({ arr, empty }: { arr: string[]; empty?: string }) => arr.length ? <>{arr.map((x, i) => <span key={i}><code>{x}</code> </span>)}</> : <span className="muted">{empty || "none"}</span>;

function Details({ c }: { c: Component }) {
  const { act } = useApp();
  const f = F[c.flow], kids = c.tree.filter((id) => id !== c.id);
  return (
    <div className="dsec"><div className="dlab">Details from the code</div><dl className="rec">
      <dt>Inputs</dt><dd><List arr={c.inputs} /></dd>
      <dt>Outputs</dt><dd><List arr={c.outputs} /></dd>
      <dt>Apps</dt><dd><List arr={c.apps} /></dd>
      <dt>From config</dt><dd><List arr={c.configInputs} /></dd>
      <dt>Uses from parent</dt><dd><List arr={c.hiddenInputs} /></dd>
      <dt>Size</dt><dd>{c.actions} actions · {c.branches} branches · {c.todos} TODOs</dd>
      {kids.length ? <><dt>Calls</dt><dd>{kids.map((id, i) => <span key={id}>{i ? ", " : ""}<a href="#" className="lnk" onClick={(e) => { e.preventDefault(); act(`comp:${id}`); }}>{dispName(C[id])}</a></span>)}</dd></> : null}
      <dt>{c.kind === "flow" ? "Flow" : "Parent flow"}</dt><dd>{c.kind === "flow" ? "" : f.name + " · "}{Math.round(f.runs12m / 12)} runs / month · {Math.round(f.successRate * 100)}% success · {f.trigger}</dd>
    </dl></div>
  );
}

function Family({ c }: { c: Component }) {
  const { act } = useApp();
  const fam = c.family ? FAM[c.family] : null; if (!fam) return null;
  const others = fam.members.filter((id) => id !== c.id).map((id) => flowName(C[id])).join(", "), n = fam.members.length;
  const diff = fam.differs === "nothing" ? "identical" : `differs: ${fam.differs}`;
  return (
    <div className="dsec"><div className="dlab">Same code in other flows</div><p className="desc">Also in {others} ({diff}). One tool covers {n === 2 ? "both" : "all " + n}.</p>
      <div className="mem">{fam.members.map((id) => <div key={id}><a href="#" className="lnk" onClick={(e) => { e.preventDefault(); act(`comp:${id}`); }}>{dispName(C[id])}</a> <span className="muted">· {flowName(C[id])}{id === c.id ? " · this one" : ""}</span></div>)}</div>
    </div>
  );
}

export function Drawer({ c }: { c: Component }) {
  const { S, act } = useApp();
  const fam = c.family ? FAM[c.family] : null, isFlow = c.kind === "flow";
  const s = c.hidden ? null : scoreOf(c, S.scoreMode), g = s ? gradeOf(s.pct) : null, v = c.hidden ? null : valueOf(c);
  return (
    <div className="drawer" key={c.id}>
      <div className="hd"><b>{dispName(c)}</b><button className="x" type="button" aria-label="Close" onClick={() => act("close")}>✕</button></div>
      <div className="subl">{isFlow ? <><span className="lp">desktop flow</span> · {F[c.flow].trigger}</> : <><span className="lp">{c.kind === "global subflow" ? "global subflow" : "subflow"}</span> · {flowName(c)}</>}{fam ? "" : " · found in 1 flow"}</div>
      <div className="verdict">
        {c.hidden ? <span className="faint">not scored</span> : <>
          <StatusChip c={c} plain /><ModeChips c={c} />
          <span className={`badge sm g-${g![1]}`}>{S.scoreMode === "shipped" ? `${s!.total}/${s!.max}` : `${s!.pct}%`}</span><span>{g![0]}</span>
          {S.scoreMode === "prd" ? <><span className="badge sm vb">{v!.score == null ? "—" : v!.score}</span><span>value</span></> : null}
        </>}
      </div>
      <div className="dbody">
        <Why c={c} /><Claims c={c} /><ScorePanel c={c} mode={S.scoreMode} />{S.scoreMode === "prd" ? <ValuePanel c={c} /> : null}<Details c={c} /><Family c={c} />
      </div>
    </div>
  );
}
