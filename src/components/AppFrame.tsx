/* The 1400x780 replica of the Blueprint product: header, page title, funnel strip, tabs, the main pane with the drawer beside it,
   plus the Copilot Studio mock, the dialogs and the toast on top. */
import { ESTATE } from "../data/estate";
import { A, C } from "../lib/model";
import { useApp } from "../state/store";
import { AgentDetail, AgentsList } from "./Agents";
import { CopilotStudio } from "./CopilotStudio";
import { DescribeJob } from "./DescribeJob";
import { AddToAgentDialog, CreateAgentDialog } from "./Dialogs";
import { Drawer } from "./Drawer";
import { FlowsTable } from "./FlowsTable";

/* Funnel row at page level: what was scanned, what was set aside, what is left. Shown on every tab. */
function PageStrip() {
  const { act } = useApp();
  const s = ESTATE.summary, nComp = ESTATE.components.filter((c) => !c.hidden).length;
  const cell = (n: string | number, l: string, a?: string) => <span className="cell" role={a ? "button" : undefined} tabIndex={a ? 0 : undefined} data-act={a} onClick={a ? () => act(a) : undefined}><b>{n}</b><span>{l}</span></span>;
  const sep = <span className="sep">›</span>;
  return <div className="pstrip">{cell(s.flows, "flows scanned")}{sep}{cell(s.components.toLocaleString(), "flows and subflows", "tab:components")}{sep}{cell(s.hidden.toLocaleString(), `set aside (${s.hiddenPct}%)`)}{sep}{cell(s.candidates, "could be tools")}{sep}{cell(s.agents, "agents suggested", "tab:agents")}<span className="sp" /><span className="shown">{ESTATE.flows.length} of {s.flows} flows shown in full · {nComp} of the {s.candidates} candidates</span></div>;
}

export function AppFrame() {
  const { S, act } = useApp();
  const nComp = ESTATE.components.filter((c) => !c.hidden).length;
  const sel = S.sel ? C[S.sel] : null;
  return (
    <div className="app">
      <div className="hdr"><span className="burger" aria-disabled="true">≡</span><span className="logo">blueprint</span><span className="nv" aria-disabled="true">Ideas</span><span className="nv" aria-disabled="true">Flows</span><span className="nv" aria-disabled="true">Tools ▾</span><span className="nv" aria-disabled="true">Manage ▾</span><span className="nv" aria-disabled="true">⚒ Jobs</span><span className="sp" /><span aria-disabled="true">All</span><span className="sp" /><span className="av" aria-disabled="true">DA</span><span className="ic" aria-disabled="true">?</span><span className="al" aria-disabled="true">!</span></div>
      <div className="ptitle">Agent Tooling <span className="q" aria-disabled="true">?</span>{S.agent ? <span className="crumb">› {A[S.agent].name}</span> : null}</div>
      <PageStrip />
      <div className="ptabs">
        <button type="button" className={S.tab === "components" ? "on" : ""} onClick={() => act("tab:components")}>Flows &amp; subflows<span className="n">{nComp}</span></button>
        <button type="button" className={S.tab === "agents" ? "on" : ""} onClick={() => act("tab:agents")}>Agents<span className="n">{ESTATE.agents.length}</span></button>
        <button type="button" className={S.tab === "describe" ? "on" : ""} onClick={() => act("tab:describe")}>Describe a job</button>
        <span className="sp" /><span className="est">{ESTATE.name}</span>
      </div>
      <div className={`panes${sel ? " narrow" : ""}`}>
        <div className="main">
          {S.tab === "components" ? <FlowsTable /> : S.tab === "agents" ? (S.agent ? <AgentDetail a={A[S.agent]} /> : <AgentsList />) : <DescribeJob />}
        </div>
        {sel ? <Drawer c={sel} /> : null}
      </div>
      {S.pane ? <CopilotStudio /> : null}
      {S.dlg && "create" in S.dlg ? <CreateAgentDialog key={S.dlg.create} aid={S.dlg.create} /> : S.dlg && "key" in S.dlg ? <AddToAgentDialog key={S.dlg.key} keyStr={S.dlg.key} /> : null}
      {S.toast ? <div className="toast" role="status">{S.toast}</div> : null}
      <button type="button" className="fab" aria-label="AI Navigator" aria-disabled="true" tabIndex={-1}>✦</button>
      <span className="sample">Prototype · example data · scripted model output</span>
    </div>
  );
}
