import { BadgeDollarSign, CircleHelp, FileText, FlaskConical, Handshake, Map, Target, TriangleAlert } from 'lucide-react'

// Rail order is fixed by CLAUDE.md §4. `bottom` pins an item to the foot of the rail;
// `modal` items open a dialog instead of switching view.
export const VIEWS = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'locations', label: 'Locations at Risk', icon: TriangleAlert },
  { id: 'simulation', label: 'Simulation', icon: FlaskConical },
  { id: 'premium', label: 'Premium Intelligence', icon: BadgeDollarSign },
  { id: 'negotiation', label: 'Negotiation Channel', icon: Handshake },
  { id: 'accuracy', label: 'Historical Accuracy', icon: Target },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'help', label: 'Help', icon: CircleHelp, bottom: true, modal: true },
]
