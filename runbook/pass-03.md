Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 3 — map v2

Goal: CLAUDE.md sections 4 and 9 on the new data.

1. Rendering: canvas renderer; cluster dots below zoom 9; viewport-limited circle markers at 9–13; footprints from 14. Measure `moveend` handling stays under 200 ms with all 49,500 homes loaded (log timing in dev; remove the log before commit). Utilities: yellow polylines with pole dots from zoom 12, footprints and icons from section 3. Ranches: hatched yellow at 25% with a label.
2. Quick Views groups exactly as section 9, including the four fuel grids (200 m squares coloured by a generated field that is reddest at each fire's ignition zone), sensor sites, intervention status rings, and the rate-gap shading placeholder (bundle polygons in blue/orange by adequacy from bundles.json).
3. Fire markers as flame glyphs sized by intensity class with the pulsing glow; watchlist rings with the probability inside; the slider with window tick bands; markers appear at the right slider value and stay. Marker labels in the section 9 format.
4. Alert card sums from the visible fires: expected loss point and band, exposed TIV, dated fires, watchlist, homes in path, assets in path, preventable at negotiated plans, carrier cost to date. Numbers animate.
5. "Your book" panel from portfolio.json; the portfolio switch changes the data set and the map view.
6. Asset click and ranch click open the drawer with the asset or ranch card (section 9). Hover tooltips on homes with the fields listed.
7. Search: fire ID, place, asset or bundle name flies the map there and opens the relevant card.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 3`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 3: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 3:` to `- [x] Pass 3:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
