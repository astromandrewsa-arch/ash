import { useEffect, useState } from 'react'
import useApp from '../../state/useApp.js'
import { UI } from '../../config/ui.js'
import Rail from './Rail.jsx'
import TopBar from './TopBar.jsx'
import HelpModal from '../help/HelpModal.jsx'
import MapView from '../map/MapView.jsx'
import QuickViews from '../panels/QuickViews.jsx'
import BookPanel from '../panels/BookPanel.jsx'
import AlertCard from '../panels/AlertCard.jsx'
import TimeSlider from '../panels/TimeSlider.jsx'
import SpreadControls from '../panels/SpreadControls.jsx'
import Drawer from '../drawer/Drawer.jsx'
import MoreInfoPanel from '../moreinfo/MoreInfoPanel.jsx'
import PageSkeleton from '../pages/PageSkeleton.jsx'
import LocationsPage from '../locations/LocationsPage.jsx'
import SimulationPage from '../simulation/SimulationPage.jsx'
import PremiumPage from '../premium/PremiumPage.jsx'
import NegotiationChannelPage from '../pages/NegotiationChannelPage.jsx'
import AccuracyPage from '../accuracy/AccuracyPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'

// v1 screens render inside .v1-legacy until their pass replaces them.
const PAGES = {
  locations: { Component: LocationsPage },
  simulation: { Component: SimulationPage },
  premium: { Component: PremiumPage },
  negotiation: { Component: NegotiationChannelPage, legacy: true },
  accuracy: { Component: AccuracyPage },
  reports: { Component: ReportsPage, legacy: true },
}

export default function Shell() {
  const { activeView, drawerOpen } = useApp()
  const onMap = activeView === 'map'
  const page = PAGES[activeView]

  // A short skeleton on each page switch, so navigation feels like a real app.
  const [lastView, setLastView] = useState(activeView)
  const [loading, setLoading] = useState(false)
  if (activeView !== lastView) {
    setLastView(activeView)
    setLoading(!onMap)
  }
  useEffect(() => {
    if (!loading) return undefined
    const t = setTimeout(() => setLoading(false), UI.pageSkeletonMs)
    return () => clearTimeout(t)
  }, [loading, activeView])

  return (
    <div className="app">
      <Rail />
      <div className={`app-main${onMap && drawerOpen ? ' drawer-open' : ''}`}>
        <main className="stage">
          {/* The map stays mounted behind every view so its position survives navigation. */}
          <div className="map-host">
            <MapView />
          </div>
          {onMap && (
            <>
              <div className="overlay-left">
                <BookPanel />
                <QuickViews />
              </div>
              <AlertCard hidden={drawerOpen} />
              <TimeSlider>
                <SpreadControls />
              </TimeSlider>
            </>
          )}
          <Drawer />
          <MoreInfoPanel />
          {page && (
            <div className="page-host">
              {loading ? (
                <PageSkeleton />
              ) : page.legacy ? (
                <div className="v1-legacy">
                  <page.Component />
                </div>
              ) : (
                <page.Component />
              )}
            </div>
          )}
        </main>
        <TopBar />
      </div>
      <HelpModal />
    </div>
  )
}
