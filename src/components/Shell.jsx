import useApp from '../state/useApp.js'
import { VIEWS_BY_ID } from '../config/views.js'
import IconRail from './IconRail.jsx'
import TopBar from './TopBar.jsx'
import MapView from './MapView.jsx'
import LocationsPanel from './LocationsPanel.jsx'
import QuickViews from './QuickViews.jsx'
import AlertCard from './AlertCard.jsx'
import TimeSlider from './TimeSlider.jsx'
import DetailDrawer from './DetailDrawer.jsx'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function Shell() {
  const { activeView, drawerOpen } = useApp()
  const onMap = activeView === 'map'

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
                <QuickViews />
              </div>
              <AlertCard />
              <TimeSlider />
              <DetailDrawer />
            </>
          ) : (
            <PlaceholderPage view={VIEWS_BY_ID[activeView]} />
          )}
        </main>
      </div>
    </div>
  )
}
