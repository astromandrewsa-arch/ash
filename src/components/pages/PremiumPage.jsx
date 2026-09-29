import { BadgeDollarSign } from 'lucide-react'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function PremiumPage() {
  return (
    <PlaceholderPage
      title="Premium Intelligence"
      summary="Rate adequacy for each bundle: market rate against PRIMER's technical rate, and the 2027 recommendation."
      icon={BadgeDollarSign}
      sections={[
        { title: 'Texas market context', text: 'Average premium, recent rate increases, non-renewals and the FAIR Plan share.' },
        { title: 'Bundle table', text: 'Policies, TIV, premium, market and technical rates, adequacy and the 2027 change.' },
        { title: 'Science panel', text: 'Fuel load, live and dead fuel trends, spread and intensity shifts behind each bundle’s rate.' },
      ]}
    />
  )
}
