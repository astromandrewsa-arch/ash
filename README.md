# Pyrome insurer portal — click-through demo

A click-through demo of the Pyrome insurer portal: PRIMER fire-date forecasts over a Texas homeowners book, the spread of each dated fire, and the Intervention Plan that a Pyrome agent negotiates with government. Everything is mock data; the spec is in `CLAUDE.md`.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

`npm run build` makes a production build in `dist/`; `npm run data` regenerates the mock data in `src/data` (see `src/data/README.md`).

## Five-minute demo script

1. **Open on Texas.** Six yellow coverage areas; *Your Locations* shows the book: $326.4M TIV, 601 homes, 68,270 hectares under forecast.
2. **Click the Hill Country "102" cluster.** Every yellow footprint is an insured home; hover one for its address, insured value, construction and distance to the nearest dated fire.
3. **Drag *Days until fire* from –30 to 0.** Fires appear as they come inside their lead time and the *Next 30 days* card counts up to $128.6M of insured value that will burn.
4. **Flip the forecast filter** between *90% inside 7 days* and *90% inside 14 days* and read the definition under it.
5. **Click HC14.** The map flies to block HC-14 and the spread plays under forecast wind, 1 h to Day 4; 39 homes turn red as the perimeter reaches them.
6. **Walk the drawer.** 92% it spreads on this path, 90% it burns inside these 4 days; the fuel state that produced the date; Extreme intensity; $27.0M of insured value in the path.
7. **Intervention Plan.** A $148k firebreak and prescribed burn against a $19.5M saving: net $19.3M, with an 87% chance of preventing the fire.
8. **Press *Pass to your dedicated Pyrome agent*.** The stepper moves to *Agent engaged*, then the timeline shows the county refusal, TAMFS co-funding, the agreement and the next burn.
9. **Locations at Risk, then Negotiation Channel.** Every dated fire in one sortable table, and the live agent feed; click QD71 to jump straight back to it on the map.
10. **Historical Accuracy.** Five fires prevented, $26.5M lost where interventions were declined, 90% hit rate at 14 days against 52%, 41% and 36%; drag the BR27 before/after slider.

## Where things live

- `src/components/` — one small component per file, grouped into `shell`, `map`, `panels`, `drawer`, `pages` and `common`
- `src/data/*.json` — every figure shown in the UI; `scripts/generateData.mjs` regenerates the generated ones
- `src/styles/tokens.css` — Pyrome design tokens as CSS variables
- `src/state/` — app state and the spread animation (plain React context)
- `src/lib/` — data lookups, formatting and search
