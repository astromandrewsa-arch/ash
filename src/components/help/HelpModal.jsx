import { useEffect, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { store } from '../../lib/store.js'
import useApp from '../../state/useApp.js'
import Dialog from '../common/Dialog.jsx'
import HelpNav from './HelpNav.jsx'
import HelpSection from './HelpSection.jsx'

/** Help (§17, §19): every definition the portal uses, generated with the book's figures. */
export default function HelpModal() {
  const { helpOpen, setHelpOpen, helpSection } = useApp()
  const body = useRef(null)
  const sections = store.help.sections
  const [active, setActive] = useState(sections[0].id)

  const goTo = (id, flash = false) => {
    const el = body.current?.querySelector(`#help-${id}`)
    if (!el) return
    body.current.scrollTop = el.offsetTop - 8
    setActive(id)
    if (flash) {
      el.classList.remove('is-flash')
      void el.offsetWidth
      el.classList.add('is-flash')
    }
  }

  // Opened from an info icon: land on that section and flash it once.
  useEffect(() => {
    if (helpOpen && helpSection) goTo(helpSection, true)
  }, [helpOpen, helpSection]) // goTo reads refs only

  // Keep the nav in step with the scroll position.
  const onScroll = () => {
    const top = body.current.scrollTop + 24
    let current = sections[0].id
    for (const s of sections) {
      const el = body.current.querySelector(`#help-${s.id}`)
      if (el && el.offsetTop <= top) current = s.id
    }
    const atEnd = body.current.scrollTop + body.current.clientHeight >= body.current.scrollHeight - 4
    setActive(atEnd ? sections[sections.length - 1].id : current)
  }

  if (!helpOpen) return null
  return (
    <Dialog title="Help" icon={CircleHelp} onClose={() => setHelpOpen(false)} width={860} className="help-dialog">
      <div className="help-layout">
        <HelpNav sections={sections} active={active} onGo={(id) => goTo(id)} />
        <div className="help-body" ref={body} onScroll={onScroll}>
          {sections.map((s) => (
            <HelpSection key={s.id} section={s} />
          ))}
        </div>
      </div>
    </Dialog>
  )
}
