import { RotateCcw } from 'lucide-react'
import { COUNTERPARTY_TYPES, FEED_DEFAULTS, STATUS_FILTERS } from '../../lib/negotiationFeed.js'
import { PAYERS } from '../fire/payers.js'
import ChipGroup from '../common/ChipGroup.jsx'
import Dropdown from '../common/Dropdown.jsx'

/** §12 filters: status chips with counts, counterparty type, payer. */
export default function FeedFilters({ items, filters, onChange, shown }) {
  const count = (g) => (g === 'All' ? items.length : items.filter((n) => n.feed.group === g).length)
  const set = (key) => (value) => onChange({ ...filters, [key]: value })
  const dirty = Object.keys(FEED_DEFAULTS).some((k) => filters[k] !== FEED_DEFAULTS[k])
  return (
    <div className="filter-bar glass">
      <div className="filter-row">
        <ChipGroup
          label="Status"
          value={filters.status}
          onChange={set('status')}
          options={STATUS_FILTERS.map((g) => ({
            value: g,
            label: (
              <>
                {g}
                <span className="chip-count">{count(g)}</span>
              </>
            ),
          }))}
        />
      </div>
      <div className="filter-row">
        <ChipGroup label="Counterparty" value={filters.type} onChange={set('type')} options={COUNTERPARTY_TYPES.map((t) => ({ value: t, label: t }))} />
        <Dropdown label="Payer" value={filters.payer} onChange={set('payer')} options={[{ value: 'all', label: 'Any' }, ...PAYERS.map((p) => ({ value: p.key, label: p.label }))]} />
        <span className="filter-count">
          {shown} of {items.length}
        </span>
        {dirty && (
          <button type="button" className="btn filter-reset" onClick={() => onChange(FEED_DEFAULTS)}>
            <RotateCcw size={13} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
