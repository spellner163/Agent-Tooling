/* One store for the whole demo. State mirrors the original prototype's S object; actions mirror its act() strings so the
   walkthrough, the keyboard handling and the Copilot Studio script stay one small piece of logic. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CHAT, DELAYS, ESTATE } from "../data/estate";
import { A, A2, instructionsFor } from "../lib/model";
import type { ScoreMode } from "../lib/scoring";
import type { StatusCls } from "../lib/types";

export type Tab = "components" | "agents" | "describe";
export type Dlg = { create: string } | { key: string } | null;
export interface Pane { n: number; a: string; beat: number; test: boolean }
export interface Created { name: string; instr: string; conn: string; env: string }

export interface State {
  tab: Tab; agent: string | null; sel: string | null;
  flow: string; kind: string; hid: boolean; status: StatusCls | null; fq: string; sort: string | null; asc: boolean;
  q: string; searched: boolean; finding: boolean;
  dec: Record<string, "keep" | "leave" | null>; dismissed: Record<string, boolean>;
  wired: Record<string, { agent: string; conn: string }>; created: Record<string, Created>;
  dlg: Dlg; toast: string | null; pane: Pane | null;
  step: number; shortMode: boolean; present: boolean; hideNotes: boolean; scoreMode: ScoreMode;
}

const fresh = (): State => ({
  tab: "components", agent: null, sel: null, flow: "all", kind: "all", hid: false, status: null, fq: "", sort: null, asc: true,
  q: "", searched: false, finding: false, dec: {}, dismissed: {}, wired: {}, created: {}, dlg: null, toast: null, pane: null,
  step: 0, shortMode: false, present: false, hideNotes: false, scoreMode: "prd",
});
const freshTable = (s: State): State => ({ ...s, flow: "all", kind: "all", sort: null, hid: false, status: null, fq: "" });

/* Walkthrough. Each step says where it is, what the presenter says, and the state it puts the app in. */
export interface Step { where: string; t: string; d: string; pane?: boolean; set: (s: State) => State }
const A2NAME = A2.name;
export const STEPS: Step[] = [
  { where: "Flows & subflows", t: "Flows and subflows", d: "Every flow and subflow, scored. The counts above the tabs show what was scanned and what was set aside.", set: (s) => ({ ...freshTable(s), tab: "components", agent: null, sel: null }) },
  { where: "Flows & subflows › Switch Company Code", t: "Switch Company Code", d: "Needs prep: it uses a SAP session its parent opened and starts mid-screen. Both are at the top of the drawer.", set: (s) => ({ ...freshTable(s), tab: "components", agent: null, sel: "c5" }) },
  { where: "Flows & subflows › Export GR/IR Open Items", t: "Export GR/IR Open Items", d: "Generated description, each claim checked against the code. The spreadsheet-path claim did not hold.", set: (s) => ({ ...freshTable(s), tab: "components", agent: null, sel: "c13" }) },
  { where: "Agents", t: "Recommended agents", d: "Three agents suggested from those flows and subflows.", set: (s) => ({ ...s, tab: "agents", agent: null, sel: null, hid: false }) },
  { where: "Agents › AP lookup agent", t: "AP lookup agent", d: "One tool is Ready, three need prep; what each needs is in the table.", set: (s) => ({ ...s, tab: "agents", agent: "a2", sel: null }) },
  { where: "Agents › AP lookup agent › Create agent", t: "Create agent", d: "Name, instructions and tools are filled in from the recommendation. The ready tool is attached; the rest wait for prep. Create.", set: (s) => { const created = { ...s.created }; delete created.a2; const wired = { ...s.wired }; delete wired["a2:c40"]; return { ...s, tab: "agents", agent: "a2", sel: null, created, wired, dlg: { create: "a2" } }; } },
  { where: "Copilot Studio (mock)", t: "Copilot Studio", d: "The agent just created. Send the question; it calls Get Open PO Balance and answers.", pane: true, set: (s) => {
      const created = { ...s.created }, wired = { ...s.wired };
      if (!created.a2) { created.a2 = { name: A2NAME, instr: instructionsFor(A.a2), conn: "Desktop flows connection", env: "Contoso Finance (production)" }; wired["a2:c40"] = { agent: A2NAME, conn: "Desktop flows connection" }; }
      if (!wired["a2:c40"]) wired["a2:c40"] = { agent: created.a2.name, conn: created.a2.conn };
      return { ...s, tab: "agents", agent: "a2", sel: null, created, wired, pane: { n: 0, a: "a2", beat: 0, test: true } };
    } },
  { where: "Describe a job", t: "Describe a job", d: "The other way in. Describe the job; matching flows and subflows come back.", set: (s) => ({ ...s, tab: "describe", agent: null, sel: null, q: "", searched: false, finding: false }) },
];
export const SHORT = [0, 3, 4, 5, 6];

