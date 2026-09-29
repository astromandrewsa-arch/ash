# PROGRESS — Pyrome demo v2 overhaul

Tick a pass only when its build, smoke test and commit are done.

- [x] Pass 1: prepare the repo, shell v2, smoke test
  - Dark v2 shell (8-item rail, glass top bar with stamp, portfolio switch, search, tour button; Your book; Next 30 days with 8 rows; lane slider with window bands; 460 px drawer), labels overlay above z8, Simulation/Premium frames, `scripts/smoke.mjs`; v1 screens run inside a `.v1-legacy` scope; React 19 kept.
- [x] Pass 2: data generator v2
  - `npm run data` (seed 20260929) writes all 15 JSON files: 100 areas, 49,500 homes, 23 assets, 11 ranches, ten Huygens fires with nested P90/P50/P25 at every step and losses within ±10% of §7, plans, negotiations, nine bundles, history, models, portfolios with EP curves, 200 m fuel grids; `checkData` passes (book $347M / $98M / $161M / $1.2M vs the spec's $349M / $98M / $159M / $1.2M); real water, rivers, highways and turbines vendored from Esri Living Atlas; fire-history lines fact-checked against official reports.
- [x] Pass 3: map v2
  - v2 map on the new data: boot loader for the big files; homes on canvas (merged cluster dots below z9, 2 px dots z9–13, footprints z14+, 10–85 ms per moveend), utilities (cased lines, poles from z12, footprints, icon chips), hatched ranches with labels, Quick Views exactly as §9 (fuel grids, sensors, RAG rings, rate gap), flame and watchlist markers with placed labels, v2 book panel, alert card and slider, drawer cards for fire, asset, ranch, area and bundle, home and cluster hover cards, search over fires, places, assets, ranches and bundles, themed portfolio switch. Deviation: cluster dots merge when overlapping.
- [x] Pass 4: fires v2: ignition zones, bands, spread animation
  - Ten fires retuned so each reads as §7 (PH-01 narrow post-front head onto the wheat, AU-02 three fingers, BA-03 trefoil with early spot fires, CT-04 bar and stem, HC-05 finger and egg, PK-06 crescent, RP-07 lopsided teardrop, PB-08 ROW lens with pads, OK-09 patch mosaic, OK-10 three cigars); spread drawn on three canvases (fills under homes, perimeter lines over them, wind arrow on a pill beside the fire), heat fades after 1 h, barriers clipped to the fire, isochrone contours, quarter-step zoom, seven tick labels, marker labels with each fire's main exposure; all band losses within ±10%. Deviations: PH-01 is ~70,000 ha at 8 h (§7 sanity ~120,000) because of Canadian River crossings; CT-04's T reads as λ with a diagonal bar; OK-10 starts are 1.5 km apart across the wind (2.1 km along the line).
- [x] Pass 5: fire drawer v2, More info, negotiation stepper
  - Fire drawer with Forecast (both fuel clocks, thresholds, fuel chart, narrowing strip), Spread (playback, wind and events, overlays, barriers), Exposure (lower/point/upper on a $ scale, ground-up/gross, band exhibit with rangeland rows, basis, in-path list), Plan (verdict, cost vs loss avoided, actions, payers, scope rule, warnings, credit, hand-off) and Negotiation (stepper with branch end states, agreed and in-principle payers, timeline, ledger); More info panel with a sortable address table, plan, negotiation and export tabs; per-location loss and expected loss in the data; production glass blur fixed. Deviation: the three band cards are one three-column exhibit.
- [x] Pass 6: Locations at Risk v2
  - v2 page on v2 data: seven summary tiles, a glass filter bar (type, state and severity chips; bundle, probability, days away, verdict and stage menus; count and reset), a sortable ELT-style table with every §13 figure (row or Enter opens the fire on the map with the slider set), an empty state, and the top-10 exposed-TIV concentration strip with linear accumulations flagged; exposure types and exposed concentrations generated into the data. Deviation: related columns share a cell to fit the page.
- [x] Pass 7: Simulation (30-day)
  - 30-day calendar with each fire on its window (severity colours, shields on state plans, arrows past day 30), intervention schedule, per-fire arithmetic with the No intervention · As negotiated · Every plan fails toggle and book rows computed in the browser from fires.json and plans.json ($347M / $97.9M / $161M / $1.2M, as checkData prints), premium at risk, season loss ratio and return period tiles, who-pays lines with agreement status, the state-plan statements, and the recharts bar chart with the carrier cost as a thin fourth bar. Deviation: schedule fields stack in four cells.
- [x] Pass 8: Premium Intelligence
  - Six Texas market tiles with info icons opening Help at the sources; a sortable bundle table (policies, TIV, premium, market and PRIMER rates, adequacy bar, 2027 recommendation against the filed change, all-bundles row; under-priced rows orange, over-priced blue); the science panel (fuel load, live and dead fuel, spread, intensity, sensitivity line, AAL against PRIMER season expected loss with adequacy, loss and combined ratios); the technical premium formula in HTML with its inputs; Rate gap shading per bundle with labels and a Today · 2027 switch in the Quick Views key; v2 Help dialog. Deviations: the page opens with the most under-priced bundle selected; the Texas ranches are no longer shaded because their homes bundles do not price them.
- [x] Pass 9: Historical Accuracy v2
  - Model exhibit (eight rows from models.json), six season tiles, the hit-rate chart (PRIMER orange to 30 days; ECMWF, Technosylva and NFDRS in blue up to their horizons with "horizon ends" markers; the four cat models as flat long-run lines), reliability line with a calibration plot and Brier by model, the LA 2025 flash-estimate tile, the twelve 2025–26 fires with every named model's call and the outcome sentence, the ruled-out table, the Crabapple before/after on two synchronised maps with a desaturated after side, dark scar, orange predicted perimeter and draggable divider, and the §16 footer. Deviations: NFDRS joins the chart as a third short-range model; the Crabapple scar is illustrative and generated; the footer uses a typographic apostrophe.
- [ ] Pass 10: UI polish, Help, README
- [ ] Pass 11: tour, PDF export, Reports
- [ ] Pass 12: acceptance and hand-over

## Blocked

(none)

## Acceptance

(filled in pass 12)
