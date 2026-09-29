Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 12 — acceptance and hand-over

Goal: every line of CLAUDE.md section 20 passes; the repo is ready to show.

1. Go through the thirteen acceptance lines one by one in the built app (use the smoke script plus targeted Playwright checks you write in `scripts/acceptance.mjs`). Fix every failure. Record pass/fail per line in PROGRESS.md under "Acceptance".
2. Remove every console warning; `npm run build` clean; delete dead v1 code and unused data files; make sure `npm run data` regenerates everything deterministically (run it twice and diff).
3. README.md: the two commands, the data generator paragraph, and the five-minute demo script: overview → PH-01 spread → More info → Simulation → Premium Intelligence → Historical Accuracy, one sentence per stop with what to say.
4. Screenshot every screen to `screenshots/final-*.png` and have a subagent review the set as a demanding designer; fix its top ten findings.
5. Commit, then write a `HANDOVER.md`: what was built, what deviates from CLAUDE.md and why, known rough edges, and the three things to check first in the morning. Final message: the contents of HANDOVER.md.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 12`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 12: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 12:` to `- [x] Pass 12:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
