# Pyrome insurer portal — click-through demo

A mock-data demo of the Pyrome insurer portal (PRIMER forecasts and the Intervention Plan). The full spec is in `CLAUDE.md`.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Where things live

- `src/components/` — one small component per file
- `src/data/*.json` — every figure shown in the UI (edit by hand)
- `src/styles/tokens.css` — Pyrome design tokens as CSS variables
- `src/config/views.js` — rail items and their order
- `src/state/` — app state (plain React context)
