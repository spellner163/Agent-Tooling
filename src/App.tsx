/* Agent Tooling demo. A presenter's guide bar above a 1400x780 replica of the product.
   Keyboard: ArrowLeft/ArrowRight move the walkthrough, Escape closes the dialog, then the Copilot mock, then the drawer. */
import { useEffect, useRef } from "react";
import { AppFrame } from "./components/AppFrame";
import { GuideBar } from "./components/GuideBar";
import { AppProvider, useApp } from "./state/store";

function Shell() {
  const { S, act } = useApp();
  const shell = useRef<HTMLDivElement>(null);
  const guide = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "Escape") { act("escape"); return; }
      if (t && t.closest && t.closest("input,textarea,select")) return;
      if (e.key === "ArrowRight") act("move:1");
      if (e.key === "ArrowLeft") act("move:-1");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [act]);

  /* Presenter scale: as large as the window allows, 1.25x at most, recomputed on resize. */
  useEffect(() => {
    document.body.classList.toggle("present", S.present);
    const fit = () => {
      if (!S.present || !shell.current) return;
      const gh = guide.current?.offsetHeight || 56, ih = window.innerHeight || 1080;
      const s = Math.min(1.25, Math.max(0.5, (ih - gh - 44) / 780));
      shell.current.style.setProperty("--scale", s.toFixed(3));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [S.present, S.hideNotes]);

  return (
    <div ref={shell} className={`shell${S.present ? " present" : ""}`}>
      <div ref={guide}><GuideBar /></div>
      <div className={`viewport${S.present ? " present" : ""}`}><div className="stage"><AppFrame /></div></div>
    </div>
  );
}

export default function App() {
  return <AppProvider><Shell /></AppProvider>;
}
