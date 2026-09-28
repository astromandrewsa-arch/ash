import { useCallback, useMemo, useState } from 'react'
import { AppContext } from './AppContext.js'
import quickViews from '../data/quickViews.json'
import timeline from '../data/timeline.json'

const initialLayers = Object.fromEntries(
  quickViews.layers.map((layer) => [layer.id, layer.defaultOn]),
)

export default function AppProvider({ children }) {
  const [activeView, setActiveView] = useState('map')
  const [daysUntilFire, setDaysUntilFire] = useState(timeline.initial)
  const [layers, setLayers] = useState(initialLayers)
  const [selectedFireId, setSelectedFireId] = useState(null)

  const toggleLayer = useCallback((id) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const openFire = useCallback((id) => setSelectedFireId(id), [])
  const closeDrawer = useCallback(() => setSelectedFireId(null), [])

  const value = useMemo(
    () => ({
      activeView,
      setActiveView,
      daysUntilFire,
      setDaysUntilFire,
      layers,
      toggleLayer,
      selectedFireId,
      drawerOpen: selectedFireId !== null,
      openFire,
      closeDrawer,
    }),
    [activeView, daysUntilFire, layers, toggleLayer, selectedFireId, openFire, closeDrawer],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
