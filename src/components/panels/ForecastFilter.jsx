import { CalendarRange } from 'lucide-react'
import { forecast, presetById } from '../../lib/data.js'
import useApp from '../../state/useApp.js'
import CollapsibleCard from '../common/CollapsibleCard.jsx'
import SegmentedControl from '../common/SegmentedControl.jsx'

export default function ForecastFilter() {
  const { preset, setPreset } = useApp()
  const options = forecast.presets.map((p) => ({ value: p.id, label: p.label }))

  return (
    <CollapsibleCard title="Forecast filter" icon={CalendarRange} className="forecast-filter">
      <SegmentedControl options={options} value={preset} onChange={setPreset} ariaLabel="Forecast preset" />
      <p className="preset-definition">{presetById[preset].definition}</p>
    </CollapsibleCard>
  )
}
