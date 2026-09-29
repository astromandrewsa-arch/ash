// Help (CLAUDE.md §17, §19): every definition the portal uses, with its figures filled in from the
// generated data so the dialog and the screens can never disagree.

const pct = (v, dp = 0) => `${(v * 100).toFixed(dp)}%`
const usd = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M` : `$${Math.round(v / 1e3)}k`)

export function buildHelp({ meta, pricing, deductible, locationLimit, constructionDR, assetDR, rangelandDR, inclusions, exclusions, contextTiles, example, bookSplit }) {
  const dr = Object.entries(constructionDR).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ')
  const assetVals = Object.values(assetDR)
  return {
    sections: [
      {
        id: 'forecast',
        title: 'How PRIMER dates a fire',
        lead: meta.forecastDefinition,
        paragraphs: [
          `Probability is re-scored every ${meta.rescoreHours} hours. A dated fire can drift after the call; below ${pct(meta.watchlistBelow)} it drops back to the watchlist.`,
          'PRIMER is the only model that measures fuel on the ground and puts a date on a fire. Live and dead fuel moisture sensors in every covered area feed it; the cat models and danger ratings below work from weather records, static fuel maps or modelled moisture.',
        ],
      },
      {
        id: 'lead',
        title: 'Lead time and window',
        paragraphs: [
          'Lead time is the number of days from the call to the first day of the window. The window is the span in which the hectare’s accumulated probability reaches the threshold; it starts wide and narrows as each issue is re-scored.',
          `Example: ${example.id} was called on ${example.called}, ${example.leadDays} days ahead, for ${example.window}; its window narrowed from ${example.from} to ${example.to} days.`,
        ],
      },
      {
        id: 'texas',
        title: 'The Texas note',
        paragraphs: ['A month ahead in a monotonic dry season, narrowing to days inside the weather horizon. Texas has two seasons, and intermittent rain resets the fast clock.'],
      },
      {
        id: 'bands',
        title: 'P90, P50 and P25 bands',
        terms: [
          { term: 'P90', text: 'Burns in at least 90% of ensemble runs: the core of the fire. Its loss is the lower figure.' },
          { term: 'P50', text: 'The expected footprint. Its loss is the point figure.' },
          { term: 'P25', text: 'The tail if nothing intervenes. Its loss is the upper figure.' },
          { term: 'Secondary uncertainty', text: 'The spread between the P90 and P25 losses; the ELT’s SD is (upper − lower) ÷ 2.56.' },
        ],
      },
      {
        id: 'damage',
        title: 'Mean damage ratio',
        paragraphs: [
          `Loss divided by replacement value, by fuel and construction: ${dr}; utilities ${Math.min(...assetVals).toFixed(2)}–${Math.max(...assetVals).toFixed(2)} by asset; rangeland about ${rangelandDR.toFixed(2)} across pasture, fencing and livestock.`,
        ],
      },
      {
        id: 'gross',
        title: 'Ground-up and gross',
        paragraphs: [`Ground-up is the loss before policy terms. Gross applies a ${pct(deductible)} deductible and a ${usd(locationLimit)} per-location limit.`],
      },
      {
        id: 'aal',
        title: 'AAL and 30-day expected loss',
        terms: [
          { term: 'AAL', text: 'Average annual loss: the long-run expected loss per year, often quoted per $1,000 of TIV. It is what the cat models produce and what rates were filed on.' },
          { term: '30-day expected loss', text: 'Σ probability × point loss over the fires dated for the next 30 days. The alert card sums only the fires visible at the slider’s position.' },
        ],
      },
      {
        id: 'ep',
        title: 'EP curve, OEP, return period and TVaR',
        terms: [
          { term: 'EP curve', text: 'Exceedance probability: the chance in a year that a single event’s loss exceeds each amount.' },
          { term: 'OEP 1-in-100 and 1-in-250', text: 'The occurrence losses exceeded once in 100 and once in 250 years.' },
          { term: 'Return period', text: 'Where a loss sits on the book’s EP curve, stated as “a 1-in-N event for this book”.' },
          { term: 'TVaR', text: 'Tail value at risk: the expected loss given that the return-period loss is exceeded.' },
        ],
      },
      {
        id: 'premium',
        title: 'Technical premium and rate adequacy',
        formula: true,
        paragraphs: [
          `The premium that pays PRIMER’s dated expected loss and its adjustment cost, covers the fixed and variable expenses and earns the target return: FE is $${pricing.fixedExpensePerPolicy} a policy, ALAE ${pct(pricing.alae)} of loss, VE ${pct(pricing.variableExpense)} and RoP ${pct(pricing.returnOnPremium)} of premium. Divided by TIV it is the PRIMER technical rate; rate adequacy is the market rate against it.`,
        ],
      },
      {
        id: 'fuel',
        title: 'Fuel moisture, ERC and timelag classes',
        terms: [
          { term: 'Live fuel moisture', text: 'Water in living plants as a share of dry weight. Below about 80% the live fuel carries fire; with curing it sets the window (the slow clock).' },
          { term: 'Dead fuel timelag classes', text: '1-h, 10-h, 100-h and 1000-h fuels: twigs to logs, named for how fast they follow the air’s humidity. The fine classes and the wind set the day (the fast clock).' },
          { term: 'Curing', text: 'The share of the grass that is dead. Above about 80% cured, grass fires run.' },
          { term: 'ERC', text: 'Energy release component: the heat available at the flaming front, read against the Texas 90th percentile.' },
          { term: 'KBDI', text: 'Keetch–Byram drought index: 0 is saturated soil, 800 is absolute drought.' },
        ],
      },
      {
        id: 'payer',
        title: 'Who pays for the plan',
        paragraphs: [
          'Fuel work on private land is the landowner plus a state cost-share (TPWD, TFS, NRCS EQIP). Corridor work and PSPS are the utility’s, rate-recoverable under an HB 145 wildfire plan. Structure defence and hardening are carrier-funded. A state agency plan is the state’s.',
          `Across this book’s plans: ${pct(bookSplit.publicShare)} utilities, the state and counties; ${pct(bookSplit.privateShare)} landowners and operators; ${pct(bookSplit.carrierShare)} the carrier.`,
        ],
      },
      {
        id: 'scope',
        title: 'The scope rule',
        paragraphs: [
          'When the P50 footprint exceeds 2,000 ha or the plan would cost more than 40% of the loss it avoids, the plan narrows to homes ranked by TIV × damage ratio until the ratio holds. The map shows protected homes with a green ring and warned homes with an amber ring.',
        ],
      },
      {
        id: 'loss',
        title: 'What the loss includes, and what is not modelled',
        paragraphs: [
          `Every fire’s loss includes ${inclusions.join(', ')} and excludes ${exclusions.join(' and ')}.`,
          'Not modelled: home-to-home urban conflagration and ember loss inside dense subdivisions, and smoke. ALE and demand surge are shown as inclusions on each fire, not inside the point loss.',
        ],
      },
      {
        id: 'glossary',
        title: 'Terms on screen',
        terms: [
          { term: 'TIV', text: 'Total insured value: the rebuild value of the covered homes and assets.' },
          { term: 'Exposed TIV and exposed locations', text: 'The TIV and the count of locations inside a fire’s footprint.' },
          { term: 'Loss lower / point / upper', text: 'The live-event convention: the P90, P50 and P25 losses.' },
          { term: 'Exposure concentration', text: 'The top 10 areas by exposed TIV, ring analysis around a fire, and linear accumulations along lines and pipelines.' },
          { term: 'ELT view', text: 'Event loss table: event ID, rate (probability), mean loss, SD and exposure impacted.' },
          { term: 'Analogue event', text: 'The historical fire closest to this one in fuel, weather and terrain.' },
          { term: 'Inclusions and exclusions', text: 'What the loss figure carries (demand surge, debris removal, ALE) and what it leaves out.' },
          { term: 'Geocode quality and ITV', text: 'The share of locations geocoded to the building, and the flag on homes insured below their rebuild cost.' },
          { term: 'Loss ratio and combined ratio', text: 'Loss ÷ premium; and the loss ratio plus the expense ratio.' },
          { term: 'Mitigation credit', text: 'What the carrier can credit after the work: a Class A roof, a 5 ft ember zone, an IBHS Wildfire Prepared Home.' },
          { term: 'Brier score and reliability', text: 'The mean squared error of probability forecasts (lower is better), and whether events called at 90% happen 90% of the time.' },
          { term: 'Non-renewal rate and FAIR Plan share', text: 'Policies the market declined to renew, and the insurer of last resort’s share of the market.' },
        ],
      },
      {
        id: 'sources',
        title: 'Sources for the Texas market figures',
        sources: contextTiles.map((t) => ({ id: t.id, label: t.label, value: `${t.value} · ${t.note}`, source: t.source })),
      },
    ],
  }
}
