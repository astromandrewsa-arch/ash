import { AttributionControl, MapContainer, Pane, TileLayer, ZoomControl } from 'react-leaflet'
import { areasBounds, mapConfig } from '../../lib/data.js'
import { mapPadding } from '../../lib/mapPadding.js'
import useApp from '../../state/useApp.js'
import MapBridge from './MapBridge.jsx'
import FuelGridLayer from './FuelGridLayer.jsx'
import CoverageLayer from './CoverageLayer.jsx'
import AreaLabels from './AreaLabels.jsx'
import SpreadPathsLayer from './SpreadPathsLayer.jsx'
import SelectedFireLayer from './SelectedFireLayer.jsx'
import HomesLayer from './HomesLayer.jsx'
import SensorLayer from './SensorLayer.jsx'
import FireMarkersLayer from './FireMarkersLayer.jsx'

export default function MapView() {
  const { layers } = useApp()

  return (
    <div className="map-view">
      <MapContainer
        className="map-canvas"
        bounds={areasBounds}
        boundsOptions={mapPadding(false)}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={mapConfig.tiles.url}
          attribution={mapConfig.tiles.attribution}
          maxNativeZoom={mapConfig.tiles.maxNativeZoom}
          maxZoom={mapConfig.maxZoom}
        />
        <ZoomControl position="bottomright" />
        <AttributionControl position="bottomleft" prefix={false} />
        <MapBridge />

        {/* Panes stack the layers: fuel grid, coverage, perimeters, homes, then markers on top. */}
        <Pane name="fuel" style={{ zIndex: 350 }}>
          {layers.fuelGrid && <FuelGridLayer />}
        </Pane>
        <Pane name="coverage" style={{ zIndex: 380 }}>
          {layers.coverage && <CoverageLayer />}
        </Pane>
        <Pane name="spread" style={{ zIndex: 400 }}>
          {layers.spread && <SpreadPathsLayer />}
          <SelectedFireLayer />
        </Pane>
        <Pane name="homes" style={{ zIndex: 420 }}>
          {layers.homes && <HomesLayer />}
        </Pane>
        <Pane name="sensors" style={{ zIndex: 430 }}>
          {layers.sensors && <SensorLayer />}
        </Pane>
        {layers.coverage && <AreaLabels />}
        {layers.fires && <FireMarkersLayer />}
      </MapContainer>
    </div>
  )
}
