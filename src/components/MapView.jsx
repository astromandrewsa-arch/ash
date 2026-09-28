import { AttributionControl, MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import mapConfig from '../data/mapConfig.json'

export default function MapView() {
  return (
    <div className="map-view">
      <MapContainer
        className="map-canvas"
        center={mapConfig.center}
        zoom={mapConfig.zoom}
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
      </MapContainer>
    </div>
  )
}
