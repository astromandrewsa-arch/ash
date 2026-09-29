Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 10 — UI polish, Help, README

Goal: the whole app looks like one finished product (CLAUDE.md sections 3 and 4) and the Help modal (section 17) exists.

1. Walk every screen and every state (empty drawer, no fires visible at slider −30, filters that return nothing, long lists) and fix spacing, alignment, contrast, truncation and default Leaflet styling that shows through (zoom control, attribution, popup styling). Replace default Leaflet controls with styled ones.
2. Motion: panels 180 ms, perimeter growth 600 ms, numbers count up 500 ms, marker glow periods by severity, 300 ms skeletons on page switch. No jank on the map.
3. Icons for every asset kind and rail item; flame glyph sizes by intensity class; pills and tiles consistent.
4. Help modal with every definition in sections 17 and 19, the forecast definition, the payer rule, the not-modelled list, the Texas note, and a sources note listing the public figures used on the Premium Intelligence tiles. Open it from the rail and from info icons.
5. README.md: the two commands, a paragraph on the data generator, and a placeholder heading for the demo script (filled in pass 12).
6. Take three full-page screenshots (Map with PH-01 open, Simulation, Premium Intelligence) and review them with a subagent acting as a demanding product designer; apply its top ten fixes.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 10`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 10: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 10:` to `- [x] Pass 10:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
