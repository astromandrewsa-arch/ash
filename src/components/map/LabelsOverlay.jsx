import { TileLayer } from 'react-leaflet'
import useZoom from '../../hooks/useZoom.js'
import useMapPane from '../../hooks/useMapPane.js'
import { MAP } from '../../config/map.js'
import useApp from '../../state/useApp.js'

/**
 * Place names and boundaries over the imagery once the map is zoomed in past 8. While a fire is
 * open they step back (the pane dims) so county lines do not compete with its perimeter.
 */
export default function LabelsOverlay() {
  const zoom = useZoom()
  const { selection } = useApp()
  const pane = useMapPane('labelsPane', 450)
  const opacity = selection?.kind === 'fire' ? MAP.labelsOpacityFireOpen : MAP.labelsOpacity
  return zoom >= MAP.labelsMinZoom ? <TileLayer pane={pane} url={MAP.labelsUrl} maxNativeZoom={19} maxZoom={19} opacity={opacity} className="labels-tiles" /> : null
}
