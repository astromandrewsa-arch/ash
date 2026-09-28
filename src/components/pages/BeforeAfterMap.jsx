import { AttributionControl, MapContainer, Polygon, TileLayer } from 'react-leaflet'
import { mapConfig } from '../../lib/data.js'

const STATIC_MAP = {
  zoomControl: false,
  attributionControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  touchZoom: false,
}

/** One side of the before/after comparison: same view, the "after" side desaturated with the scar. */
export default function BeforeAfterMap({ ba, styles, after = false, attribution = false }) {
  return (
    <MapContainer className={`ba-map${after ? ' is-after' : ''}`} bounds={ba.bounds} boundsOptions={{ padding: [24, 24] }} {...STATIC_MAP}>
      <TileLayer url={mapConfig.tiles.url} attribution={mapConfig.tiles.attribution} maxNativeZoom={mapConfig.tiles.maxNativeZoom} />
      {attribution && <AttributionControl position="bottomleft" prefix={false} />}
      {after && <Polygon positions={ba.burnScar} pathOptions={styles.scar} interactive={false} />}
      <Polygon positions={ba.predictedPerimeter} pathOptions={styles.predicted} interactive={false} />
    </MapContainer>
  )
}
