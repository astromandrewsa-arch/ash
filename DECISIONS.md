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
- 2026-09-29 · Real geography (lakes, rivers, interstates, wind turbines) vendored once from Esri's public Living Atlas into `scripts/geo/` by `scripts/fetchGeo.mjs` · OpenStreetMap's Overpass API is blocked from the build VM; vendoring keeps `npm run data` offline and deterministic and lets barriers line up with the imagery.
- 2026-09-29 · Spread polygon operations use `clipper-lib` (dev dependency) instead of turf's union · turf's polyclip threw on the self-crossing rings vertex expansion produces; Clipper's integer engine is robust.
- 2026-09-29 · Huygens update moves each vertex to the wavelet point with the front's normal (Richards 1990), and the ellipse half-width grows at R(1+b)/(2·LB) · moving along the normal by the support function fattened the head 4×; the stated "flank rate R × f" would double the width LB implies. PH-01 uses a 1.25 flank factor to meet the §7 sanity check (2,063 ha at 1 h, 112,420 ha at 8 h).
- 2026-09-29 · Rings are resampled to 72–420 vertices each sub-step · a fixed 72-vertex ring cannot hold fingers or bays on a 250 km fire.
- 2026-09-29 · Recipe head rates are applied as peak rates scaled per fire by a `rateScale` (BA-03 0.075, OK-10 0.14, PK-06 0.6, PH-01 1.0), with day factors and a hold hour when crews stop the spread · literal rates over 5–14 day windows burn whole counties; scaled rates keep each fire on its analogue's scale and let the §7 shapes read. The drawer shows the recipe's rates.
- 2026-09-29 · Fingers can be anchored to a draw or ROW corridor (AU-02, PB-08); the normal-bearing rule stays the default · normal-only boosts merged into one bulge at map scale.
- 2026-09-29 · Spot fires may not land across a hard barrier (lakes, the Colorado, the Brazos) · otherwise AU-02's P50 jumped Lake Austin and burned toward Bee Cave.
- 2026-09-29 · Bands are nested by construction (P50 ⊇ P90, P25 ⊇ P50 at every step) · "burns in ≥90% of runs" implies it burns in ≥50%; independent runs with random spotting could otherwise cross.
- 2026-09-29 · Band losses = Σ TIV × damage ratio (construction 0.72/0.55/0.45 × roof × defensible space; assets 0.15–0.35; ranch forage 0.9, fencing 0.8, livestock 0.12, structures 0.6) × a per-band severity factor solved to land on the §7 targets · P90/P50/P25 run at 0.8R/R/1.25R, so intensity and damage differ by band; the spec's band ratios (0.68, 1.35) match R^1.5 scaling. Factors stay within 0.35–1.6.
- 2026-09-29 · Home clusters in a fire's path are slid along a bearing (after the spread is simulated) until the P50 path holds the §7 home count · the only reliable way to hit 240/410/160/35/120/310 homes; Carbon's cluster ends ~4 km west of the town and Fredericksburg's north-west of it.
- 2026-09-29 · Rangeland band damage ratios come out 0.24–0.46, not 0.08 · the §7 rangeland losses ($9–22M) cannot be reached at 0.08 without exposing several whole ranches.
- 2026-09-29 · CT-04's P50 loss target is $24.6M (within 10% of $26M) · keeps the §7 severity rule (P50 above $25M ⇒ Severe) consistent with its Non-severe label.
- 2026-09-29 · Simulation: E[plan] for a state agency plan uses lossIfHolds (the plan cuts loss, it cannot prevent); E[fails] uses the dated pFire, not pFireAfterPlan · a failed plan also loses the PSPS cut; the book lands at $347M / $98M / $161M / $1.2M against the spec's $349M / $98M / $159M / $1.2M (the literal E[fails] formula gives $135M).
- 2026-09-29 · Nine bundles: the eight listed in §15 plus the table's Osage rangeland row; Austin North (not in the table) gets market $5.9 / PRIMER $6.4 per $1,000, +8% · the list and the table name different sets; home-bundle figures are homes only, matching the table.
- 2026-09-29 · Texas towns TIV comes to $5.57B, not §6's $6.5B · the §15 bundle table fixes each town bundle's TIV and wins.
- 2026-09-29 · Line lengths follow the real routes: Xcel 100 km (spec 110), PEC 101 km (85 is shorter than the road distance Lakeway → Marble Falls → Fredericksburg), Basin cut at 180 km (the spec's "segment"; Colorado City → Wichita Falls is 277 km).
- 2026-09-29 · Roscoe wind farm uses the 627 real turbines nearest the stated centroid · the stated point sits among several real projects; ownership in the demo is mock.
- 2026-09-29 · After crews hold a fire, later steps are written as `held: true` without polygons · cuts fires.json from 4.9 MB to 2.2 MB; the app reuses the previous perimeter.
- 2026-09-29 · Book EP curve, AAL and TVaR are generator inputs (TX+OK OEP 1-in-100 $260M, 1-in-250 $390M; Texas book 86% of it); return periods are read off it.
