Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 8 — Premium Intelligence

Goal: CLAUDE.md section 15.

1. Context tiles across the top with the Texas figures listed; each tile has an info icon that opens the Help modal at the sources note (Help modal itself arrives in pass 10; stub it now).
2. The bundle table with policies, TIV, premium, market rate, PRIMER technical rate, adequacy and the 2027 recommendation; under-priced rows tinted orange, over-priced rows blue.
3. Selecting a bundle opens the science panel with the six items in section 15 including the sensitivity line, and the AAL vs PRIMER season expected loss comparison with the adequacy ratio, loss ratio and combined ratio.
4. The map Quick View "Rate gap" now shades bundle areas; a "2027" toggle in the panel shows the recommended change against the carrier's filed change.
5. Technical premium formula rendered (plain HTML, no LaTeX library) with a one-line explanation.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 8`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 8: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 8:` to `- [x] Pass 8:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
