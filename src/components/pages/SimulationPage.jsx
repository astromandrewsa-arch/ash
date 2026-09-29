import { FlaskConical } from 'lucide-react'
import PlaceholderPage from './PlaceholderPage.jsx'

export default function SimulationPage() {
  return (
    <PlaceholderPage
      title="Simulation"
      summary="Thirty days from 29 Sep: what the book loses with no intervention, as negotiated, and if every plan fails."
      icon={FlaskConical}
      sections={[
        { title: 'Calendar', text: 'Each dated fire placed on its burn window, in its severity colour, with state-plan fires marked.' },
        { title: 'Intervention schedule', text: 'Actions, dates, counterparties, cost, payer split and probability of prevention per fire.' },
        { title: 'Book arithmetic', text: 'Expected loss per fire and for the book under each of the three outcomes, recomputed from the data.' },
      ]}
    />
  )
}
