Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 9 — Historical Accuracy v2

Goal: CLAUDE.md section 16.

1. Model exhibit table at the top from models.json (eight rows).
2. Headline tiles; the hit-rate chart with PRIMER in orange, ECMWF and Technosylva in blue only inside their horizons with an "horizon ends" marker, cat models as flat long-run lines; reliability line and Brier under it; the LA 2025 tile.
3. The twelve historical rows with what PRIMER said, what each named model said (or "no date"), and the outcome sentence by type.
4. The "Mitigation they called that PRIMER ruled out" table (four rows).
5. The before/after satellite slider on the Crabapple analogue (30.392, −98.783): two synchronised Leaflet maps, desaturated after-side with a dark burn-scar polygon, predicted perimeter in orange over both, draggable divider.
6. Footer sentence exactly as section 16.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 9`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 9: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 9:` to `- [x] Pass 9:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
