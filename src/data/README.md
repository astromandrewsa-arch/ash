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

**fuelGrid.json**
A 200 m grid over each coverage area of days until the fuel crosses its threshold (0–35; -1 outside the area).
Lowest, and so reddest, around each fire's ignition point, rising with distance; rows run north to south.
Drawn as the Fuel-state grid Quick View, green → orange → red.

**sensors.json**
Six to ten sensor sites per coverage area, kept clear of homes.
Each has an id, type (fuel moisture probe, weather mast or smoke camera), position and installation year.
Drawn as small grey dots by the Sensor sites Quick View.

**agentTimelines.json**
The six-step stepper (Identified → Fire prevented) and eight agent processes: the six current fires plus HC09 and WF11 from last month.
Each has the Pyrome agent, counterpart bodies, stage, RAG status, a ledger line with document files, and dated entries (each with who acted and with whom; refusals flagged).
Entry `day` is relative to the predicted fire date; the next action, after the 28 Sep 2026 issue date, is marked `planned`.

**historicalFires.json**
Twelve fires from the 2025–26 season: 5 prevented after intervention, 4 declined and then burned on the predicted date, 3 back-tests.
Each records lead time, window, cost and premium saved or realised loss, and which comparison models caught it and how far out.
BR27 carries `beforeAfter`: the burn scar and PRIMER's predicted perimeter as polygons, with their overlap.

**models.json**
PRIMER plus three comparison models: PoF Grid (ECMWF-style probability of fire), FWI (fire-weather index) and SatRisk (satellite risk score), each with a short `kind` used in the back-test sentence.
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
The "Next 30 days" card title, plus its totals with every dated fire included, for reference.
The card itself sums fires.json live for the fires the slider has revealed, so these totals match it at slider 0.
Premium at risk is the fires' 5-year premium saved; preventable is their loss avoided (already net of prevention probability).

## Hand-authored

**forecast.json**
The PRIMER forecast in the top-bar selector: model, region, issue date and time (28 Sep 2026, 06:00).
The two forecast presets (90% inside 7 days, called 15 days ahead; 90% inside 14 days, called 30 days ahead) with their definitions.
The three Help terms. Not touched by the generator.

**mapConfig.json**
Zoom limits and the zooms used for homes (footprints from 11), area labels, a flown-to fire (13) and a searched home (17).
Esri World Imagery tile URL, attribution and maximum native zoom, and the fuel-grid opacity and colour scale (days).
The map opens fitted to the six coverage areas. Not touched by the generator.

**reports.json**
The mock season report: title, file name, 2.4 MB size and page count.
The four contents sections listed in the export modal (dated hectares, scored forecasts, intervention ledger, accuracy).
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
