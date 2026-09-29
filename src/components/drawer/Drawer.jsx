import useApp from '../../state/useApp.js'
import DrawerShell from './DrawerShell.jsx'
import FireSummaryCard from './FireSummaryCard.jsx'
import AssetCard from './AssetCard.jsx'
import RanchCard from './RanchCard.jsx'
import AreaCard from './AreaCard.jsx'
import BundleCard from './BundleCard.jsx'

const CARDS = { fire: FireSummaryCard, asset: AssetCard, ranch: RanchCard, area: AreaCard, bundle: BundleCard }
const PROP = { fire: 'fireId', asset: 'assetId', ranch: 'ranchId', area: 'areaId', bundle: 'bundleId' }
const LABEL = { fire: 'Fire detail', asset: 'Asset detail', ranch: 'Ranch detail', area: 'Area detail', bundle: 'Bundle detail' }

/** The right-hand drawer (§4): one card for whatever is selected on the map. */
export default function Drawer() {
  const { selection, activeView } = useApp()
  const open = activeView === 'map' && selection !== null
  const Card = selection ? CARDS[selection.kind] : null
  return (
    <DrawerShell open={open} label={selection ? LABEL[selection.kind] : 'Detail'}>
      {Card && <Card key={`${selection.kind}:${selection.id}`} {...{ [PROP[selection.kind]]: selection.id }} />}
    </DrawerShell>
  )
}
