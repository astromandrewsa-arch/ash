import { AttributionControl, MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import { store } from '../../lib/store.js'
import { MAP } from '../../config/map.js'
import useApp from '../../state/useApp.js'
import MapBridge from './MapBridge.jsx'
import ZoomClass from './ZoomClass.jsx'
import LabelsOverlay from './LabelsOverlay.jsx'
import FuelGridLayer from './FuelGridLayer.jsx'
import RateGapLayer from './RateGapLayer.jsx'
import RangelandLayer from './RangelandLayer.jsx'
import SelectedFireLayer from './SelectedFireLayer.jsx'
import HomesLayer from './HomesLayer.jsx'
import UtilitiesLayer from './UtilitiesLayer.jsx'
import SensorLayer from './SensorLayer.jsx'
import FireMarkersLayer from './FireMarkersLayer.jsx'
import WatchlistLayer from './WatchlistLayer.jsx'

/**
 * The v2 map (§2, §9). Canvas renderer throughout; panes stack fuel grid (350), rate gap (360),
 * ranches (380), spread (400), homes (420), assets (430–435), sensors (440), labels (450), markers.
 */
export default function MapView() {
  const { views } = useApp()
  const view = store.portfolio.initialView
  return (
    <div className="map-view">
      <svg className="svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <pattern id="ranch-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="9" height="9" fill="rgba(245, 197, 24, 0.07)" />
            <line x1="0" y1="0" x2="0" y2="9" stroke="#F5C518" strokeOpacity="0.25" strokeWidth="3" />
          </pattern>
        </defs>
      </svg>
      <MapContainer className="map-canvas" center={view.center} zoom={view.zoom} preferCanvas minZoom={MAP.minZoom} maxZoom={MAP.maxZoom} zoomSnap={MAP.zoomSnap} zoomControl={false} attributionControl={false}>
        <TileLayer url={MAP.imageryUrl} attribution={MAP.imageryAttribution} maxNativeZoom={MAP.maxNativeZoom} maxZoom={MAP.maxZoom} className="imagery-tiles" />
        <LabelsOverlay />
        <ZoomControl position="bottomleft" />
        <AttributionControl position="bottomleft" prefix={false} />
        <MapBridge />
        <ZoomClass />
        {views.fuel && <FuelGridLayer />}
        {views.rateGap && <RateGapLayer />}
        {views.rangeland && <RangelandLayer />}
        <SelectedFireLayer />
        <HomesLayer />
        {views.utilities && <UtilitiesLayer />}
        {views.sensors && <SensorLayer />}
        {views.watchlist && <WatchlistLayer />}
        <FireMarkersLayer />
      </MapContainer>
    </div>
  )
}
