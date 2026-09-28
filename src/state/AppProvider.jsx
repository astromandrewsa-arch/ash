import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppContext } from './AppContext.js'
import quickViews from '../data/quickViews.json'
import timeline from '../data/timeline.json'
import { areaById, areasBounds, fireById, forecast, homeById, mapConfig, processByFireId } from '../lib/data.js'
import { mapPadding as padding } from '../lib/mapPadding.js'
import { UI } from '../config/ui.js'

const initialLayers = Object.fromEntries(quickViews.layers.map((layer) => [layer.id, layer.defaultOn]))

export default function AppProvider({ children }) {
  const [activeView, setActiveView] = useState('map')
  const [daysUntilFire, setDaysUntilFire] = useState(timeline.initial)
  const [layers, setLayers] = useState(initialLayers)
  const [preset, setPreset] = useState(forecast.defaultPreset)
  const [selection, setSelection] = useState(null) // { fireId, mode: 'detail' | 'agent' }
  const [handedOff, setHandedOff] = useState(() => new Set())
  const [helpOpen, setHelpOpen] = useState(false)
  const [highlightHomeId, setHighlightHomeId] = useState(null)
  const mapRef = useRef(null)

  const registerMap = useCallback((map) => {
    mapRef.current = map
  }, [])

  const toggleLayer = useCallback((id) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const flyHome = useCallback(() => {
    mapRef.current?.flyToBounds(areasBounds, { ...padding(false), duration: UI.flyDurationS })
  }, [])

  const flyToFire = useCallback((fireId) => {
    const map = mapRef.current
    if (!map) return
    const fire = fireById[fireId]
    const bounds = fire ? fire.spread.bounds : areaBounds(processByFireId[fireId]?.areaId)
    if (!bounds) return
    map.flyToBounds(bounds, { ...padding(true), maxZoom: mapConfig.fireZoom, duration: UI.flyDurationS })
  }, [])

  /** Open a fire (current or last month's) in the drawer, on the map, with its marker revealed. */
  const openFire = useCallback(
    (fireId, mode = 'detail') => {
      const fire = fireById[fireId]
      setActiveView('map')
      setHighlightHomeId(null)
      setSelection({ fireId, mode })
      if (fire) setDaysUntilFire((v) => Math.max(v, -fire.daysUntilFire))
      // Let the map view mount/settle before flying.
      requestAnimationFrame(() => flyToFire(fireId))
    },
    [flyToFire],
  )

  const setDrawerMode = useCallback((mode) => {
    setSelection((s) => (s ? { ...s, mode, animate: false } : s))
  }, [])

  const closeDrawer = useCallback(() => {
    setSelection(null)
    flyHome()
  }, [flyHome])

  const markHandedOff = useCallback((fireId) => {
    setHandedOff((prev) => new Set(prev).add(fireId))
  }, [])

  /** "Pass to your dedicated Pyrome agent": switch the drawer to the agent view, animating the first time. */
  const passToAgent = useCallback(
    (fireId) => {
      setSelection({ fireId, mode: 'agent', animate: !handedOff.has(fireId) })
      markHandedOff(fireId)
    },
    [handedOff, markHandedOff],
  )

  const flyToHome = useCallback((homeId) => {
    const home = homeById.get(homeId)
    if (!home) return
    setActiveView('map')
    setSelection(null)
    setHighlightHomeId(homeId)
    requestAnimationFrame(() =>
      mapRef.current?.flyTo(home.centroid, mapConfig.homeZoom, { duration: UI.flyDurationS }),
    )
  }, [])

  // Escape closes whatever is on top.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (helpOpen) setHelpOpen(false)
      else if (selection) closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [helpOpen, selection, closeDrawer])

  const value = useMemo(
    () => ({
      activeView,
      setActiveView,
      daysUntilFire,
      setDaysUntilFire,
      layers,
      toggleLayer,
      preset,
      setPreset,
      selection,
      drawerOpen: selection !== null,
      openFire,
      setDrawerMode,
      closeDrawer,
      handedOff,
      passToAgent,
      helpOpen,
      setHelpOpen,
      highlightHomeId,
      flyToHome,
      registerMap,
    }),
    [
      activeView, daysUntilFire, layers, toggleLayer, preset, selection, openFire, setDrawerMode, closeDrawer,
      handedOff, passToAgent, helpOpen, highlightHomeId, flyToHome, registerMap,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function areaBounds(areaId) {
  const area = areaById[areaId]
  if (!area) return null
  const lats = area.polygon.map((p) => p[0])
  const lons = area.polygon.map((p) => p[1])
  return [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ]
}
