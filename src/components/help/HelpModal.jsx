import { useEffect, useRef } from 'react'
import { CircleHelp } from 'lucide-react'
import { store } from '../../lib/store.js'
import { formatPct } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import Dialog from '../common/Dialog.jsx'
import TechnicalFormula from '../premium/TechnicalFormula.jsx'
import PricingTerms from '../premium/PricingTerms.jsx'
import HelpSection from './HelpSection.jsx'

/** Help (§17): the forecast definition, the technical premium and the sources behind the market figures. */
export default function HelpModal() {
  const { helpOpen, setHelpOpen, helpSection } = useApp()
  const body = useRef(null)

  // Opened from an info icon: land on that section and flash it once.
  useEffect(() => {
    if (!helpOpen || !helpSection) return
    const el = body.current?.querySelector(`#help-${helpSection}`)
    if (!el) return
    body.current.scrollTop = el.offsetTop - 8
    el.classList.remove('is-flash')
    void el.offsetWidth
    el.classList.add('is-flash')
  }, [helpOpen, helpSection])

  if (!helpOpen) return null
  const { meta, portfolio } = store
  return (
    <Dialog title="Help" icon={CircleHelp} onClose={() => setHelpOpen(false)} bodyRef={body}>
      <HelpSection id="forecast" title="How PRIMER dates a fire">
        <p className="help-lead">{meta.forecastDefinition}</p>
        <p>
          Probability is re-scored every {meta.rescoreHours} hours. A dated fire can drift after the call; below {formatPct(meta.watchlistBelow)} it drops back to the watchlist.
        </p>
      </HelpSection>
      <HelpSection id="premium" title="Technical premium">
        <TechnicalFormula />
        <p>The premium that pays PRIMER’s dated expected loss and its adjustment cost, covers the fixed and variable expenses and earns the target return; divided by TIV it is the PRIMER technical rate, and rate adequacy is the market rate against it.</p>
        <PricingTerms pricing={portfolio.pricing} />
      </HelpSection>
      <HelpSection id="sources" title="Sources for the Texas market figures">
        <ul className="help-sources">
          {portfolio.contextTiles.map((t) => (
            <li key={t.id}>
              <span className="help-src-label">{t.label}</span>
              <strong>
                {t.value} · {t.note}
              </strong>
              <span className="help-src-source">{t.source}</span>
            </li>
          ))}
        </ul>
      </HelpSection>
    </Dialog>
  )
}
