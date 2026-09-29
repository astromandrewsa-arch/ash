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
- [ ] Pass 5: fire drawer v2, More info, negotiation stepper (in progress since 2026-09-29 07:18 UTC)
- [ ] Pass 6: Locations at Risk v2
- [ ] Pass 7: Simulation (30-day)
- [ ] Pass 8: Premium Intelligence
- [ ] Pass 9: Historical Accuracy v2
- [ ] Pass 10: UI polish, Help, README
- [ ] Pass 11: tour, PDF export, Reports
- [ ] Pass 12: acceptance and hand-over

## Blocked

(none)

## Acceptance

(filled in pass 12)
