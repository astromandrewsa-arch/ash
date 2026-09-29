# Mock data (v2)

Every figure the portal shows comes from this folder. The files are written by
`node scripts/generateData.mjs` (or `npm run data`, which also runs `scripts/checkData.mjs`) from a fixed
seed, so reruns give identical output and hand edits are overwritten. Real geography (lakes, rivers,
freeways, wind turbine positions) is read from `scripts/geo/`, vendored once from Esri's public Living
Atlas by `scripts/fetchGeo.mjs`. Coordinates are `[lat, lng]`; money is USD.

**areas.json** — the 100 covered areas of CLAUDE.md §6 (66 homes clusters, 23 utility areas, 11 ranches).
Each has an irregular polygon, type, group, bundle, county, home count, TIV, premium and a real fire-history hook.
Utility areas carry `assetIds`; ranch areas carry `ranchId`; every area lists 6–10 sensor sites.

**homes.json** — 49,500 insured homes on jittered street grids inside the homes clusters (compact JSON).
Each has a 4-point footprint, centroid, invented street-style address, TIV, premium, construction, year, roof class, defensible space.
`protectedState` is `protected` or `warned` for homes a dated fire's plan covers, otherwise null.

**assets.json** — 23 utility assets: lines (poles every 90 m), pipelines (pump stations), refineries, tank farms, wind farms, substations.
Lines and pipelines are routed through real towns; wind farms use real turbine positions from the US Wind Turbine Database.
Each has operator, TIV, km, one line of ignition history and its wildfire-mitigation-plan status.

**ranches.json** — 11 rangeland policies (8 Texas, 3 Osage).
Acres, pastures, last burn, cattle and bison, fence km, headquarters and camps, and TIV split into structures, fencing, livestock, forage.
Texas ranches total $0.6B; the Osage block is the $0.2B Osage rangeland bundle.

**fires.json** — the ten dated fires of §7 (compact JSON).
Ignition zone (polygon, ignition-prior heat points), window, probability, fuel state (both clocks, thresholds, 30-day series and projection), narrowing strip, recipe and events, barriers, and P90/P50/P25 perimeters at every step (`held: true` steps repeat the previous perimeter).
Bands carry homes, assets, TIV, damage ratio, loss and gross; `homesInPath`/`assetsInPath` give band and hour reached; `exposureText` and `pathLabel` are the drawer's exposure line and the marker label; losses are calibrated to within ±10% of the §7 table.

**watchlist.json** — five areas dated below the 90% threshold (§7).
Probability, window length, narrowing rate and a note on the sensor state.
Centred on the area they sit in.

**plans.json** — one intervention plan per fire (§11): verdict, actions with owner, payer, cost and dates.
Payer split, pPrevent, pFire after plan, loss if the plan holds or fails, the scope rule where it applies.
Protected and warned home ids (ranked by TIV × damage ratio), warnings ledger, mitigation credit, and the three §14 expected losses.

**negotiations.json** — the Pyrome agent's negotiation for each dated fire plus four from last month (§12).
Stage (including Partial and State plan branches), counterparty, decision due, dated entries (declined ones flagged).
Ledger with agreed cost, saving, status and documents.

**bundles.json** — nine Premium Intelligence bundles (§15): the eight listed plus the Osage rangeland row.
Policies, TIV and premium from the priced areas (`insuredAreaIds`); market and PRIMER technical rate, technical premium and gap, adequacy, 2027 recommendation and the carrier's filed change.
Science panel inputs, long-run AAL, PRIMER season expected loss, loss ratio and combined ratio.

**historical.json** — twelve 2025–26 fires (§16) and the ruled-out table.
What PRIMER said, what each named model said before the fire (or "no date"), cost, premium saved, realised loss.
An outcome sentence by type: prevented, declined-then-burned, or back-test.

**models.json** — PRIMER and the seven named models (§16).
Name, short name, version, outputs, resolution, forecast horizon, fuel treatment.
Hit rate by lead time (null outside the horizon), long-run hit rate for the cat models, Brier score where one exists.

**seasonStats.json** — headline tiles for Historical Accuracy.
Reliability bins, Brier by model and range, and the LA 2025 flash-estimate tile (with numeric ranges).
The Crabapple before/after exhibit (illustrative scar, PRIMER's back-test perimeter, overlap) and the page footer text.

**portfolio.json** — the two books (Texas HO; Texas + Oklahoma) and the map's opening view.
Totals, AAL, OEP 1-in-100 and 1-in-250, TVaR, EP curve points, top-10 concentrations, data-quality strip.
Also the pricing inputs for the technical premium, the Texas context tiles and the Simulation book totals.

**fuelGrid.json** — the four Quick View fuel grids (live moisture, 10-h dead moisture, curing, ERC).
200 m cells over every area (coarser over the large ranches), stored per area as origin, cell size and row/column pairs.
Values are reddest near each fire's ignition zone.

**meta.json** — forecast issue stamp, the signed-in user and the forecast definition.

The v1 data (six areas, six fires) sits in `v1/` and feeds the screens not yet rebuilt; it is deleted in pass 12.
