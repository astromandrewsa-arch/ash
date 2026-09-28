import { Layers } from 'lucide-react'
import quickViews from '../data/quickViews.json'
import useApp from '../state/useApp.js'
import CollapsibleCard from './CollapsibleCard.jsx'
import Toggle from './Toggle.jsx'

export default function QuickViews() {
  const { layers, toggleLayer } = useApp()

  return (
    <CollapsibleCard title="Quick Views" icon={Layers} className="quick-views">
      <ul className="layer-list">
        {quickViews.layers.map((layer) => (
          <li key={layer.id}>
            <Toggle
              label={layer.label}
              swatch={layer.swatch}
              checked={layers[layer.id]}
              onChange={() => toggleLayer(layer.id)}
            />
          </li>
        ))}
      </ul>
    </CollapsibleCard>
  )
}
