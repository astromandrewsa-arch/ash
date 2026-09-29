Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 1 — prepare the repo, shell v2, smoke test

Goal: the existing v1 app keeps running while the skeleton of v2 is in place.

1. Confirm you are on branch `v2-overhaul` (create it from the current commit if not). Install `@turf/turf`, `jspdf`, `html2canvas`, and as dev dependencies `playwright` (then `npx playwright install chromium`). Keep react-leaflet, leaflet, recharts, lucide-react.
2. Replace `/src/styles/tokens.css` with the dark theme tokens from CLAUDE.md section 3 and apply them to the shell: rail with the eight items in section 4 (Simulation and Premium Intelligence are new; route them to placeholder pages that already use the glass styling), top bar with the forecast stamp, portfolio switch, search box and a Take-a-tour button (no behaviour yet), the "Your book" panel, the "Next 30 days" alert card with the eight rows, the slider, the 460 px drawer shell. Add the dark labels overlay tile layer above zoom 8. The map must still show the v1 data for now.
3. Write `scripts/smoke.mjs` exactly as CLAUDE.md section 21 describes, with a `--pass` argument used in screenshot names. It must work against `vite preview` (build first) and exit non-zero on console errors. Add `"smoke": "node scripts/smoke.mjs"` to package.json scripts.
4. Create PROGRESS.md (if missing) with the twelve passes as unticked boxes and DECISIONS.md with a header.
5. Write `/src/data/README.md` listing the v2 files from CLAUDE.md section 2 as "planned" so pass 2 fills them.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 1`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 1: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 1:` to `- [x] Pass 1:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
