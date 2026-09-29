import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { AppContext } from './AppContext.js'
import { store } from '../lib/store.js'
import { boundsOfAreas, boundsOfRing, fireFocusBounds } from '../lib/geo.js'
import { assetAnchor } from '../lib/assets.js'
import { mapPadding } from '../lib/mapPadding.js'
import { portfolioOf } from '../lib/selectors.js'
import { UI } from '../config/ui.js'
import { DEFAULT_VIEWS } from '../config/quickViews.js'

/** App-wide state (plain React context, CLAUDE.md §0). */
export default function AppProvider({ children }) {
  const [activeView, setActiveViewRaw] = useState('map')
  const [portfolioId, setPortfolioId] = useState(store.portfolio.defaultId)
  const [daysUntilFire, setDaysUntilFire] = useState(-30)
  const [views, setViews] = useState(DEFAULT_VIEWS)
  const [selection, setSelection] = useState(null) // { kind: 'fire' | 'asset' | 'ranch' | 'area' | 'bundle', id }
  const [drawerTab, setDrawerTab] = useState('forecast')
  const [moreInfo, setMoreInfo] = useState(null) // open tab id, or null
  const [plansViewed, setPlansViewed] = useState(() => new Set())
  const [handedOff, setHandedOff] = useState(() => new Set())
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpSection, setHelpSection] = useState(null)
  const mapRef = useRef(null)

  const registerMap = useCallback((map) => {
    mapRef.current = map
  }, [])

  const setActiveView = useCallback((view) => {
    setActiveViewRaw(view)
    if (view !== 'map') setMoreInfo(null)
  }, [])

  const toggleView = useCallback((key) => setViews((v) => ({ ...v, [key]: !v[key] })), [])
  const setView = useCallback((key, value) => setViews((v) => ({ ...v, [key]: value })), [])

  const flyToBounds = useCallback((bounds, { drawer = false, maxZoom = 16 } = {}) => {
    const map = mapRef.current
    if (!map || !bounds) return
    map.flyToBounds(bounds, { ...mapPadding(drawer), maxZoom, duration: UI.flyDurationS })
  }, [])

  const flyToBook = useCallback((id) => {
    const p = portfolioOf(id)
    mapRef.current?.flyTo(p.view.center, p.view.zoom, { duration: UI.flyDurationS })
  }, [])

  /** Switch the book shown; the map flies to that book's view (§9). */
  const setPortfolio = useCallback(
    (id, { fly = true } = {}) => {
      setPortfolioId(id)
      setSelection(null)
      if (fly) flyToBook(id)
    },
    [flyToBook],
  )

  /** Open something in the drawer and, unless told not to, fly the map to it. */
  const select = useCallback(
    (kindIn, idIn, { fly = true, tab } = {}) => {
      let kind = kindIn
      let id = idIn
      // Rangeland and utility areas open their ranch or asset card.
      if (kind === 'area') {
        const a = store.areaById.get(id)
        if (a?.type === 'rangeland' && a.ranchId) [kind, id] = ['ranch', a.ranchId]
        else if (a?.type === 'utility' && a.assetIds?.length) [kind, id] = ['asset', a.assetIds[0]]
      }
      setActiveViewRaw('map')
      setMoreInfo(null)
      setSelection({ kind, id })
      if (kind === 'fire') {
        const fire = store.fireById.get(id)
        if (!fire) return
        setDrawerTab(tab || 'forecast')
        setDaysUntilFire((v) => Math.max(v, -fire.daysUntilFire))
        if (fly) requestAnimationFrame(() => flyToBounds(fireFocusBounds(fire), { drawer: true, maxZoom: fire.ignitionZone.class === 'Sector' ? 12 : 13 }))
        return
      }
      if (!fly) return
      let bounds = null
      let maxZoom = 12
      if (kind === 'area') {
        bounds = boundsOfRing(store.areaById.get(id)?.polygon)
        maxZoom = 14
      } else if (kind === 'asset') {
        const asset = store.assetById.get(id)
        bounds = asset?.kind === 'substation' ? L.latLng(assetAnchor(asset)).toBounds(3000) : boundsOfRing(store.areaById.get(asset?.areaId)?.polygon)
      } else if (kind === 'ranch') {
        bounds = boundsOfRing(store.areaById.get(store.ranchById.get(id)?.areaId)?.polygon)
      } else if (kind === 'bundle') {
        const b = store.bundleById.get(id)
        bounds = b ? boundsOfAreas(b.areaIds.map((a) => store.areaById.get(a))) : null
        maxZoom = 11
      }
      if (bounds) requestAnimationFrame(() => flyToBounds(bounds, { drawer: true, maxZoom }))
    },
    [flyToBounds],
  )

  const closeDrawer = useCallback(() => {
    setSelection(null)
    setMoreInfo(null)
    flyToBook(portfolioId)
  }, [portfolioId, flyToBook])

  const markPlanViewed = useCallback((fireId) => {
    setPlansViewed((prev) => (prev.has(fireId) ? prev : new Set(prev).add(fireId)))
  }, [])

  const markHandedOff = useCallback((fireId) => {
    setHandedOff((prev) => (prev.has(fireId) ? prev : new Set(prev).add(fireId)))
  }, [])

  /** Legacy screens (until their pass replaces them) open fires through this. */
  const openFire = useCallback(
    (fireId) => {
      if (store.fireById.has(fireId)) select('fire', fireId)
    },
    [select],
  )

  const openHelp = useCallback((section = null) => {
    setHelpSection(section)
    setHelpOpen(true)
  }, [])

  // Escape closes whatever is on top.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (helpOpen) setHelpOpen(false)
      else if (moreInfo) setMoreInfo(null)
      else if (selection) closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [helpOpen, moreInfo, selection, closeDrawer])

  const value = useMemo(
    () => ({
      activeView,
      setActiveView,
      portfolioId,
      setPortfolio,
      daysUntilFire,
      setDaysUntilFire,
      views,
      toggleView,
      setView,
      selection,
      select,
      closeDrawer,
      drawerOpen: selection !== null,
      drawerTab,
      setDrawerTab,
      moreInfo,
      setMoreInfo,
      plansViewed,
      markPlanViewed,
      handedOff,
      markHandedOff,
      helpOpen,
      setHelpOpen,
      helpSection,
      openHelp,
      registerMap,
      mapRef,
      flyToBounds,
      openFire,
    }),
    [activeView, setActiveView, portfolioId, setPortfolio, daysUntilFire, views, toggleView, setView, selection, select, closeDrawer, drawerTab, moreInfo, plansViewed, markPlanViewed, handedOff, markHandedOff, helpOpen, helpSection, openHelp, registerMap, flyToBounds, openFire],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
