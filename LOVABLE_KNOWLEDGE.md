# Paste this into Lovable → Project Settings → Knowledge

This is a conference demo of one feature in Blueprint's platform: it lists a Power Automate Desktop estate's flows and subflows, grades them as Copilot agent tools, recommends agents built from them, and creates the agent in Copilot Studio. It is a clickable prototype with synthetic data and scripted model output, driven by a presenter from the guide bar at the top. Read PROJECT_BRIEF.md before any change.

Rules that must survive every edit:

1. Product-realistic. Nothing persuasive inside the app frame: no slogans, no comparison cards, no "Blueprint does this for you". Guide-bar notes say only what is on screen.
2. Keep the honesty lines: "Prototype · example data · scripted model output", "Mock · scripted", and the guide-bar line about synthetic data. Never claim the data or the AI output is real.
3. Blueprint attaches flows to agents and creates agents in Copilot Studio. It never "creates agents" on its own.
4. Vocabulary is fixed. Status: Blocked / Needs prep / Ready, with warnings / Ready. Access: Read-only / No data access / Writes only / Reads and writes. Kinds: Flow / Sub-tree / Subflow. Hidden rows are "set aside". Do not introduce: harvest, grain, fingerprint, clone family, orchestrator, scaffolding, wire now.
5. No agent-level score. Agents rank on counts; scores are per tool.
6. The eight walkthrough steps and their order are fixed unless the owner changes them. Short path = steps 1, 4, 5, 6, 7.
7. Scoring logic lives in src/lib/scoring.ts and must match the brief's tables. Do not change weights or thresholds without being asked.
8. Keep the product look: light theme, navy header, grey table header, blue links, drawer on the right, Open Sans in the frame. Nothing below 12px. Do not replace src/styles/app.css with a redesign.
9. Keyboard behaviour: arrows move the walkthrough, Escape closes dialog → Copilot mock → drawer. Keep it.
10. State and actions live in src/state/store.tsx. Add new behaviour as actions there, not as ad-hoc local state, unless it is purely a form field.

When asked for a change, make the smallest edit that does it, in the component that owns that screen, and keep the stylesheet's existing class names.
