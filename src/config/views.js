import { CircleHelp, FileText, Handshake, MapIcon, Target, TriangleAlert } from 'lucide-react'

// Rail order is fixed by CLAUDE.md §3. `bottom` pins an item to the foot of the rail;
// `modal` items open a dialog instead of switching view.
export const VIEWS = [
  { id: 'map', label: 'Map', shortLabel: 'Map', icon: MapIcon },
  { id: 'locations', label: 'Locations at Risk', shortLabel: 'At Risk', icon: TriangleAlert },
  { id: 'negotiation', label: 'Pyrome Negotiation Channel', shortLabel: 'Negotiate', icon: Handshake },
  { id: 'accuracy', label: 'Historical Accuracy vs Other Models', shortLabel: 'Accuracy', icon: Target },
  { id: 'reports', label: 'Reports', shortLabel: 'Reports', icon: FileText },
  { id: 'help', label: 'Help', shortLabel: 'Help', icon: CircleHelp, bottom: true, modal: true },
]
