/* Create agent in Copilot Studio, and Add to an existing agent. The Create dialog focuses its Create button, so Enter creates and the arrow keys still move the walkthrough. */
import { useEffect, useRef, useState } from "react";
import { ESTATE } from "../data/estate";
import { A, C, dispName, flowName, instructionsFor, plural } from "../lib/model";
import { useApp } from "../state/store";
import { StatusChip } from "./ui";

export function CreateAgentDialog({ aid }: { aid: string }) {
  const { S, act } = useApp();
  const a = A[aid];
  const [name, setName] = useState(a.name);
  const [instr, setInstr] = useState(instructionsFor(a));
  const [env, setEnv] = useState("Contoso Finance (production)");
  const [conn, setConn] = useState("Desktop flows connection");
  const [attach, setAttach] = useState<string[]>(() => a.tools.filter((t) => t.mode === "ready to connect" && S.dec[`tool:${aid}:${t.c}`] !== "leave").map((t) => t.c));
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { okRef.current?.focus({ preventScroll: true }); }, []);
  const submit = () => act("cok", { name, instr, env, conn, attach });
  const now = attach.length, prep = a.tools.filter((t) => t.mode !== "ready to connect" && S.dec[`tool:${aid}:${t.c}`] !== "leave").length;
  return (
    <div className="modal" onClick={() => act("wcancel")}>
      <div className="box" role="dialog" aria-label="Create agent" onClick={(e) => e.stopPropagation()}>
        <h4>Create agent in Copilot Studio</h4>
        <label>Name<input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} /></label>
        <div className="fld">Tools
          <ul className="plain tlist">
            {a.tools.map((t) => { const c = C[t.c], ok = t.mode === "ready to connect", out = S.dec[`tool:${aid}:${t.c}`] === "leave"; return (
              <li key={t.c} className={out ? "out" : ""}>
                <input type="checkbox" checked={ok && attach.includes(t.c)} disabled={!ok} aria-label={dispName(c)} onChange={(e) => setAttach((x) => (e.target.checked ? [...x, t.c] : x.filter((y) => y !== t.c)))} />
                <span className="tn">{dispName(c)}</span><StatusChip c={c} plain /><span className="st">{out ? "left out" : ok ? "attached now" : "after prep"}</span>
              </li>); })}
          </ul>
          <span className="hint">{plural(now, "tool")} {now === 1 ? "is" : "are"} attached now · {prep} need{prep === 1 ? "s" : ""} prep and can be added later from this agent's page</span>
        </div>
        <label>Instructions<textarea style={{ minHeight: 90 }} value={instr} onChange={(e) => setInstr(e.target.value)} /></label>
        <div className="rule">Copilot Studio</div>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ flex: 1 }}>Environment<select value={env} onChange={(e) => setEnv(e.target.value)}><option>Contoso Finance (production)</option><option>Contoso Finance (test)</option></select></label>
          <label style={{ flex: 1 }}>Connection reference<input type="text" value={conn} onChange={(e) => setConn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} /></label>
        </div>
        <div className="row"><button className="btn lg mut" type="button" onClick={() => act("wcancel")}>Cancel</button><button ref={okRef} className="btn lg pri" type="button" onClick={submit}>Create in Copilot Studio</button></div>
      </div>
    </div>
  );
}

export function AddToAgentDialog({ keyStr }: { keyStr: string }) {
  const { act } = useApp();
  const [aid, cid] = keyStr.split(":");
  const cc = C[cid];
  const [agent, setAgent] = useState(A[aid].name);
  const [conn, setConn] = useState("Desktop flows connection");
  const submit = () => act("wok", { agent, conn });
  return (
    <div className="modal" onClick={() => act("wcancel")}>
      <div className="box" role="dialog" aria-label="Add to an existing agent" onClick={(e) => e.stopPropagation()}>
        <h4>Add to an existing agent</h4><span className="muted">Desktop flow: {dispName(cc)}{cc.kind === "flow" ? "" : ` (${flowName(cc)})`}</span>
        <label>Copilot Studio agent<select value={agent} onChange={(e) => setAgent(e.target.value)}>{ESTATE.agents.map((x) => <option key={x.id}>{x.name}</option>)}</select><span className="hint">Agents are created in Copilot Studio. Blueprint attaches the flow to one you already have.</span></label>
        <label>Connection reference<input type="text" value={conn} onChange={(e) => setConn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} /></label>
        <div className="row"><button className="btn lg mut" type="button" onClick={() => act("wcancel")}>Cancel</button><button className="btn lg pri" type="button" onClick={submit}>Add to agent</button></div>
      </div>
    </div>
  );
}
