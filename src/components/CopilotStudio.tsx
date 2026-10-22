/* Copilot Studio (mock): a full-frame window the presenter switches to; Blueprint stays behind it.
   The agent is the customer's, created in Copilot Studio; the tool is the customer's existing desktop flow. Everything here is scripted. */
import { useEffect, useRef } from "react";
import { CHAT } from "../data/estate";
import { A, C, dispName, instructionsFor } from "../lib/model";
import { useApp } from "../state/store";

function Chat({ n }: { n: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [n]);
  const items: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const m = CHAT[i];
    if (m.k === "user") items.push(<div key={i} className="b user">{m.t}</div>);
    else if (m.k === "agent") items.push(<div key={i} className="b agent">{m.t}</div>);
    else if (m.k === "tool") {
      const next = CHAT[i + 1], run = i + 1 < n && next.k === "run" ? next : null;
      items.push(<div key={i} className="tcall"><div className="l1"><b>Tool call</b> {m.tool}<span className="muted">desktop flow</span></div><div className="l2">{m.input}</div><div className="l3">{run ? <>{m.on} · <span className="done">{run.t}</span></> : <>Running on {m.on} …</>}</div></div>);
    }
  }
  const typing = n > 0 && n < CHAT.length && CHAT[n - 1].k !== "agent";
  return <div className="chat" ref={ref}>{items}{typing ? <div className="typing">· · ·</div> : null}</div>;
}

export function CopilotStudio() {
  const { S, act } = useApp();
  const pane = S.pane!;
  const a = A[pane.a || "a2"], cr = S.created[a.id] || { name: a.name, instr: instructionsFor(a), conn: "Desktop flows connection" };
  const tools = a.tools.filter((t) => S.wired[`${a.id}:${t.c}`]);
  const isA2 = a.id === "a2", beat = pane.beat || 0, playing = pane.n > 0 && pane.n < beat * 4;
  const nextQ = isA2 && beat < 2 && !playing ? (CHAT[beat * 4] as { t: string }).t : "";
  return (
    <div className="tpane" role="dialog" aria-label="Copilot Studio">
      <div className="cs"><b>Copilot Studio</b><span className="crumb">Agents › {cr.name}</span><span className="sp" />{pane.test === false ? <button className="back" type="button" onClick={() => act("ptest")}>Test</button> : null}<button className="back" type="button" onClick={() => act("pclose")}>Back to Blueprint</button></div>
      <div className="body">
        <div className="rail" aria-disabled="true"><i className="on" /><i /><i /><i /></div>
        <div className="ov">
          <h2>{cr.name}</h2><div className="sub">{a.job}</div>
          <div className="tabs" aria-disabled="true"><span className="on">Overview</span><span>Knowledge</span><span>Tools</span><span>Topics</span><span>Activity</span></div>
          <div className="card"><h4>Instructions</h4>{cr.instr}</div>
          <div className="card"><h4>Tools</h4>{tools.length ? tools.map((t) => <div key={t.c} className="tool"><i />{dispName(C[t.c])}<small>Desktop flow · {S.wired[`${a.id}:${t.c}`].conn}</small></div>) : <div className="tool muted">No tools yet</div>}</div>
        </div>
        {pane.test === false ? null : (
          <div className="test">
            <div className="th">Test your agent<button className="x" type="button" aria-label="Close the test pane" onClick={() => act("ptestx")}>✕</button></div>
            {isA2 ? <Chat n={pane.n} /> : <div className="chat" />}
            <div className="tf"><input type="text" value={nextQ} readOnly placeholder="Ask a question or describe what you need" aria-label="Message" disabled={!isA2 || playing} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); act("send"); } }} /><button className="send" type="button" disabled={!(isA2 && beat < 2 && !playing)} onClick={() => act("send")}>Send</button></div>
            <div className="cap">Mock · scripted{isA2 ? <button type="button" onClick={() => act("replay")}>Replay</button> : null}</div>
          </div>
        )}
      </div>
    </div>
  );
}
