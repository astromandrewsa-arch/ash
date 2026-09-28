import { formatHa, formatNumber } from '../../lib/format.js'
import DrawerSection from './DrawerSection.jsx'

export default function IntensityBlock({ fire }) {
  const i = fire.intensity
  const figures = [
    { label: 'Fireline intensity', value: formatNumber(i.firelineIntensityKwM), unit: 'kW/m' },
    { label: 'Flame length', value: i.flameLengthM.toFixed(1), unit: 'm' },
    { label: 'Rate of spread', value: i.rateOfSpreadKmH.toFixed(1), unit: 'km/h' },
    { label: 'Wind speed', value: i.windKmH, unit: 'km/h' },
    { label: 'Wind from', value: i.windFrom, unit: `${i.windFromDeg}°` },
    { label: 'Final burn area', value: formatHa(fire.spread.finalHectares).replace(' ha', ''), unit: 'ha' },
  ]
  const tone = i.class === 'Extreme' ? 'extreme' : 'high'

  return (
    <DrawerSection title="Intensity" aside={<span className={`class-badge is-${tone}`}>{i.class}</span>}>
      <dl className="intensity-grid">
        {figures.map((x) => (
          <div key={x.label}>
            <dt>{x.label}</dt>
            <dd>
              {x.value} <small>{x.unit}</small>
            </dd>
          </div>
        ))}
      </dl>
    </DrawerSection>
  )
}
