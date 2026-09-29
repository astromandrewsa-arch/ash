import { RotateCcw } from 'lucide-react'
import { store } from '../../lib/store.js'
import { isFiltered } from '../../lib/locations.js'
import ChipGroup from '../common/ChipGroup.jsx'
import Dropdown from '../common/Dropdown.jsx'

const all = (label) => ({ value: 'all', label })

/** The §13 filters: chips for type, state and severity; menus for the rest. */
export default function FilterBar({ filters, onChange, onReset, rows, shown, portfolioStates }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })
  const uniq = (fn) => [...new Set(rows.map(fn))].sort()
  const bundles = store.bundles.filter((b) => rows.some((r) => r.bundleIds.has(b.id)))
  return (
    <div className="filter-bar glass" role="group" aria-label="Filters">
      <div className="filter-row">
        <ChipGroup label="Type" value={filters.type} onChange={set('type')} options={[all('All'), ...['Homes', 'Utility', 'Rangeland'].map((v) => ({ value: v, label: v }))]} />
        {portfolioStates.length > 1 && (
          <ChipGroup label="State" value={filters.state} onChange={set('state')} options={[all('All'), ...portfolioStates.map((v) => ({ value: v, label: v }))]} />
        )}
        <ChipGroup label="Severity" value={filters.severity} onChange={set('severity')} options={[all('All'), { value: 'Severe', label: 'Severe' }, { value: 'Non-severe', label: 'Non-severe' }]} />
      </div>
      <div className="filter-row">
        <Dropdown label="Bundle" value={filters.bundle} onChange={set('bundle')} options={[all('All'), ...bundles.map((b) => ({ value: b.id, label: b.name }))]} />
        <Dropdown
          label="Probability"
          value={filters.minProb}
          onChange={set('minProb')}
          options={[{ value: 0, label: 'Any' }, { value: 0.88, label: '88% or more' }, { value: 0.9, label: '90% or more' }, { value: 0.92, label: '92% or more' }]}
        />
        <Dropdown
          label="Days away"
          value={filters.maxDays}
          onChange={set('maxDays')}
          options={[{ value: 99, label: 'Any' }, { value: 10, label: '10 or fewer' }, { value: 15, label: '15 or fewer' }, { value: 20, label: '20 or fewer' }, { value: 25, label: '25 or fewer' }]}
        />
        <Dropdown label="Verdict" value={filters.verdict} onChange={set('verdict')} options={[all('All'), ...uniq((r) => r.verdict).map((v) => ({ value: v, label: v }))]} />
        <Dropdown label="Stage" value={filters.stage} onChange={set('stage')} options={[all('All'), ...uniq((r) => r.stage).map((v) => ({ value: v, label: v }))]} />
        <span className="filter-count">
          {shown} of {rows.length} fires
        </span>
        <button type="button" className="btn btn-ghost filter-reset" onClick={onReset} disabled={!isFiltered(filters)}>
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  )
}
