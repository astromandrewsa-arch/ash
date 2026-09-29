import { useEffect, useState } from 'react'
import useApp from '../../state/useApp.js'
import { UI } from '../../config/ui.js'
import Rail from './Rail.jsx'
import TopBar from './TopBar.jsx'
import HelpModal from './HelpModal.jsx'
import MapView from '../map/MapView.jsx'
import QuickViews from '../panels/QuickViews.jsx'
import BookPanel from '../panels/BookPanel.jsx'
import AlertCard from '../panels/AlertCard.jsx'
import TimeSlider from '../panels/TimeSlider.jsx'
import SpreadControls from '../panels/SpreadControls.jsx'
import FuelLegend from '../panels/FuelLegend.jsx'
import DrawerShell from '../drawer/DrawerShell.jsx'
import DetailDrawer from '../drawer/DetailDrawer.jsx'
import PageSkeleton from '../pages/PageSkeleton.jsx'
import LocationsAtRiskPage from '../pages/LocationsAtRiskPage.jsx'
import SimulationPage from '../pages/SimulationPage.jsx'
import PremiumPage from '../pages/PremiumPage.jsx'
import NegotiationChannelPage from '../pages/NegotiationChannelPage.jsx'
import AccuracyPage from '../pages/AccuracyPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'

// v1 screens render inside .v1-legacy until their pass replaces them.
const PAGES = {
  locations: { Component: LocationsAtRiskPage, legacy: true },
  simulation: { Component: SimulationPage },
  premium: { Component: PremiumPage },
  negotiation: { Component: NegotiationChannelPage, legacy: true },
  accuracy: { Component: AccuracyPage, legacy: true },
  reports: { Component: ReportsPage, legacy: true },
}

export default function Shell() {
  const { activeView, drawerOpen, layers, selection } = useApp()
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
          <div className="map-host v1-legacy">
            <MapView />
          </div>
          {onMap && (
            <>
              <div className="overlay-left">
                <BookPanel />
                <div className="v1-legacy">
                  <QuickViews />
                </div>
              </div>
              <AlertCard hidden={drawerOpen} />
              <TimeSlider>
                {selection && (
                  <div className="v1-legacy">
                    <SpreadControls />
                  </div>
                )}
              </TimeSlider>
              {layers.fuelGrid && (
                <div className="v1-legacy">
                  <FuelLegend />
                </div>
              )}
            </>
          )}
          <DrawerShell open={onMap && drawerOpen} label="Fire detail">
            <div className="v1-legacy">
              <DetailDrawer />
            </div>
          </DrawerShell>
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
      <div className="v1-legacy">
        <HelpModal />
      </div>
    </div>
  )
}
