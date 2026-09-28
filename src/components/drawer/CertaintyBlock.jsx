import { formatPct } from '../../lib/format.js'
import DrawerSection from './DrawerSection.jsx'

export default function CertaintyBlock({ fire }) {
  return (
    <DrawerSection title="Certainty" className="certainty">
      <div className="certainty-grid">
        <div className="certainty-figure">
          <strong>{formatPct(fire.spreadCertainty)}</strong>
          <span>it spreads on this path</span>
        </div>
        <div className="certainty-figure">
          <strong>{formatPct(fire.probability)}</strong>
          <span>it burns inside these {fire.window.days} days</span>
        </div>
      </div>
    </DrawerSection>
  )
}
