# Agent Tooling demo: project brief

A clickable prototype of one feature inside Blueprint's platform, built for the Power Platform Community Conference (PPCC, 26–27 October 2026). It is shown on a projector by a presenter. The audience are Power Automate Desktop and Copilot Studio builders, Microsoft people and enterprise automation leads. They have never seen Blueprint's internal vocabulary.

## What the feature does

Blueprint scans a customer's Power Automate Desktop (PAD) estate and:

1. **Lists every flow and subflow** with a Status, an Access value, a score, and usage. Framework plumbing, batch loops and tiny helpers are set aside.
2. **Grades each one** as a Copilot agent tool (Readiness, or the shipped Tool score) and ranks it by Value.
3. **Recommends agents** built from those flows and subflows. AI suggests the grouping; code checks every tool against the flow's own code and removes what fails.
4. **Creates the agent in Copilot Studio** with the ready tools attached; the Copilot Studio mock then shows the agent answering by calling a flow.

A "Describe a job" tab is the other way in: type what the agent should do, matching flows come back in the same table.

## Hard rules (decided by the product owner; do not undo them)

- **Product-realistic.** No sales copy, slogans, comparison cards or "Blueprint does this for you" asides inside the app frame. Persuasion belongs to the presenter. The guide bar notes stay flat: what is on screen, nothing more.
- **Honesty lines stay.** "Prototype · example data · scripted model output" in the frame; "Mock · scripted" on the Copilot Studio mock; "Example data: synthetic Contoso Finance estate. Model output is scripted." in the guide bar. The data is synthetic; never present it as real.
- **Blueprint does not create agents on its own.** The Create agent dialog creates it *in Copilot Studio*. Per-tool "Add to an existing agent" is the shipped mechanism underneath.
- **Walkthrough order** (eight steps): Flows and subflows → Switch Company Code drawer → Export GR/IR Open Items drawer → Recommended agents → AP lookup agent → Create agent → Copilot Studio → Describe a job. Short path is steps 1, 4, 5, 6, 7.
- **Vocabulary, one word per concept.** Status: Blocked / Needs prep / Ready, with warnings / Ready. Access: Read-only / No data access / Writes only / Reads and writes. Record kinds: Flow / Sub-tree (a subflow scored with every subflow it calls; "contains N subflows") / Subflow. Hidden rows are "set aside". Never use these internal terms on screen: harvest, grain, fingerprint, clone family, orchestrator, scaffolding, Migrator artifact, wire now, fails until harvested.
- **No agent-level score.** Agents are ranked on columns (Ready, Needs prep, Runs behind tools, Blockers to resolve), never one number. Scores are shown per tool.
- **Light theme, the product's look.** Navy header, grey table header, blue links, drawer on the right, Open Sans in the app frame, Red Hat Display in the guide bar. Nothing on screen below 12px.
- **Keyboard.** Arrow keys move the walkthrough (not while typing in a field); Escape closes the dialog, then the Copilot mock, then the drawer. The Create dialog focuses its Create button so arrows keep working.

## Scoring (both schemes are in `src/lib/scoring.ts`, chosen by the Score toggle in the guide bar)

- **PRD readiness** (default): the shipped criteria with the PRD's weights, out of 55, shown as a percentage. Actions 10, Inputs 10 (inputs only), Applications 15, Hardcoded sensitive values 5, Undeclared variables 10, Error handling 5 (5 if errors reach the caller, 3 if some handlers swallow, 0 if all swallow or none). Decision complexity is informational, 0 points. Runs and failures are *Value* signals, not readiness.
- **Value**: the mean of three percentiles within the estate: runs in 12 months, success rate, copies across flows. Missing signals are left out and named. Used to rank, never to gate.
- **Shipped (ITEM-182)**: the product's Agent Tool Scoring, out of 100 with runtime data on: Total runs 20, Failed runs 10, Actions 20, Arguments 10, Applications 15, Sensitive values 5, Undeclared variables 5, Decision complexity 10, Error handling 5. Grade bands 80/60/40 → Strong / Good / Fair / Poor. In this mode the Value and Copies columns are hidden.
- **Status is separate from the score.** Blocked = a fail-level blocker; Needs prep = a subflow (it must become its own desktop flow first); Ready, with warnings = a whole flow with warnings; Ready = a whole flow with none. The shipped score can rank a Blocked subflow high; Status is what gates.

## Where things live

- `src/data/estate.ts` — the synthetic estate (3 flows, 37 components, 5 copy families, 3 agents), the Copilot chat script, per-component Access.
- `src/lib/model.ts` — indexes, status, record kind, access labels, agent helpers.
- `src/lib/scoring.ts` — both score schemes, Value, agent stats.
- `src/state/store.tsx` — all UI state, the walkthrough steps, every action (`act("comp:c5")` style, mirroring the original prototype).
- `src/components/` — one file per screen: `GuideBar`, `AppFrame`, `FlowsTable` + `ComponentTable`, `Drawer`, `Agents` (list and detail), `Dialogs`, `CopilotStudio`, `DescribeJob`, `ui` (chips and widgets).
- `src/styles/app.css` — the prototype's stylesheet, carried over unchanged. Tailwind is installed with preflight off; use it for new pieces if you like, but the existing classes are plain CSS.

## Provenance

Ported from the single-file prototype `AI_Agent_Tooling_PPCC_Demo_v3.html` (21 October 2026). The scoring rules come from Jira ITEM-182 (shipped) and the AI Agent Tooling MVP requirements §3–§6 (PRD); record kinds from ITEM-459.
