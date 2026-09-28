import { useEffect, useState } from 'react'
import useApp from '../../state/useApp.js'
import { UI } from '../../config/ui.js'
import IconRail from './IconRail.jsx'
import TopBar from './TopBar.jsx'
import HelpModal from './HelpModal.jsx'
import PageSkeleton from './PageSkeleton.jsx'
import MapView from '../map/MapView.jsx'
import LocationsPanel from '../panels/LocationsPanel.jsx'
import ForecastFilter from '../panels/ForecastFilter.jsx'
import QuickViews from '../panels/QuickViews.jsx'
import AlertCard from '../panels/AlertCard.jsx'
import TimeSlider from '../panels/TimeSlider.jsx'
import FuelLegend from '../panels/FuelLegend.jsx'
import DetailDrawer from '../drawer/DetailDrawer.jsx'
import LocationsAtRiskPage from '../pages/LocationsAtRiskPage.jsx'
import NegotiationChannelPage from '../pages/NegotiationChannelPage.jsx'
import AccuracyPage from '../pages/AccuracyPage.jsx'
import ReportsPage from '../pages/ReportsPage.jsx'

const PAGES = {
  locations: LocationsAtRiskPage,
  negotiation: NegotiationChannelPage,
  accuracy: AccuracyPage,
  reports: ReportsPage,
}

export default function Shell() {
  const { activeView, drawerOpen, layers } = useApp()
  const onMap = activeView === 'map'
  const Page = PAGES[activeView]

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
      <IconRail />
      <div className="main">
        <TopBar />
        <main className={`stage${drawerOpen ? ' drawer-open' : ''}`}>
          {/* The map stays mounted behind every view so its position survives navigation. */}
          <MapView />
          {onMap ? (
            <>
              <div className="overlay-left">
                <LocationsPanel />
                <ForecastFilter />
                <QuickViews />
              </div>
              <AlertCard />
              <TimeSlider />
              {layers.fuelGrid && <FuelLegend />}
              <DetailDrawer />
            </>
          ) : loading ? (
            <PageSkeleton />
          ) : (
            <Page />
          )}
        </main>
      </div>
      <HelpModal />
    </div>
  )
}
