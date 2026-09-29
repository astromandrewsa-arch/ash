Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 4 — fires v2: ignition zones, bands and the spread animation

Goal: CLAUDE.md section 7 on screen, and the animation behaviour in section 10.

1. Clicking a fire marker (or a Locations at Risk row later) selects the fire: fly to zoom 12–13 depending on the zone class; draw the ignition zone boundary in orange with the ignition-prior heat inside (a canvas heat layer or graded circle markers, hottest along the lines).
2. Draw barriers from the recipe (lakes and rivers in blue, highways in grey, escarpments and plowed fields in a hatched grey).
3. Animation controls on the map: Play, Pause, Step, Reset, a step label (1 h, 4 h, 8 h … day N), and the wind and event strip that highlights the wind shift and spotting events as they occur. Two overlays toggled from Quick Views: isochrones (current step solid at 45%, earlier steps fainter, severity ramp by hour) and burn probability (P90 darkest, P50, P25 lightest at 35% alpha).
4. Homes and assets switch to red when the P50 perimeter reaches them at the current step; protected homes get a green ring and warned homes an amber ring when Intervention status is on or the Plan tab has been viewed.
5. Autoplay once on open; the close X resets homes to yellow and returns to the book view.
6. Verify all ten fires by screenshot at 8 h and at the last step; each must look different in the way section 7 describes. Fix the generator in pass 2's files if a shape does not read.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 4`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 4: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 4:` to `- [x] Pass 4:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
