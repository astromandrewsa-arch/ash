// Quick Views (CLAUDE.md §9). Groups of independent toggles; the fuel grid is a radio group
// (one variant at a time, click again for off); the last three views stand alone.
export const QUICK_VIEW_GROUPS = [
  {
    id: 'coverage',
    label: 'Coverage',
    items: [
      { key: 'homes', label: 'Homes', swatch: 'homes' },
      { key: 'utilities', label: 'Utilities', swatch: 'utilities' },
      { key: 'rangeland', label: 'Rangeland', swatch: 'rangeland' },
    ],
  },
  {
    id: 'fires',
    label: 'Fires',
    items: [
      { key: 'dated', label: 'Dated', swatch: 'dated' },
      { key: 'watchlist', label: 'Watchlist', swatch: 'watchlist' },
      { key: 'severe', label: 'Severe', swatch: 'severe' },
      { key: 'nonSevere', label: 'Non-severe', swatch: 'nonSevere' },
    ],
  },
  {
    id: 'spread',
    label: 'Spread',
    needsFire: true,
    items: [
      { key: 'isochrones', label: 'Isochrones', swatch: 'isochrones' },
      { key: 'probability', label: 'Burn probability', swatch: 'probability' },
      { key: 'barriers', label: 'Barriers', swatch: 'barriers' },
    ],
  },
  {
    id: 'fuel',
    label: 'Fuel grid · 200 m',
    radio: 'fuel',
    items: [
      { value: 'live', label: 'Live moisture' },
      { value: 'dead10', label: '10-h dead' },
      { value: 'curing', label: 'Curing' },
      { value: 'erc', label: 'ERC' },
    ],
  },
  {
    id: 'status',
    label: 'Overlays',
    items: [
      { key: 'intervention', label: 'Intervention status', swatch: 'intervention' },
      { key: 'sensors', label: 'Sensor sites', swatch: 'sensors' },
      { key: 'rateGap', label: 'Rate gap', swatch: 'rateGap' },
    ],
  },
]

export const DEFAULT_VIEWS = {
  homes: true,
  utilities: true,
  rangeland: true,
  dated: true,
  watchlist: true,
  severe: true,
  nonSevere: true,
  isochrones: true,
  probability: false,
  barriers: true,
  fuel: null,
  intervention: false,
  sensors: false,
  rateGap: false,
  rateGap2027: false,
}
