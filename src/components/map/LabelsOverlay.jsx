import { TileLayer } from 'react-leaflet'
import useZoom from '../../hooks/useZoom.js'
import useMapPane from '../../hooks/useMapPane.js'
import { MAP } from '../../config/map.js'

/** Place names and boundaries over the imagery once the map is zoomed in past 8. */
export default function LabelsOverlay() {
  const zoom = useZoom()
  const pane = useMapPane('labelsPane', 450)
  return zoom >= MAP.labelsMinZoom ? <TileLayer pane={pane} url={MAP.labelsUrl} maxNativeZoom={19} maxZoom={19} className="labels-tiles" /> : null
}
