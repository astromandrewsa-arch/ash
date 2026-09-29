import { useState } from 'react'
import { ChevronDown, Layers } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { QUICK_VIEW_GROUPS } from '../../config/quickViews.js'
import QuickViewChip from './QuickViewChip.jsx'
import FuelLegend from './FuelLegend.jsx'
import ViewLegend from './ViewLegend.jsx'

/** Quick Views (§9): coverage, fires, spread, fuel grid and the three status overlays. */
export default function QuickViews() {
  const { views, toggleView, setView, selection } = useApp()
  const [open, setOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const hasFire = selection?.kind === 'fire'
  return (
    <section className="glass panel qv" aria-label="Quick Views">
      <button type="button" className="panel-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Layers size={15} className="muted" aria-hidden="true" />
        <span className="label panel-title">Quick Views</span>
        <ChevronDown size={16} className={`panel-caret${open ? '' : ' is-collapsed'}`} aria-hidden="true" />
      </button>
      {open && (
        <div className={`panel-body qv-body${scrolled ? ' is-scrolled' : ''}`} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 2)}>
          {QUICK_VIEW_GROUPS.map((g) => (
            <div key={g.id} className={`qv-group qv-group-${g.id}${g.needsFire && !hasFire ? ' is-idle' : ''}${g.label ? '' : ' is-plain'}`}>
              {g.label && (
                <div className="qv-group-head">
                  <span className="label">{g.label}</span>
                  {g.needsFire && !hasFire && <span className="qv-hint">Open a fire to draw it</span>}
                </div>
              )}
              <div className="qv-chips">
                {g.radio
                  ? g.items.map((it) => (
                      <QuickViewChip key={it.value} label={it.label} swatch={`fuel-${it.value}`} on={views.fuel === it.value} onToggle={() => setView('fuel', views.fuel === it.value ? null : it.value)} />
                    ))
                  : g.items.map((it) => <QuickViewChip key={it.key} label={it.label} swatch={it.swatch} on={views[it.key]} onToggle={() => toggleView(it.key)} />)}
              </div>
              {g.radio && views.fuel && <FuelLegend variantId={views.fuel} />}
              {g.id === 'status' && <ViewLegend views={views} />}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
