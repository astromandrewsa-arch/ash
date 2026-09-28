import useApp from '../../state/useApp.js'
import { VIEWS_BY_ID } from '../../config/views.js'
import IconRail from './IconRail.jsx'
import TopBar from './TopBar.jsx'
import MapView from '../map/MapView.jsx'
import LocationsPanel from '../panels/LocationsPanel.jsx'
import ForecastFilter from '../panels/ForecastFilter.jsx'
import QuickViews from '../panels/QuickViews.jsx'
import AlertCard from '../panels/AlertCard.jsx'
import TimeSlider from '../panels/TimeSlider.jsx'
import FuelLegend from '../panels/FuelLegend.jsx'
import DetailDrawer from '../drawer/DetailDrawer.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'

export default function Shell() {
  const { activeView, drawerOpen, layers } = useApp()
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
                <ForecastFilter />
                <QuickViews />
              </div>
              <AlertCard />
              <TimeSlider />
              {layers.fuelGrid && <FuelLegend />}
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
