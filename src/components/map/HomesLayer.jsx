import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { paintClusterDots, paintHomes } from '../../lib/homesPaint.js'
import { store } from '../../lib/store.js'
import { inBook } from '../../lib/selectors.js'
import { MAP } from '../../config/map.js'
import useApp from '../../state/useApp.js'
import useHomeStyle from '../../hooks/useHomeStyle.js'
import useMapPane from '../../hooks/useMapPane.js'
import HomeHover from './HomeHover.jsx'

/**
 * The book's 49,500 homes on two canvases (§2): cluster dots below zoom 9, sitting above the asset
 * icons; dots from 9 and footprints from 14 in the homes pane under them.
 */
export default function HomesLayer() {
  const map = useMap()
  const { portfolioId, views } = useApp()
  const styleOf = useHomeStyle()
  const homesPane = useMapPane('homesPane', 420)
  const clusterPane = useMapPane('clusterPane', 615)
  const layers = useRef([])
  const st = useRef({ showHomes: true, areas: [], styleOf: () => null, mode: 'none', clusters: [] })
  const areas = useMemo(() => store.areas.filter((a) => a.type === 'homes' && inBook(a.state, portfolioId)), [portfolioId])

  useLayoutEffect(() => {
    Object.assign(st.current, { showHomes: views.homes, areas, styleOf })
    for (const l of layers.current) l.redraw()
  }, [views.homes, areas, styleOf])

  useEffect(() => {
    const homes = new CanvasOverlay((ctx, view) => paintHomes(ctx, view, st.current), { pane: homesPane, pad: MAP.viewportPad })
    const clusters = new CanvasOverlay((ctx, view) => paintClusterDots(ctx, view, st.current), { pane: clusterPane, pad: 0.1 })
    homes.addTo(map)
    clusters.addTo(map)
    layers.current = [homes, clusters]
    return () => {
      homes.remove()
      clusters.remove()
      layers.current = []
    }
  }, [map, homesPane, clusterPane])

  return <HomeHover st={st} />
}
