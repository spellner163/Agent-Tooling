/* Presenter's guide bar: step notes, Back/Next, Reset, and the options (short path, presenter scale, hide notes, score scheme).
   It sits above the product frame and is not part of the product. */
import { STEPS, useApp } from "../state/store";

export function GuideBar() {
  const { S, act, path, isLast } = useApp();
  const st = STEPS[S.step], pos = path.indexOf(S.step);
  const k = pos < 0 ? `Step ${S.step + 1} of ${STEPS.length} · ${st.where} · off the short path` : `Step ${pos + 1} of ${path.length} · ${st.where}${S.shortMode ? " · short path" : ""}`;
  return (
    <div className={`guide${S.hideNotes ? " nonotes" : ""}`}>
      <div className="story" aria-live="polite">
        <span className="k">{k}</span>
        <span className="t">{st.t}</span>
        <p className="d" title={st.d}>{st.d}</p>
      </div>
      <div className="nav">
        <div className="dots" aria-hidden="true">{path.map((i) => <i key={i} className={i === S.step ? "on" : ""} title={STEPS[i].t} />)}</div>
        <button type="button" disabled={pos < 0 ? S.step <= 0 : pos <= 0} onClick={() => act("move:-1")}>Back</button>
        <button type="button" className="pri" onClick={() => (isLast ? act("reset") : act("move:1"))}>{isLast ? "Start over" : "Next"}</button>
        <button type="button" onClick={() => act("reset")}>Reset</button>
        <span className="opts">
          <label><input type="checkbox" checked={S.shortMode} onChange={(e) => act(`short:${e.target.checked ? 1 : 0}`)} /> Short path</label>
          <label><input type="checkbox" checked={S.present} onChange={(e) => act(`present:${e.target.checked ? 1 : 0}`)} /> Presenter</label>
          <label><input type="checkbox" checked={S.hideNotes} onChange={(e) => act(`notes:${e.target.checked ? 1 : 0}`)} /> Hide notes</label>
          <label title="PRD: readiness out of 55 plus the Value rank. Shipped: the product's Agent Tool Scoring out of 100 (ITEM-182), no Value column.">Score <select value={S.scoreMode} onChange={(e) => act(`score:${e.target.value}`)} style={{ padding: "2px 6px", fontSize: 13 }}><option value="prd">PRD readiness</option><option value="shipped">Shipped (ITEM-182)</option></select></label>
        </span>
      </div>
      <div className="legend">
        <span>Rows, tabs, status chips and the buttons in the walkthrough are live.</span>
        <span>Example data: synthetic Contoso Finance estate. Model output is scripted.</span>
      </div>
    </div>
  );
}
