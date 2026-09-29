import { useCallback } from 'react'
import { watchlistInBook } from '../../lib/selectors.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import WatchlistMarker from './WatchlistMarker.jsx'

/** Areas PRIMER is watching below the 90% dating threshold (§7). */
export default function WatchlistLayer() {
  const { portfolioId, select } = useApp()
  const pane = useMapPane('watchPane', 630, { interactive: true })
  const onSelect = useCallback((w) => select('area', w.areaId), [select])
  return watchlistInBook(portfolioId).map((w) => <WatchlistMarker key={w.id} item={w} pane={pane} onSelect={onSelect} />)
}
