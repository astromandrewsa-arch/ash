Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 7 — Simulation (30-day)

Goal: CLAUDE.md section 14.

1. Calendar strip of 30 days from 29 Sep with the ten fires placed on their windows, severity colours, shield icons on state-plan fires.
2. Intervention schedule table on the left. Per-fire arithmetic on the right with the three-way toggle No intervention · As negotiated · Every plan fails, computed from plans.json and fires.json with the formulas in section 14, never hard-coded. Book rows at the bottom; carrier share of cost.
3. Under the table: premium at risk, season loss ratio under each toggle, return period of each book outcome, one line per fire on who is paying and whether they have agreed, the state-plan statement.
4. A recharts bar chart of the three book totals with the carrier cost as a thin fourth bar, in the token colours.
5. Verify the book totals printed by `node scripts/checkData.mjs` match the screen.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 7`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 7: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 7:` to `- [x] Pass 7:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
