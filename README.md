# Pyrome insurer portal — click-through demo (v2)

A click-through demo of the Pyrome insurer portal for a five-minute walk-through with an insurer. PRIMER measures live and dead fuel moisture on the ground and puts a date on a fire; the portal shows the dated fires over a Texas and Oklahoma homeowners book, how each would spread, what it would cost, and the Intervention Plan a Pyrome agent negotiates with the state, the county, the utility and the landowner. Everything is mock data with no backend; the spec is `CLAUDE.md`.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173/ash/. `npm run build` makes the production build in `dist/`, and `node scripts/smoke.mjs --pass <n>` runs the headless smoke test against it.

## The data generator

Every figure on screen comes from `src/data/*.json`, and none is typed into a component. `npm run data` runs `scripts/generateData.mjs` from a fixed seed (20260929), so a rerun gives identical files, then `scripts/checkData.mjs` checks them against the spec. The generator builds the 100 covered areas and 49,500 homes on street-like grids with invented addresses, routes the utility lines and pipelines through real towns, places the real turbines, and grows each of the ten dated fires with a Huygens spread model (P90, P50 and P25 perimeters at every step, wind shifts, fingers, spotting, barriers from vendored lakes, rivers and highways). It then scores exposure and loss per home and asset, writes the plans, negotiations, bundles, history and the two portfolios with their EP curves, and fills the Help text with the same figures. `src/data/README.md` describes each file.

## Five-minute demo script

Filled in pass 12.

## Where things live

- `src/components/` — one small component per file: `shell`, `map`, `panels`, `drawer`, `fire`, `moreinfo`, `locations`, `simulation`, `premium`, `negotiation`, `accuracy`, `help`, `common`
- `src/data/*.json` — every figure shown in the UI, written by `scripts/generateData.mjs`
- `scripts/config/` — the spec's inputs (places, fires, plans, market, history, help); `scripts/lib/` — geometry, spread, loss
- `src/styles/tokens.css` — the dark cartographic design tokens as CSS variables
- `src/state/` — app state (plain React context); `src/lib/` — data lookups, formatting, map painting