export type Payload = Record<string, unknown> | undefined;

interface Ctx { S: State; act: (type: string, payload?: Payload) => void; set: (patch: Partial<State>) => void; path: number[]; isLast: boolean }
const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [S, setS] = useState<State>(() => STEPS[0].set(fresh()));
  const timers = useRef<{ chat: number[]; toast: number | null; find: number | null }>({ chat: [], toast: null, find: null });

  const stopChat = () => { timers.current.chat.forEach(clearTimeout); timers.current.chat = []; };
  const set = useCallback((patch: Partial<State>) => setS((s) => ({ ...s, ...patch })), []);

  const toast = (msg: string, ms = 2600) => {
    if (timers.current.toast) clearTimeout(timers.current.toast);
    setS((s) => ({ ...s, toast: msg }));
    timers.current.toast = window.setTimeout(() => setS((s) => ({ ...s, toast: null })), ms);
  };

  const pathOf = (s: State) => (s.shortMode ? SHORT : STEPS.map((_, i) => i));
  const goTo = (s: State, i: number, dir: number): State => {
    i = Math.max(0, Math.min(STEPS.length - 1, i));
    if (s.shortMode && !SHORT.includes(i)) { const f = dir < 0 ? [...SHORT].reverse().find((x) => x <= i) : SHORT.find((x) => x >= i); i = f == null ? (dir < 0 ? SHORT[0] : SHORT[SHORT.length - 1]) : f; }
    stopChat();
    if (timers.current.find) clearTimeout(timers.current.find);
    if (timers.current.toast) clearTimeout(timers.current.toast);
    return STEPS[i].set({ ...s, step: i, dlg: null, toast: null, pane: null, finding: false });
  };

  /* Send plays one beat of the Copilot script: the question at once, then the tool card, the run result and the answer on their own delays. */
  const sendBeat = (s: State): State => {
    if (!s.pane || s.pane.a !== "a2" || s.pane.beat >= 2) return s;
    stopChat();
    const b = s.pane.beat;
    let at = 0;
    for (let i = 1; i < 4; i++) {
      at += DELAYS[b * 4 + i] || 700;
      const n = b * 4 + i + 1;
      timers.current.chat.push(window.setTimeout(() => setS((x) => (x.pane ? { ...x, pane: { ...x.pane, n } } : x)), at));
    }
    return { ...s, pane: { ...s.pane, beat: b + 1, n: b * 4 + 1 } };
  };

  const act = useCallback((a: string, p?: Payload) => {
    const i = a.indexOf(":"), k = i < 0 ? a : a.slice(0, i), v = i < 0 ? "" : a.slice(i + 1);
    setS((s) => {
      switch (k) {
        case "tab": return { ...s, tab: v as Tab, agent: null, sel: v === "agents" ? null : s.sel };
        case "comp": return { ...s, sel: v };
        case "close": return { ...s, sel: null };
        case "agent": return { ...s, agent: v, sel: null };
        case "back": return { ...s, agent: null, sel: null };
        case "sort": return { ...s, asc: s.sort === v ? !s.asc : true, sort: v };
        case "resetsort": return { ...s, sort: null };
        case "status": return { ...s, status: s.status === v ? null : (v as StatusCls) };
        case "clearfilters": return freshTable(s);
        case "find": case "canned": {
          const q = k === "canned" ? ESTATE.describeJob.canned[+v].q : s.q;
          if (timers.current.find) clearTimeout(timers.current.find);
          timers.current.find = window.setTimeout(() => setS((x) => ({ ...x, finding: false })), 600);
          return { ...s, q, searched: true, finding: true };
        }
        case "dec": {
          const kk = v.slice(0, v.lastIndexOf(":")), val = v.slice(v.lastIndexOf(":") + 1) as "keep" | "leave";
          const dec = { ...s.dec, [kk]: s.dec[kk] === val ? null : val };
          const dismissed = val === "keep" ? { ...s.dismissed, [kk.split(":")[1]]: false } : s.dismissed;
          return { ...s, dec, dismissed };
        }
        case "dismiss": {
          const ag = A[v]; if (!ag) return s;
          const dec = { ...s.dec }, on = !s.dismissed[v];
          ag.tools.forEach((t) => { dec[`tool:${v}:${t.c}`] = on ? "leave" : null; });
          return { ...s, dec, dismissed: { ...s.dismissed, [v]: on } };
        }
        case "wire": return { ...s, dlg: { key: v } };
        case "create": return s.dismissed[v] ? s : { ...s, dlg: { create: v } };
        case "open": stopChat(); return { ...s, pane: { n: 0, a: v, beat: 0, test: true } };
        case "cok": {
          if (!s.dlg || !("create" in s.dlg)) return s;
          const aid = s.dlg.create, ag = A[aid];
          const f = (p || {}) as { name?: string; instr?: string; conn?: string; env?: string; attach?: string[] };
          const cr: Created = { name: f.name || ag.name, instr: f.instr ?? instructionsFor(ag), conn: f.conn || "Desktop flows connection", env: f.env || "Contoso Finance (production)" };
          const wired = { ...s.wired };
          ag.tools.filter((t) => t.mode === "ready to connect").forEach((t) => {
            const on = f.attach ? f.attach.includes(t.c) : s.dec[`tool:${aid}:${t.c}`] !== "leave";
            if (on) wired[`${aid}:${t.c}`] = { agent: cr.name, conn: cr.conn };
          });
          window.setTimeout(() => toast("Agent created in Copilot Studio", 4000), 0);
          return { ...s, created: { ...s.created, [aid]: cr }, wired, dlg: null };
        }
        case "wcancel": return { ...s, dlg: null };
        case "wok": {
          if (!s.dlg || !("key" in s.dlg)) return s;
          const key = s.dlg.key, f = (p || {}) as { agent?: string; conn?: string };
          window.setTimeout(() => toast("Added. The agent can call this flow now."), 0);
          return { ...s, wired: { ...s.wired, [key]: { agent: f.agent || A[key.split(":")[0]].name, conn: f.conn || "Desktop flows connection" } }, dlg: null };
        }
        case "pclose": stopChat(); return { ...s, pane: null };
        case "ptestx": return s.pane ? { ...s, pane: { ...s.pane, test: false } } : s;
        case "ptest": return s.pane ? { ...s, pane: { ...s.pane, test: true } } : s;
        case "send": return sendBeat(s);
        case "replay": if (!s.pane) return s; stopChat(); return { ...s, pane: { ...s.pane, n: 0, beat: 0, test: true } };
        /* walkthrough and guide-bar options */
        case "go": return goTo(s, +v, 1);
        case "move": { const d = +v, path = pathOf(s), at = path.indexOf(s.step); if (at < 0) return goTo(s, s.step + d, d); const j = at + d; if (j < 0 || j >= path.length) return s; return goTo(s, path[j], d); }
        case "reset": return goTo({ ...fresh(), shortMode: s.shortMode, present: s.present, hideNotes: s.hideNotes, scoreMode: s.scoreMode }, 0, 1);
        case "escape": if (s.dlg) return { ...s, dlg: null }; if (s.pane) { stopChat(); return { ...s, pane: null }; } return { ...s, sel: null };
        case "short": return { ...s, shortMode: v === "1" };
        case "present": return { ...s, present: v === "1" };
        case "notes": return { ...s, hideNotes: v === "1" };
        case "score": return { ...s, scoreMode: v as ScoreMode };
        default: return s;
      }
    });
  }, []);

  useEffect(() => () => { stopChat(); }, []);

  const path = useMemo(() => pathOf(S), [S.shortMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const pos = path.indexOf(S.step);
  const isLast = pos < 0 ? S.step >= STEPS.length - 1 : pos >= path.length - 1;

  const value = useMemo<Ctx>(() => ({ S, act, set, path, isLast }), [S, act, set, path, isLast]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
export { CHAT };
