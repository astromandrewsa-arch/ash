import { X } from 'lucide-react'
import { store } from '../../lib/store.js'
import useApp from '../../state/useApp.js'
import TabBar from '../common/TabBar.jsx'
import AddressTable from './AddressTable.jsx'
import PlanTab from '../fire/PlanTab.jsx'
import NegotiationTab from '../fire/NegotiationTab.jsx'
import ExportTab from './ExportTab.jsx'

const TABS = [
  { id: 'addresses', label: 'Addresses', Panel: AddressTable },
  { id: 'plan', label: 'Plan', Panel: PlanTab },
  { id: 'negotiation', label: 'Negotiation', Panel: NegotiationTab },
  { id: 'export', label: 'Export', Panel: ExportTab },
]

/** More info (§10): a full-height glass panel over the right 60% of the screen with four tabs. */
export default function MoreInfoPanel() {
  const { moreInfo, setMoreInfo, selection, activeView } = useApp()
  const fire = selection?.kind === 'fire' ? store.fireById.get(selection.id) : null
  const open = Boolean(moreInfo && fire && activeView === 'map')
  const tab = TABS.find((t) => t.id === moreInfo) || TABS[0]
  const Panel = tab.Panel
  return (
    <>
    <div className={`mi-scrim${open ? ' is-open' : ''}`} aria-hidden="true" onClick={() => setMoreInfo(null)} />
    <section className={`more-info${open ? ' is-open' : ''}`} aria-label={fire ? `${fire.id} more info` : 'More info'} aria-hidden={!open} inert={!open}>
      {fire && (
        <>
          <header className="mi-head">
            <div className="mi-titles">
              <span className="label">{fire.id} · {fire.place}</span>
              <h2>{fire.name}</h2>
              <p className="dh-line">{fire.headerLine}</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setMoreInfo(null)} aria-label="Close more info">
              <X size={18} />
            </button>
          </header>
          <TabBar tabs={TABS} active={tab.id} onChange={setMoreInfo} label={`${fire.id} more info`} idPrefix="mi" className="mi-tabs" />
          <div className={`mi-body mi-${tab.id}`} role="tabpanel" id="mi-panel" aria-labelledby={`mi-tab-${tab.id}`}>
            <Panel key={`${fire.id}:${tab.id}`} fire={fire} inPanel />
          </div>
        </>
      )}
    </section>
    </>
  )
}
