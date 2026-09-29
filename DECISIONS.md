# DECISIONS — choices made while building unattended

One line each: date · what · why.


- 2026-09-29 · Work on `v2-overhaul` as the overnight instruction says, and mirror every push to the session branch `claude/hopeful-pasteur-tx41b0` · the session was started on that branch; mirroring keeps both copies current.
- 2026-09-29 · Keep React 19 and react-leaflet 5 (CLAUDE.md §2 says React 18) · the v1 repo already runs React 19 and react-leaflet 5 requires it; nothing in the spec depends on 18.
- 2026-09-29 · Pin `playwright` 1.56.1 and skip `npx playwright install chromium` · 1.56.1 matches the Chromium build pre-installed in the cloud image, which forbids re-downloading browsers.
- 2026-09-29 · Smoke test routes Chromium through the session proxy and trusts the proxy CA by public-key pin · keeps TLS verification on; tile and font network failures are reported as network notes, not app errors.
- 2026-09-29 · Smoke-test steps carry the pass that introduces their feature (More info from pass 5, Simulation toggle from pass 7, tour from pass 11) · earlier passes report them as skipped instead of failing.
- 2026-09-29 · v1 styles scoped under `.v1-legacy` (native CSS nesting, dark-remapped v1 token names) and v1 data moved to `src/data/v1` · v1 screens keep working inside the dark shell until their pass replaces them; both are deleted in pass 12.
- 2026-09-29 · Default portfolio is "Texas + Oklahoma", while the map still opens on the Texas view (31.3, −99.5, z6) · the acceptance list needs ~100 areas, all ten fires and the $349M book total on first load; the Texas HO book (84 areas, 8 fires) is one click away and flies to its own view.
- 2026-09-29 · Screenshots are git-ignored except `screenshots/final-*.png` · per-pass PNGs would add ~200 MB to the repo; the final set is committed in pass 12.
- 2026-09-29 · Zoom control and attribution sit in the bottom-left corner under the left panel column · bottom-right is covered by the drawer and the slider dock whenever a fire is open.
- 2026-09-29 · Slider rule: a fire appears when the slider reaches −(days to window start) and its tick band spans −(days to window end) to −(days to window start), stacked in lanes when windows overlap · literal reading of §4 and §9.
