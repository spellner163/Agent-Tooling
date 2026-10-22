/* Small shared pieces: the status chip, the access chip, the score widget, the toolbar and the pager. */
import { ACCESS_LABEL, ACCESS_TIP, statusOf } from "../lib/model";
import { effortPct, valueOf, type ScoreMode } from "../lib/scoring";
import type { AccessKind, Component } from "../lib/types";
import { useApp } from "../state/store";

/* The status chip is the one coloured element in a row; clicking it opens the drawer, where the blocker detail lives. */
export function StatusChip({ c, plain }: { c: Component; plain?: boolean }) {
  const { act } = useApp();
  if (c.hidden) return <span className="faint">not scored</span>;
  const s = statusOf(c);
  if (plain) return <span className={`flag ${s.cls}`}>{s.label}</span>;
  return <span className={`flag ${s.cls}`} role="button" tabIndex={0} title={s.label} onClick={(e) => { e.stopPropagation(); act(`comp:${c.id}`); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); act(`comp:${c.id}`); } }}>{s.label}</span>;
}

export function AccessChip({ k }: { k: AccessKind }) {
  return <span className={`chip${k === "write" || k === "readwrite" ? " w" : ""}`} title={ACCESS_TIP[k]}>{ACCESS_LABEL[k]}</span>;
}
export function ModeChips({ c }: { c: Component }) {
  if (c.hidden) return <span className="faint">—</span>;
  return <AccessChip k={c.access as AccessKind} />;
}

/* Score widget: number plus a short bar. In PRD mode the number is a readiness percentage; in shipped mode it is the score out of 100. */
export function ScoreWidget({ c, mode }: { c: Component; mode: ScoreMode }) {
  if (c.hidden) return <span className="faint">—</span>;
  const p = effortPct(c, mode), blk = statusOf(c).cls === "fail";
  return <span className={`score${blk ? " blk" : ""}`}><span><b>{p}</b><span className="muted">{mode === "shipped" ? "/100" : "%"}</span></span><i><b style={{ width: `${p}%` }} /></i></span>;
}
export function ValueWidget({ c }: { c: Component }) {
  if (c.hidden) return <span className="faint">—</span>;
  const v = valueOf(c);
  if (v.score == null) return <span className="muted">no data</span>;
  return <span className="score val"><span><b>{v.score}</b></span><i><b style={{ width: `${v.score}%` }} /></i></span>;
}

export function Pager() {
  return <div className="pager" aria-disabled="true"><div className="pg"><span className="dis">«</span><span className="dis">‹</span><span className="cur">1</span><span className="dis">›</span><span className="dis">»</span></div><span className="pp">per page 100 ▴</span></div>;
}
export function Tbar({ n, label, children }: { n: number; label?: string; children?: React.ReactNode }) {
  return <div className="bar"><span><b>{n}</b> {label || "items (0 selected)"}</span><button className="gbtn" type="button" disabled>Actions ▾</button><button className="gbtn" type="button" aria-disabled="true">Refresh</button><button className="gbtn" type="button" aria-disabled="true">Columns</button><button className="gbtn" type="button" aria-disabled="true">Filters</button>{children}</div>;
}
