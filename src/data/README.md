# Mock data

Everything the demo shows comes from these files. The generated ones are rebuilt by
`node scripts/generateData.mjs` (or `npm run data`) from a fixed seed, so reruns give the same output
and any hand edits to them are overwritten. The hand-authored ones are never touched by the script.

## Generated

**coverageAreas.json**
Six coverage areas (Hill Country, Panhandle, Cross Timbers, Bastrop, Palo Pinto, Wichita Falls), each a polygon about 11–14 km across.
Per area: code, nearby town, county, hectares, homes count, TIV, annual premium and its dated fire ID.
Each lists three localities (the home clusters) with a centre and home count, used for the cluster dots below zoom 11.

**homes.json**
About 600 homes, roughly 100 per area, each a 12–20 m rotated rectangle on a jittered street grid.
Each has an invented street address and locality, policy number, TIV ($180k–$1.4M), construction class and annual premium (about 0.6% of TIV).
`nearestFire` gives the closest dated fire and the distance in km to its ignition point, for the hover card.

**fires.json**
Six dated fires, one per area (HC14, PH03, CT22, QD71, PP08, WF15), 6–29 days out, with 4–7 day windows narrowed from a 14-day call.
Each has the ignition block, fuel state and drying trajectory, intensity, spread perimeters (1 h, 8 h, 24 h, then daily) and barrier lines.
`homesInPath` lists engulfed homes with the step and day reached; `exposure` and `intervention` hold the money figures.

**agentTimelines.json**
The six-step stepper (Identified → Fire prevented) and eight agent processes: the six current fires plus HC09 and WF11 from last month.
Each has the Pyrome agent, counterpart bodies, stage, RAG status, a ledger line and dated entries (refusals flagged, the next action marked `planned`).
Entry `day` is relative to the predicted fire date; anything after the 28 Sep 2026 issue date is planned.

**historicalFires.json**
Twelve fires from the 2025–26 season: 5 prevented after intervention, 4 declined and then burned on the predicted date, 3 back-tests.
Each records lead time, window, cost and premium saved or realised loss, and which comparison models caught it and how far out.
BR27 carries `beforeAfter`: the burn scar and PRIMER's predicted perimeter as polygons, with their overlap.

**models.json**
PRIMER plus three comparison models: PoF Grid (ECMWF-style probability of fire), FWI (fire-weather index) and SatRisk (satellite risk score).
Hit rate at 7, 14, 21 and 30 days lead time; PRIMER leads at every lead time and the gap widens as lead time grows.
Feeds the Historical Accuracy chart (PRIMER in orange, the others in Comparison Blue).

**seasonStats.json**
Headline tiles for Historical Accuracy: fires dated, prevented, premium saved and realised loss on declined interventions.
Counts and money are summed from historicalFires.json; the 14-day hit rates are copied from models.json.
Also a Brier score per model (lower is better).

**portfolio.json** (totals generated, `options` kept)
The portfolio selector options and the Your Locations figures: TIV, homes covered and hectares under forecast.
The generator rewrites the totals from homes.json and coverageAreas.json but keeps the options list.
Also holds the book's annual premium and baseline AAL, used for the AAL uplift percentage.

**alertSummary.json** (totals generated, `title` kept)
Figures for the "Next 30 days" alert card with every dated fire included.
Written from fires.json: TIV that will burn, premium at risk, dated fires, homes in path and loss preventable if intervened.
The app will recompute these from fires.json as the slider moves.

## Hand-authored

**forecast.json**
The PRIMER forecast shown in the top-bar selector.
Model name, region and issue time (28 Sep 2026, 06:00).
Not touched by the generator.

**mapConfig.json**
Map start position (Texas, 31.3, −99.5 at zoom 6) and zoom limits.
Esri World Imagery tile URL, attribution and maximum native zoom.
Not touched by the generator.

**quickViews.json**
The seven Quick Views layer toggles in panel order.
Each has an id, label, legend swatch and default on/off state.
Not touched by the generator.

**timeline.json**
The "Days until fire" slider: range −30 to 0, step and starting value.
Tick marks shown under the track.
Not touched by the generator.

**user.json**
The signed-in demo user shown in the avatar.
An invented name, initials and role.
Not touched by the generator.

## How the money figures are derived

- Expected loss: each engulfed home's TIV × a damage ratio of 0.6–0.8, about 70% overall.
- Loss avoided: expected loss × the intervention's prevention probability.
- Premium saved over 5 years: five years of premium retained on the homes in path, plus reinsurance reinstatement premium avoided (12% of loss avoided).
- AAL uplift: 90% × expected loss spread over a 20-year view, also shown as a percentage of the book's baseline AAL (0.45% of TIV).
- Net benefit: loss avoided + premium saved − cost of the work.
