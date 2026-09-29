import { Pane, TileLayer } from 'react-leaflet'
import useZoom from '../../hooks/useZoom.js'

const LABELS_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
const LABELS_MIN_ZOOM = 9 // "toggled on above zoom 8"

/** Place names and boundaries over the imagery once the map is zoomed in past 8. */
export default function LabelsOverlay() {
  const zoom = useZoom()
  return (
    <Pane name="labels" style={{ zIndex: 450, pointerEvents: 'none' }}>
      {zoom >= LABELS_MIN_ZOOM && <TileLayer url={LABELS_URL} maxNativeZoom={19} maxZoom={19} className="labels-tiles" />}
    </Pane>
  )
}
