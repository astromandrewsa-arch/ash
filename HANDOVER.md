# HANDOVER — Pyrome demo v2

Stopped mid pass 11 at the user's request. Branch `v2-overhaul`; passes 1–10 ticked in PROGRESS.md, pass 11 half done, pass 12 not started.

## What was built

- Dark cartographic shell (§3–4): rail, glass top bar, Your book, Next 30 days alert card, lane slider with window bands, 460 px drawer.
- Data generator (`npm run data`, seed 20260929, `checkData` passes): 100 areas, 49,500 homes with invented addresses, 23 assets, 11 ranches, ten Huygens-spread fires with P90/P50/P25 at every step, plans, negotiations, bundles, history, models, two portfolios with EP curves, fuel grids, Help text.
- Canvas map (clusters → dots → footprints), utilities, ranches, all Quick Views, flame and watchlist markers, rate-gap shading, search.
- Fire drawer (Forecast · Spread · Exposure · Plan · Negotiation), More info panel, animated stepper.
- Locations at Risk, Simulation, Premium Intelligence, Historical Accuracy (incl. before/after slider), Negotiation Channel, Help — all v2.
- Pass 11 part: per-fire PDF export (6 pages for PH-01) from the drawer footer and More info → Export.

## Deviations from CLAUDE.md (all logged in DECISIONS.md)

- React 19 / react-leaflet 5, not React 18.
- Default portfolio is Texas + Oklahoma (map still opens on the Texas view).
- Nine bundles (§15 list plus the table's Osage row); Texas towns TIV $5.57B, not $6.5B.
- Book totals $347M / $97.9M / $161M / $1.2M against the spec's guide $349M / $98M / $159M / $1.2M (computed from data).
- PH-01 ≈ 70,000 ha at 8 h (spec ≈ 120,000); CT-04 reads as a λ, not a T; OK-10 starts 1.5 km apart across the wind.
- Band cards are one three-column exhibit; Locations and Simulation stack related columns.
- NFDRS added to the hit-rate chart; Crabapple scar is illustrative.
- PDF maps are drawn offscreen from tiles, not captured from the Leaflet container.

## Known rough edges

- No tour: "Take a tour" does nothing, no welcome modal.
- Reports is still the v1 legacy screen; the season-report builder exists but no button calls it.
- v1 legacy code and data (`src/data/v1`, `src/styles/legacy`, `.v1-legacy`) not yet deleted.
- Smoke test has no PDF or tour step; PDF pages not visually reviewed.
- README demo script says "Filled in pass 12".
- First PDF export under `npm run dev` may reload once (Vite dependency optimisation); `preview` is fine.

## Three things to check first

1. `npm run build` and `node scripts/smoke.mjs --pass 11` both green.
2. On `npm run preview`, open PH-01 (search box), press "Export fire report (PDF)" in the drawer footer, and read the file.
3. Walk overview → PH-01 spread → More info → Simulation → Premium Intelligence → Historical Accuracy; skip Reports and the tour.
