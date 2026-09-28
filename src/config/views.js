import { CircleHelp, FileText, Handshake, MapIcon, Target, TriangleAlert } from 'lucide-react'

// Rail order is fixed by CLAUDE.md §3. `bottom` pins an item to the foot of the rail.
export const VIEWS = [
  { id: 'map', label: 'Map', shortLabel: 'Map', icon: MapIcon },
  {
    id: 'locations',
    label: 'Locations at Risk',
    shortLabel: 'At Risk',
    icon: TriangleAlert,
    summary: 'Every dated fire in one sortable table, with exposure and intervention status.',
    planned: [
      'Summary tiles: fires dated, homes in path, TIV, expected loss, preventable',
      'Sortable table with RAG intervention status',
      'Click a row to fly to the fire on the map and open its drawer',
    ],
  },
  {
    id: 'negotiation',
    label: 'Pyrome Negotiation Channel',
    shortLabel: 'Negotiate',
    icon: Handshake,
    summary: 'Live feed of every fire a Pyrome agent is working with government and landowners.',
    planned: [
      'One card per fire, newest first',
      'Agent, counterpart body, last action, next action, cost and saving',
      'Filter chips: All · Identified · In negotiation · Agreed · Declined · Prevented',
    ],
  },
  {
    id: 'accuracy',
    label: 'Historical Accuracy vs Other Models',
    shortLabel: 'Accuracy',
    icon: Target,
    summary: 'How PRIMER performed last season against three comparison models.',
    planned: [
      'Headline tiles, including Brier score and 14-day hit rate',
      'One line per historical fire: prevented, declined, or back-tested',
      'Hit rate by lead time chart and a before/after satellite slider',
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    shortLabel: 'Reports',
    icon: FileText,
    summary: 'Season reporting for underwriting and reinsurance.',
    planned: ['Export season report (PDF) with dated hectares, scored forecasts, intervention ledger and accuracy'],
  },
  {
    id: 'help',
    label: 'Help',
    shortLabel: 'Help',
    icon: CircleHelp,
    bottom: true,
    summary: 'What the forecast terms mean.',
    planned: ['A short explainer of the three PRIMER forecast terms'],
  },
]

export const VIEWS_BY_ID = Object.fromEntries(VIEWS.map((view) => [view.id, view]))
