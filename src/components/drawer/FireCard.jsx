import { Maximize2 } from 'lucide-react'
import { store } from '../../lib/store.js'
import { flameSvg } from '../../lib/icons.js'
import { formatHa } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import DrawerHeader from './DrawerHeader.jsx'
import SvgIcon from '../common/SvgIcon.jsx'
import TabBar from '../common/TabBar.jsx'
import ExportButton from '../common/ExportButton.jsx'
import ForecastTab from '../fire/ForecastTab.jsx'
import SpreadTab from '../fire/SpreadTab.jsx'
import ExposureTab from '../fire/ExposureTab.jsx'
import PlanTab from '../fire/PlanTab.jsx'
import NegotiationTab from '../fire/NegotiationTab.jsx'
import { leadLine } from '../fire/fireText.js'

const TABS = [
  { id: 'forecast', label: 'Forecast', Panel: ForecastTab },
  { id: 'spread', label: 'Spread', Panel: SpreadTab },
  { id: 'exposure', label: 'Exposure', Panel: ExposureTab },
  { id: 'plan', label: 'Plan', Panel: PlanTab },
  { id: 'negotiation', label: 'Negotiation', Panel: NegotiationTab },
]

/** The fire drawer (§10): header line, severity, lead time, More info, and five tabs. */
export default function FireCard({ fireId }) {
  const { closeDrawer, drawerTab, setDrawerTab, setMoreInfo } = useApp()
  const f = store.fireById.get(fireId)
  if (!f) return null
  const tab = TABS.find((t) => t.id === drawerTab) || TABS[0]
  const Panel = tab.Panel
  return (
    <div className="card-body fire-card">
      <DrawerHeader
        icon={<SvgIcon html={flameSvg(22)} />}
        kicker={`${f.id} · ${f.place}`}
        title={f.name}
        onClose={closeDrawer}
      >
        <p className="dh-line">{f.headerLine}</p>
        <div className="dh-pills">
          <span className={`pill ${f.severity === 'Severe' ? 'pill-red' : 'pill-amber'}`}>{f.severity}</span>
          <span className="pill">{f.intensity.class} intensity</span>
          <span className="pill">
            {f.ignitionZone.class} · {formatHa(f.ignitionZone.hectares)}
          </span>
          <button type="button" className="btn more-info-btn" onClick={() => setMoreInfo('addresses')}>
            <Maximize2 size={13} aria-hidden="true" />
            More info
          </button>
        </div>
        <p className="dh-sub">{leadLine(f)}</p>
      </DrawerHeader>
      <TabBar
        tabs={TABS}
        active={tab.id}
        onChange={setDrawerTab}
        label={`${f.id} detail`}
        idPrefix="fire"
      />
      {/* Keyed by tab so each tab opens scrolled to its top. */}
      <div key={tab.id} className="fire-tab" role="tabpanel" id="fire-panel" aria-labelledby={`fire-tab-${tab.id}`}>
        <Panel fire={f} />
      </div>
      <footer className="fire-footer">
        <ExportButton fire={f} primary={false} />
      </footer>
    </div>
  )
}
