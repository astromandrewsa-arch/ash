# START HERE — the two messages you paste into the cloud session

## Message 1 (paste as-is)

/model best

## Message 2 (paste as-is)

/effort xhigh

## Message 3 — the overnight instruction (paste all of it)

Read CLAUDE.md, RUNBOOK.md, PROGRESS.md and DECISIONS.md. You are running unattended overnight. Work through all twelve passes in runbook/pass-01.md to runbook/pass-12.md, in order, one after another. Do not stop to report between passes and never ask me anything: when something is open, decide, log it in DECISIONS.md, and carry on. Follow each pass file exactly, including its trailer: build clean, smoke test green with zero console errors, look at the screenshots and fix what looks unfinished, commit, push to the v2-overhaul branch, tick the pass in PROGRESS.md. If a pass fails, fix it and retry it; only if it is truly blocked after three different approaches, write the blocker under Blocked in PROGRESS.md, commit what works, and move to the next pass. Use subagents for verbose work such as tests and screenshot review so your context stays clean. When PROGRESS.md shows all twelve passes ticked and HANDOVER.md exists, stop and reply with the full contents of HANDOVER.md.

## Optional safety net — a Routine that picks up where the session left off

Create it at claude.ai/code/routines (New routine → your repository → schedule: hourly → paste this prompt → model: best). Turn it off in the morning.

Check out the v2-overhaul branch of this repository (create it from the default branch if it does not exist) and read CLAUDE.md, RUNBOOK.md, PROGRESS.md and DECISIONS.md. Find the first pass in PROGRESS.md that is not ticked. If its line carries an "in progress since" stamp less than 3 hours old, another session is working on it: reply "pass N in progress elsewhere" and stop. Otherwise do that one pass exactly as its runbook/pass-NN.md file says, including the trailer (build, smoke test, screenshot review, commit, push to v2-overhaul, tick the pass). Do not ask questions; decide and log in DECISIONS.md. Do only one pass per run. If all twelve are ticked, reply "all passes done" and stop.
