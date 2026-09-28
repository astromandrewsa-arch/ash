# Pyrome insurer portal — click-through demo spec

## 1. Purpose and rules
- A click-through demo of the Pyrome insurer portal. Not real data, not a real model. It must look and behave like the working product so an insurer can be walked through it in five minutes.
- Everything is hard-coded mock data. The model is called PRIMER. The add-on is the Intervention Plan. Never show a real address or a real policyholder; invent street-style addresses.
- Reference look: MISGEO (satellite basemap, dark left icon rail, collapsible white panel top-left with portfolio selector and "Quick Views" layer list, building-level colour coding, 200 m grid heatmap option, before/after slider) crossed with Moody's RMS / Verisk Touchstone (exposure summary tiles, TIV, AAL, EP-style metrics, RAG status).
- Every home inside a coverage area is one yellow building footprint. This is the core visual. Homes in a predicted fire path turn red.

## 2. Tech
- React + Vite single-page app, JavaScript (not TypeScript). Leaflet + react-leaflet with the Esri World Imagery tile layer (free, keyless): https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}. No backend, no login. `npm run dev` runs it.
- All mock data in /src/data/*.json so figures can be edited by hand. A script /scripts/generateData.mjs regenerates them.
- Design tokens as CSS variables: Pyrome Orange #E2561B, Charcoal #1C1C1C, Warm Grey #F3F1EC, Pale Ember #FBEFE8, Comparison Blue #2B6CB0 (other models in charts). Coverage/homes yellow #F5C518. Predicted fire and engulfed homes red #D7263D. Green for net savings #1E9E5A. Font: Inter from Google Fonts, fallback system sans.
- Buildings: synthetic footprints generated procedurally (small rotated rectangles, 12–20 m, on a jittered grid inside each coverage polygon). No external data.
- Charts: recharts. Icons: lucide-react. State: plain React context, no Redux.

## 3. Shell layout (every screen)
- Left icon rail, charcoal, 64 px wide, top to bottom: Map · Locations at Risk · Negotiation Channel · Historical Accuracy · Reports · Help. Active item highlighted in Pyrome Orange.
- Top bar: Pyrome wordmark, forecast selector ("PRIMER forecast — Texas — issued 28 Sep 2026, 06:00"), search box ("Search a place, policy, or fire ID"), user avatar.
- Top-left floating panel ("Your Locations"): portfolio dropdown ("Portfolio: Demo Carrier — Texas HO book"), TIV, homes covered, hectares under forecast. Collapsible. Below it the "Quick Views" layer toggles.
- Top-right alert card, always visible on the map, red header "Next 30 days": Total insured value that will burn $X; Premium at risk $Y; Dated fires N; Homes in path N; Preventable if intervened $Z. Live-updates as the slider moves.
- Bottom: time slider. Right: detail drawer (420 px) that slides in on fire click.

## 4. Map view (default)
- Opens on Texas. Six coverage areas shaded pale yellow, each a cluster of towns: Hill Country near Fredericksburg, Panhandle near Amarillo, Cross Timbers near Possum Kingdom Lake, Bastrop, Palo Pinto, Wichita Falls. Every home inside is a yellow footprint; zooming in resolves them to individual buildings (below zoom 11 show a yellow cluster dot with a count instead).
- Quick Views toggles: Coverage areas · Homes (building level) · Dated fires · Spread paths · Fuel-state grid (200 m heatmap, green→orange→red by days-to-threshold) · Sensor sites · Intervention status.
- Forecast filter, two presets exactly as PRIMER defines the date: "90% inside 7 days" — hectares whose accumulated fire probability reaches 90% inside a 7-day window, call made 15 days ahead; "90% inside 14 days" — same at a 14-day window, call made 30 days ahead.
- Bottom slider "Days until fire", from –30 to 0. Dragging reveals red fire markers as they enter the selected lead time (a fire dated 28 days out appears at –28 and stays). Each marker shows fire ID (QD71, HC14, PH03…), predicted date, window, probability, homes in path. Marker pulses red.
- Hover on a home: address, insured value, construction class, distance to nearest dated fire.

## 5. Fire detail view (click a red marker)
- Map flies to the parcel. Ignition block outlined orange with a label such as "Block HC-14, 1,200 ha cured grass, sandy soil, unburned two seasons, 900 m from FM road".
- Spread animation: perimeter polygons at 1 h, 8 h, 24 h, then day by day across the burn window, "under forecast wind", with roads and rivers drawn as barrier lines. Homes turn red as the perimeter reaches them. Play/pause and a step control.
- Right drawer, top to bottom: Header (Fire ID · predicted date · window e.g. "Burns 14–17 Nov, 4 days" · lead time e.g. "Called 12 Oct, 33 days ahead; window narrowed from 14 to 4 days"). Certainty: "92% it spreads on this path" and "90% it burns inside these 4 days", fixed at those two figures for every fire. Fuel state that produced the date: live moisture 84% (falling 1.4 pts/day), curing 88%, afternoon dead moisture 9%, days since rain 41, thresholds crossed (curing 80% on 2 Nov, dead fuel 10% on 6 Nov, live fuel 80% on 11 Nov), with a small sparkline of the drying trajectory and the 90% crossing marked. Intensity: class Extreme, fireline intensity 11,400 kW/m, flame length 4.2 m, rate of spread 3.1 km/h, wind 32 km/h SW (per-fire values vary around these). Exposure in path: homes engulfed, total insured value, expected loss, AAL uplift, scrollable list (address, TIV, expected loss, day reached). Intervention block: recommended action (e.g. "graze and cut 40 m firebreak on the north boundary; prescribed burn of block HC-14 in the 3–5 Nov humidity window"), cost to government/landowner, probability it prevents the fire (e.g. 87%), loss avoided, premium saved for the carrier, shown as cost vs saving side by side with a green net figure. Button: "Pass to your dedicated Pyrome agent".

## 6. Agent process (after the button)
- Drawer switches to a status stepper: Identified → Agent engaged → Government in negotiation → Work agreed → Work complete → Fire prevented. Current step highlighted.
- Timeline of mock entries, e.g.: Day –33 HC-14 dated by PRIMER at 90%, 14-day window. Day –31 Pyrome agent (named) engaged Texas A&M Forest Service and Gillespie County. Day –28 County in negotiation to clear woodland strip on the exact parcel; landowner contacted. Day –22 Firebreak and burn window agreed — cost $148k, premium saving $2.1M, loss avoided $9.6M. Day –19 Crew scheduled. Refusals logged in red ("County declined — budget").
- Ledger line at the bottom: cost, saving, status, documents attached.

## 7. Locations at Risk (rail item 2)
- Table of every dated fire: ID, town/county, days away, window, probability, homes in path, TIV in path, expected loss, intervention status (RAG). Sortable. Summary tiles across the top (fires dated, homes in path, TIV, expected loss, preventable). Clicking a row switches to the map, flies to that fire and opens its drawer.

## 8. Pyrome Negotiation Channel (rail item 3)
- Live feed, one card per fire being worked, newest first, e.g. "QD71 — Bastrop — dated at 90%, 26 days out — agent engaged county 2 days ago — status: in negotiation". 8–10 cards at different stages with agent name, counterpart body, last action, next action, cost/saving where agreed. Filter chips: All · Identified · In negotiation · Agreed · Declined · Prevented.

## 9. Historical Accuracy vs Other Models (rail item 4)
- Headline tiles: fires dated last season · prevented · premium saved · realised loss on declined interventions · Brier score · hit rate at 14 days vs the three comparison models.
- One line per historical fire, three outcome types: (a) Dated 14 days prior → government intervened → cost $X → premium saved $Y → fire prevented. (b) Dated at 90% → intervention declined → fire occurred on the predicted date → loss $Z (prediction proven). (c) Back-test: "Tested against three other models (an ECMWF-style probability-of-fire grid, a fire-weather index, a satellite risk score) — all three missed this fire, PRIMER dated it 19 days out."
- Chart: PRIMER vs the three models on hit rate by lead time (7, 14, 21, 30 days), PRIMER in orange, others in Comparison Blue.
- A before/after satellite slider on one fire (drag divider) showing the parcel pre-burn and the burn scar, with the predicted perimeter overlaid. Fake the "after" side with a dark burn-scar polygon and desaturation over the same imagery.

## 10. Reports (rail item 5)
- One button "Export season report (PDF)" opening a mock modal listing contents (dated hectares, scored forecasts, intervention ledger, accuracy). Help: a short modal explaining the three forecast terms.

## 11. Mock data
- 6 dated fires with IDs, coordinates, dates, windows, lead times, fuel-state figures, intensity figures, spread polygons at 1 h / 8 h / 24 h / per day, 20–80 affected homes each. ~600 homes across six areas with street-style addresses, TIV 180k–1.4M, construction class. 8 agent timelines, 12 historical fires, 3 named comparison models, one season of accuracy stats. All money USD, dates in 2026, forecast issue date 28 Sep 2026.

## 12. Acceptance checklist
- Opens on Texas with yellow homes visible at town zoom. Slider –30 to 0 reveals fires and updates the alert card. Clicking a fire animates spread, turns homes red, shows 92% / 90%, intensity, values, intervention cost vs saving. "Pass to agent" shows stepper and timeline. All rail items work; Locations at Risk flies to the fire. No console errors; runs with one command.

## Working rules for Claude Code
- Work in small steps and run `npm run dev` in the background to check nothing is broken. Fix console errors before reporting done.
- Keep components small, one per file under /src/components. Keep all numbers in /src/data JSON, never inline in components.
- Do not ask me design questions; follow this spec and make sensible choices. Tell me what you decided.
