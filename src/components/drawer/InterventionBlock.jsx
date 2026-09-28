import { ShieldCheck } from 'lucide-react'
import { formatPct, formatUSDCompact } from '../../lib/format.js'
import DrawerSection from './DrawerSection.jsx'

export default function InterventionBlock({ fire }) {
  const iv = fire.intervention
  const saving = iv.lossAvoided + iv.premiumSaved5yr

  return (
    <DrawerSection title="Intervention Plan" aside={<span className="section-note">recommended action</span>}>
      <p className="intervention-action">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>{iv.action}</span>
      </p>
      <div className="cost-vs-saving">
        <div className="cvs-col is-cost">
          <span className="cvs-label">Cost to government / landowner</span>
          <strong>{formatUSDCompact(iv.cost)}</strong>
          <small>{iv.costBearer}</small>
        </div>
        <div className="cvs-col is-saving">
          <span className="cvs-label">Saving</span>
          <strong>{formatUSDCompact(saving)}</strong>
          <small>
            Loss avoided {formatUSDCompact(iv.lossAvoided)}
            <br />
            Premium saved (5 yr) {formatUSDCompact(iv.premiumSaved5yr)}
          </small>
        </div>
      </div>
      <div className="net-row">
        <span>Net benefit</span>
        <strong>{formatUSDCompact(iv.netBenefit)}</strong>
      </div>
      <div className="prevention">
        <div className="prevention-head">
          <span>Probability the work prevents the fire</span>
          <strong>{formatPct(iv.preventionProbability)}</strong>
        </div>
        <div className="prevention-bar" aria-hidden="true">
          <span style={{ width: formatPct(iv.preventionProbability) }} />
        </div>
      </div>
    </DrawerSection>
  )
}
