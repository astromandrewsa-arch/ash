import { useCallback, useMemo } from 'react'
import { store } from '../../lib/store.js'
import { areaInBook } from '../../lib/selectors.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import AssetShape from './AssetShape.jsx'
import AssetIcon from './AssetIcon.jsx'
import AssetDetailLayer from './AssetDetailLayer.jsx'

/** Covered utility assets (§6): yellow lines and pipelines, footprints, icons; poles from zoom 12. */
export default function UtilitiesLayer() {
  const { portfolioId, selection, select } = useApp()
  const pane = useMapPane('assetsPane', 430, { interactive: true })
  const assets = useMemo(() => store.assets.filter((a) => areaInBook(a.areaId, portfolioId)), [portfolioId])
  const selectedId = selection?.kind === 'asset' ? selection.id : null
  const onSelect = useCallback((id) => select('asset', id), [select])
  return (
    <>
      {assets.map((a) => (
        <AssetShape key={a.id} asset={a} pane={pane} selected={a.id === selectedId} onSelect={onSelect} />
      ))}
      <AssetDetailLayer assets={assets} />
      {assets.map((a) => (
        <AssetIcon key={a.id} asset={a} selected={a.id === selectedId} onSelect={onSelect} />
      ))}
    </>
  )
}
