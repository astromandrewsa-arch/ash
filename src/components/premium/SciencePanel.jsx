import { Map as MapIcon } from 'lucide-react'
import { formatPctSigned } from '../../lib/format.js'
import Section from '../common/Section.jsx'
import RateCompare from './RateCompare.jsx'
import ScienceList from './ScienceList.jsx'
import SeasonCompare from './SeasonCompare.jsx'

/** §15 science panel for the selected bundle: the rate, the fuel science behind it, and the season. */
export default function SciencePanel({ bundle: b, onShowOnMap }) {
  const tone = b.underPriced ? 'is-under' : 'is-over'
  return (
    <aside className="sci-panel glass" aria-label={`Science panel: ${b.name}`}>
      <header className="sci-head" key={b.id}>
        <div className="sci-title">
          <span className="label">Science panel</span>
          <h2>{b.name}</h2>
          <p>{b.places.join(' · ')}</p>
        </div>
        <span className={`gap-pill ${tone}`}>
          {formatPctSigned(b.adequacy)} {b.underPriced ? 'under-priced' : 'over-priced'}
        </span>
      </header>
      <div className="sci-body" key={`${b.id}-body`}>
        <RateCompare bundle={b} />
        <Section title="Why the rate moves">
          <ScienceList science={b.science} />
          <div className="sci-sensitivity">
            <span className="label">Sensitivity</span>
            <p>{b.science.sensitivityLine}</p>
          </div>
        </Section>
        <Section title="This season against the long run">
          <SeasonCompare bundle={b} />
        </Section>
        <button type="button" className="btn btn-block sci-map" onClick={() => onShowOnMap(b.id)}>
          <MapIcon size={15} aria-hidden="true" />
          Show the rate gap on the map
        </button>
      </div>
    </aside>
  )
}
