Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 11 — tour, PDF export, Reports

Goal: CLAUDE.md sections 17 and 18.

1. Tour: welcome modal on first load (localStorage remembers Not now), re-openable from the top bar. Seven steps on PH-01 exactly as section 18, with a dimming overlay, highlighted element, caption card, Next/Back, progress dots, and the map, drawer and pages driven programmatically. Step 7 waits for the user's click on a Locations at Risk row, then ends with the three chips.
2. PDF export: jsPDF + html2canvas per section 17; real download named `pyrome-<fireId>-<date>.pdf`, multi-page, with the four spread snapshots. Handle tile CORS as section 17 says and log the outcome in DECISIONS.md. Wire it to the More-info Export tab and the drawer footer.
3. Reports page: one button "Export season report (PDF)" that builds the season report with the same generator (all fires plus the Historical Accuracy tiles) and downloads it; show a progress state while it builds.
4. Test the tour end to end in the smoke script (add a `--tour` step that drives it with clicks) and open the generated PDF to confirm it has pages.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 11`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 11: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 11:` to `- [x] Pass 11:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
