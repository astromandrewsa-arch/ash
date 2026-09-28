import { ArrowRight } from 'lucide-react'
import useApp from '../../state/useApp.js'
import FireHeader from './FireHeader.jsx'
import CertaintyBlock from './CertaintyBlock.jsx'
import FuelStateBlock from './FuelStateBlock.jsx'
import IntensityBlock from './IntensityBlock.jsx'
import ExposureBlock from './ExposureBlock.jsx'
import InterventionBlock from './InterventionBlock.jsx'

/** CLAUDE.md §5: header, certainty, fuel state, intensity, exposure, intervention, hand-off button. */
export default function FireDetail({ fire }) {
  const { passToAgent } = useApp()
  return (
    <>
      <FireHeader fire={fire} />
      <div className="drawer-body">
        <CertaintyBlock fire={fire} />
        <FuelStateBlock fire={fire} />
        <IntensityBlock fire={fire} />
        <ExposureBlock fire={fire} />
        <InterventionBlock fire={fire} />
        <button type="button" className="agent-button" onClick={() => passToAgent?.(fire.id)}>
          Pass to your dedicated Pyrome agent
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
