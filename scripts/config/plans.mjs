// Intervention plans (CLAUDE.md §11) and the negotiation stories (§12).
// Action costs use the §11 unit costs; each plan's actions sum to its stated total and payer split.
// Agents are invented Pyrome staff; counterparties are roles at real agencies and utilities.

const a = (text, owner, payer, cost, start, end, unit) => ({ text, owner, payer, cost, start, end, unit })

export const PLANS = {
  'PH-01': {
    verdict: 'Partly',
    summary: '60 km bladed line and 45 km grazed strip along the corridor; 120 priority poles replaced; PSPS on the red-flag day; 4,000 ac back-burn on Turkey Track; county pre-notice.',
    actions: [
      a('Replace 120 priority poles on the Xcel corridor', 'Xcel Energy (SPS)', 'utility', 1260000, '2026-10-01', '2026-10-09', '$10.5k per pole'),
      a('PSPS de-energisation of the corridor on the red-flag day', 'Xcel Energy (SPS)', 'utility', 140000, '2026-10-14', '2026-10-15', 'one PSPS event'),
      a('Blade 60 km of firebreak along the corridor', 'Texas A&M Forest Service', 'state', 108000, '2026-10-02', '2026-10-08', '$1,800 per km'),
      a('4,000 ac back-burn on Turkey Track in the 9–10 Oct humidity window', 'Texas A&M Forest Service', 'state', 120000, '2026-10-09', '2026-10-10', '$30 per ac'),
      a('Stage 4 TFS engines on the red-flag days', 'Texas A&M Forest Service', 'state', 288000, '2026-10-14', '2026-10-19', '$12k per engine-day'),
      a('Two dozers on standby for the plowed-wheat line', 'Texas A&M Forest Service', 'state', 284000, '2026-10-13', '2026-10-19', 'equipment standby'),
      a('Graze a 45 km strip along the corridor', 'Turkey Track Ranch', 'landowner', 13000, '2026-10-01', '2026-10-12', '$12 per ac'),
      a('Move 9,000 cattle off the east pastures before the window', 'Turkey Track Ranch', 'landowner', 187000, '2026-10-11', '2026-10-13', 'haul and pasture rent'),
      a('Hardening audits and 5 ft ember zones on 80 Canadian homes', 'Demo Carrier', 'carrier', 200000, '2026-10-03', '2026-10-12', '$2,500 per home'),
      a('Evacuation pre-notice to Hutchinson and Hemphill counties', 'Hutchinson County Emergency Management', 'county', 0, '2026-10-11', '2026-10-11', 'staff time'),
    ],
    pPrevent: 0.62, pFireAfterPlan: 0.92, lossIfHolds: 0, lossIfFails: 23e6,
    protect: { count: 80, areaIds: ['CAN-1', 'CAN-2'] },
    credit: '80 Canadian homes qualify for the 5 ft ember-zone credit; 31 with Class A roofs can certify as IBHS Wildfire Prepared Home.',
  },
  'AU-02': {
    verdict: 'Targeted',
    // Counts come from the generated path: x.protected, x.warnedP50 (other P50 homes), x.tail (P25-only homes).
    summary: (x) => `Protect the ${x.protected} highest-value homes on the lake side (40 m breaks, hardening audits, two engines on the day); RM 620 spur de-energised; the other ${x.warnedP50} homes in the P50 path get pre-warning only.`,
    actions: [
      a('40 m fuel breaks behind the 96 lake-side homes', 'Demo Carrier', 'carrier', 132000, '2026-10-01', '2026-10-06', '$2,200 per ac'),
      a('Hardening audits on 96 homes', 'Demo Carrier', 'carrier', 240000, '2026-10-01', '2026-10-05', '$2,500 per home'),
      a('Ember-resistant vents and gutter guards on 96 homes', 'Demo Carrier', 'carrier', 138000, '2026-10-02', '2026-10-07', '$1,440 per home'),
      a('Two structure-defence engines on the day', 'Demo Carrier', 'carrier', 90000, '2026-10-09', '2026-10-11', '$15k per engine-day'),
      a('Thin 120 ac of greenbelt juniper along RM 620', 'Travis County', 'county', 240000, '2026-10-01', '2026-10-07', '$2,000 per ac'),
      a('Clear and sign the RM 620 evacuation route', 'Travis County', 'county', 60000, '2026-10-03', '2026-10-06', 'crew time'),
      a('De-energise the RM 620 spur for the red-flag window', 'Austin Energy', 'utility', 150000, '2026-10-09', '2026-10-10', 'one PSPS event'),
      a('Line patrol and hot-spot scan of the RM 620 spur', 'Austin Energy', 'utility', 50000, '2026-10-06', '2026-10-08', 'patrol'),
    ],
    pPrevent: 0.74, pFireAfterPlan: 0.9, lossIfHolds: 22e6, lossIfFails: 31e6,
    protect: { count: 96 },
    credit: '96 homes gain the Class A roof and 5 ft ember-zone credit; 58 qualify for IBHS Wildfire Prepared Home.',
  },
  'BA-03': {
    verdict: 'Yes',
    summary: 'Thin the three ignition blocks (600 ac) and burn 700 ac in the 3–5 Nov humidity window; Bluebonnet line inspection.',
    actions: [
      a('Thin the three ignition blocks, 600 ac of loblolly understorey', 'Texas A&M Forest Service', 'state', 510000, '2026-10-01', '2026-10-15', '$850 per ac with TFS crews'),
      a('Prescribed burn of 700 ac in the humidity window', 'Texas A&M Forest Service', 'state', 190000, '2026-10-16', '2026-10-18', '$27 per ac'),
      a('Landowner share of the thinning (NRCS EQIP cost-share)', 'Bastrop County landowners', 'landowner', 400000, '2026-10-01', '2026-10-15', 'EQIP match'),
      a('Bluebonnet line inspection and pine clearance', 'Bluebonnet Electric Cooperative', 'carrier', 100000, '2026-10-05', '2026-10-09', 'carrier-funded inspection'),
    ],
    pPrevent: 0.81, pFireAfterPlan: 0.9, lossIfHolds: 8e6, lossIfFails: 19e6,
    protect: { all: true },
    credit: 'All 410 homes in the path sit inside treated fuel; 140 qualify for the IBHS neighbourhood credit.',
  },
  'CT-04': {
    verdict: 'Yes',
    summary: 'Oncor feeder de-energised on the red-flag day; 12 km blade line north of Carbon; 40 homes hardened.',
    actions: [
      a('De-energise the Oncor Eastland feeder on the red-flag day', 'Oncor', 'utility', 180000, '2026-10-11', '2026-10-12', 'one PSPS event'),
      a('Blade 12 km of line north of Carbon', 'Eastland County', 'county', 18000, '2026-10-03', '2026-10-06', '$1,500 per km'),
      a('County dozer and water tender on standby', 'Eastland County', 'county', 72000, '2026-10-11', '2026-10-16', 'equipment standby'),
      a('Hardening audits on the 40 highest-ranked homes', 'Demo Carrier', 'carrier', 40000, '2026-10-02', '2026-10-09', 'carrier share of $2,500 per home'),
    ],
    pPrevent: 0.84, pFireAfterPlan: 0.55, lossIfHolds: 2e6, lossIfFails: 6e6,
    protect: { count: 40 },
    credit: '40 hardened homes earn the 5 ft ember-zone credit at renewal.',
  },
  'HC-05': {
    verdict: 'Yes',
    summary: 'Graze and cut a 40 m break on the north boundary; burn the block in the humidity window.',
    actions: [
      a('Graze and cut a 40 m break on the north boundary', 'Landowner (Crabapple block)', 'landowner', 70000, '2026-10-05', '2026-10-15', '$1,200 per ac'),
      a('Burn the 380 ha block in the humidity window', 'Texas A&M Forest Service', 'state', 50000, '2026-10-20', '2026-10-21', '$53 per ac with TFS cost-share'),
    ],
    pPrevent: 0.88, pFireAfterPlan: 0.9, lossIfHolds: 0.5e6, lossIfFails: 1.5e6,
    protect: { all: true },
    credit: 'The 47 homes behind the break keep their current credits; no new credit is needed.',
  },
  'PK-06': {
    verdict: 'Targeted',
    summary: 'Defend three peninsulas: 12 km break, engines staged; interior slopes cannot be cut.',
    actions: [
      a('Cut a 12 km break across the three peninsula necks', 'Palo Pinto County', 'county', 216000, '2026-10-03', '2026-10-12', '$1,800 per km plus hand crews'),
      a('Stage county engines at the peninsula roads', 'Palo Pinto County', 'county', 84000, '2026-10-17', '2026-10-21', '$12k per engine-day'),
      a('Structure-defence engines for the lake-shore homes', 'Demo Carrier', 'carrier', 150000, '2026-10-17', '2026-10-21', '$15k per engine-day'),
      a('Hardening audits on the ranked homes', 'Demo Carrier', 'carrier', 90000, '2026-10-02', '2026-10-10', '$2,500 per home'),
      a('HOA clearance of common-area juniper', 'Possum Kingdom HOAs', 'landowner', 100000, '2026-10-04', '2026-10-12', 'HOA contractors'),
    ],
    pPrevent: 0.71, pFireAfterPlan: 0.85, lossIfHolds: 9e6, lossIfFails: 12e6,
    protect: { count: 70 },
    credit: '70 lake-shore homes earn the ember-zone credit; 24 qualify for IBHS Wildfire Prepared Home.',
  },
  'RP-07': {
    verdict: 'Cannot be mitigated',
    statePlan: true,
    summary: '12,000 ha is beyond any pre-treatment in the window. State agency plan: TFS engines pre-positioned, livestock moved off the quadrant, fence lines opened.',
    actions: [
      a('Pre-position TFS engines and a strike team at Matador', 'Texas A&M Forest Service', 'state', 400000, '2026-10-11', '2026-10-25', 'state agency plan'),
      a('Move cattle off the south-west quadrant', 'Matador Ranch', 'landowner', 120000, '2026-10-10', '2026-10-12', 'haul and pasture rent'),
      a('Open fence lines so stock can run from the head', 'Matador Ranch', 'landowner', 60000, '2026-10-11', '2026-10-11', 'ranch crews'),
    ],
    pPrevent: 0, pFireAfterPlan: 0.9, lossIfHolds: 11.2e6, lossIfFails: 14e6,
    protect: null,
    credit: 'No structure credit applies; the ranch keeps its prescribed-burn rotation credit.',
  },
  'PB-08': {
    verdict: 'Yes',
    summary: 'Mow 90 km of ROW, clear 40 pads, EPSS settings on the feeder.',
    actions: [
      a('Mow 90 km of pipeline right-of-way', 'Plains All American', 'operator', 90000, '2026-10-05', '2026-10-12', '$1,000 per km'),
      a('Clear 40 well pads to bare caliche', 'Plains All American', 'operator', 310000, '2026-10-05', '2026-10-15', '$7,750 per pad'),
      a('EPSS fast-trip settings on the pad feeder', 'Oncor', 'utility', 120000, '2026-10-12', '2026-10-31', 'settings and patrol'),
    ],
    pPrevent: 0.79, pFireAfterPlan: 0.9, lossIfHolds: 1e6, lossIfFails: 5e6,
    protect: null,
    credit: 'Pump stations and turbines qualify for the cleared-perimeter credit at renewal.',
  },
  'OK-09': {
    verdict: 'No action',
    summary: 'Last season’s patch burns already cap the fire; plan withdrawn.',
    actions: [],
    pPrevent: null, pFireAfterPlan: 0.9, lossIfHolds: 2.1e6, lossIfFails: 2.1e6,
    protect: null,
    credit: 'The patch-burn rotation already earns the prescribed-burn credit.',
  },
  'OK-10': {
    verdict: 'Cannot be mitigated',
    statePlan: true,
    summary: 'Cannot be mitigated by fuel work in 9 days. PSPS on the OG&E feeder removes the three line starts; evacuation pre-notice; 60 homes hardened.',
    actions: [
      a('PSPS on the OG&E Logan County feeder for the wind event', 'OG&E', 'utility', 250000, '2026-10-08', '2026-10-09', 'one PSPS event'),
      a('Evacuation pre-notice and shelter staging', 'City of Stillwater', 'county', 80000, '2026-10-05', '2026-10-08', 'emergency management'),
      a('Hardening audits on the 60 highest-ranked homes', 'Demo Carrier', 'carrier', 50000, '2026-10-01', '2026-10-06', 'carrier share'),
    ],
    pPrevent: 0, pFireAfterPlan: 0.48, lossIfHolds: 57e6, lossIfFails: 57e6,
    protect: { count: 60 },
    credit: '60 hardened homes earn the ember-zone credit; the rest keep their current terms.',
  },
}

export const AGENTS = [
  { name: 'Maya Okafor', initials: 'MO' },
  { name: 'Luis Ferrer', initials: 'LF' },
  { name: 'Hannah Kowalski', initials: 'HK' },
  { name: 'Sam Whitehorse', initials: 'SW' },
]

const e = (day, text, by, declined = false) => ({ day, text, by, declined })

// Stages: Identified → Agent engaged → Government in negotiation → Work agreed → Work complete → Fire prevented;
// branch states Partial and State plan.
export const NEGOTIATIONS = {
  'PH-01': {
    short: 'Stinnett', counterpartyShort: 'Xcel and Hutchinson County', engagedOn: '2026-09-27', next: 'TFS decision on the Turkey Track back-burn and state cover for engine staging, due 3 Oct.',
    agent: 0, stage: 'Government in negotiation', counterparty: 'Xcel Energy (SPS) and Hutchinson County', counterpartyType: 'Utility', decisionDue: '2026-10-03',
    entries: [
      e('2026-09-24', 'Watchlist at 84%: agent assigned; corridor pole records requested from Xcel.', 'Pyrome agent'),
      e('2026-09-27', 'Agent engaged Xcel and Hutchinson County; PSPS window and pole list shared.', 'Pyrome agent'),
      e('2026-09-28', 'Xcel agrees in principle to replace 120 priority poles, rate-recoverable under its HB 145 plan.', 'Xcel Energy (SPS)'),
      e('2026-09-29', 'Dated at 92%, 15 days out. TFS reviewing the back-burn and dozer standby.', 'Pyrome agent'),
      e('2026-09-29', 'Hutchinson County declined to fund engine staging — budget; state asked to cover.', 'Hutchinson County', true),
    ],
    documents: ['Xcel pole priority list.pdf', 'PSPS window notice draft.pdf', 'TFS cost-share request.pdf'],
    // Agreed in principle, not yet signed (28 Sep entry).
    inPrinciple: { utility: 1400000 },
  },
  'AU-02': {
    short: 'Steiner Ranch', counterpartyShort: 'Travis County and Austin Energy', engagedOn: '2026-09-23', next: 'Lake-side breaks and hardening audits start 1 Oct; RM 620 spur de-energised for the window.',
    agent: 1, stage: 'Work agreed', counterparty: 'Travis County and Austin Energy', counterpartyType: 'County', decisionDue: '2026-09-30',
    entries: [
      e('2026-09-20', 'Watchlist at 81%; homes ranked by TIV × damage ratio.', 'Pyrome agent'),
      e('2026-09-23', 'Travis County fire marshal briefed; greenbelt thinning scoped at 120 ac.', 'Pyrome agent'),
      e('2026-09-26', 'Austin Energy agrees to de-energise the RM 620 spur for the red-flag window.', 'Austin Energy'),
      e('2026-09-28', 'County agrees $300k for thinning and route clearance.', 'Travis County'),
      e('2026-09-29', 'Carrier signs off $600k for the 96 lake-side homes; work orders issued.', 'Demo Carrier'),
    ],
    documents: ['Ranked homes list (96).xlsx', 'Travis County work order.pdf', 'Austin Energy PSPS confirmation.pdf'],
  },
  'BA-03': {
    short: 'Bastrop', counterpartyShort: 'TFS and the Bastrop landowners', engagedOn: '2026-09-22', next: 'Thinning of the three blocks from 1 Oct; the burn waits for the 3–5 Nov humidity window.',
    agent: 2, stage: 'Work agreed', counterparty: 'Texas A&M Forest Service and Bastrop landowners', counterpartyType: 'State agency', decisionDue: '2026-10-01',
    entries: [
      e('2026-09-18', 'Watchlist at 78%; three ignition blocks mapped in the loblolly.', 'Pyrome agent'),
      e('2026-09-22', 'TFS Bastrop office agrees to lead thinning; NRCS EQIP match requested.', 'Texas A&M Forest Service'),
      e('2026-09-26', 'Two landowners agree the EQIP match; one asks for a burn-day guarantee.', 'Bastrop County landowners'),
      e('2026-09-29', 'Dated at 90%; burn scheduled for the 3–5 Nov humidity window, thinning from 1 Oct.', 'Pyrome agent'),
    ],
    documents: ['TFS thinning prescription.pdf', 'EQIP cost-share letters.pdf'],
  },
  'CT-04': {
    short: 'Carbon', counterpartyShort: 'Oncor and Eastland County', engagedOn: '2026-09-27', next: 'Oncor answer on de-energising the feeder for the red-flag day, due 2 Oct.',
    agent: 3, stage: 'Government in negotiation', counterparty: 'Oncor and Eastland County', counterpartyType: 'Utility', decisionDue: '2026-10-02',
    entries: [
      e('2026-09-25', 'Watchlist at 83%; feeder segments ranked by conductor age.', 'Pyrome agent'),
      e('2026-09-27', 'Oncor restates PSPS as "last resort"; agrees to review the red-flag forecast.', 'Oncor'),
      e('2026-09-28', 'County declined — budget for dozer standby; asked the state to cover.', 'Eastland County', true),
      e('2026-09-29', 'County reverses after TFS cost-share offer; blade line agreed, dozer pending.', 'Eastland County'),
    ],
    documents: ['Oncor PSPS criteria.pdf', 'Eastland County letter.pdf'],
  },
  'HC-05': {
    short: 'Fredericksburg', counterpartyShort: 'the landowner and TFS', engagedOn: '2026-09-15', next: 'TFS burns the block in the next humidity window; sensors watch the break.',
    agent: 1, stage: 'Work complete', counterparty: 'Landowner and Texas A&M Forest Service', counterpartyType: 'Landowner', decisionDue: '2026-09-26',
    entries: [
      e('2026-09-10', 'Watchlist at 80%; north-boundary break scoped with the landowner.', 'Pyrome agent'),
      e('2026-09-15', 'Landowner agrees to graze and cut the 40 m break.', 'Landowner'),
      e('2026-09-24', 'Break complete; TFS burn plan approved for the humidity window.', 'Texas A&M Forest Service'),
    ],
    documents: ['Break completion photos.pdf', 'TFS burn plan.pdf'],
  },
  'PK-06': {
    short: 'Possum Kingdom', counterpartyShort: 'Palo Pinto County and the PK HOAs', engagedOn: '2026-09-25', next: 'Engines staged on the three peninsulas; the declining HOA gets pre-warning only.',
    agent: 2, stage: 'Partial', counterparty: 'Palo Pinto County and PK HOAs', counterpartyType: 'County', decisionDue: '2026-10-05',
    entries: [
      e('2026-09-21', 'Watchlist at 82%; three peninsulas ranked by TIV × damage ratio.', 'Pyrome agent'),
      e('2026-09-25', 'County agrees the 12 km break and engine staging.', 'Palo Pinto County'),
      e('2026-09-27', 'Two HOAs agree common-area clearance; one declined — cost.', 'Possum Kingdom HOAs', true),
      e('2026-09-29', 'Dated at 90% then re-scored to 85%. Interior slopes cannot be cut; plan stays partial.', 'Pyrome agent'),
    ],
    documents: ['Peninsula break map.pdf', 'HOA agreements (2 of 3).pdf'],
  },
  'RP-07': {
    short: 'Matador–Waggoner', counterpartyShort: 'Texas A&M Forest Service', engagedOn: '2026-09-26', next: 'TFS engines pre-positioned at Matador from 11 Oct; cattle moved off the quadrant.',
    agent: 3, stage: 'State plan', counterparty: 'Texas A&M Forest Service', counterpartyType: 'State agency', decisionDue: '2026-10-08',
    entries: [
      e('2026-09-23', 'Watchlist at 86%; quadrant too large for pre-treatment in the window.', 'Pyrome agent'),
      e('2026-09-26', 'TFS accepts a state agency plan: engines pre-positioned at Matador.', 'Texas A&M Forest Service'),
      e('2026-09-28', 'Matador agrees to move cattle off the quadrant and open fence lines.', 'Matador Ranch'),
    ],
    documents: ['TFS pre-positioning order.pdf', 'Matador livestock plan.pdf'],
  },
  'PB-08': {
    short: 'Colorado City', counterpartyShort: 'Plains All American and Oncor', engagedOn: '2026-09-29', next: 'Operator to confirm the ROW mowing crews and pad clearing, due 6 Oct.',
    agent: 0, stage: 'Agent engaged', counterparty: 'Plains All American and Oncor', counterpartyType: 'Operator', decisionDue: '2026-10-06',
    entries: [
      e('2026-09-26', 'Watchlist at 85%; ROW segments and 40 pads ranked.', 'Pyrome agent'),
      e('2026-09-29', 'Dated at 90%; agent engaged the pipeline operator and the pad feeder utility.', 'Pyrome agent'),
    ],
    documents: ['ROW mowing scope.pdf'],
  },
  'OK-09': {
    short: 'Osage', counterpartyShort: 'the Tallgrass Prairie Preserve', engagedOn: null, engagedText: 'no engagement needed: last season’s patch burns cap the spread', next: 'Monitoring only; the plan was withdrawn.',
    agent: 1, stage: 'Identified', counterparty: 'Tallgrass Prairie Preserve', counterpartyType: 'Landowner', decisionDue: '2026-10-10',
    entries: [
      e('2026-09-27', 'Watchlist at 88%; last season’s patch burns mapped across the path.', 'Pyrome agent'),
      e('2026-09-29', 'Dated at 90%. Patch mosaic caps the spread; plan withdrawn, monitoring only.', 'Pyrome agent'),
    ],
    documents: ['Patch-burn map 2025.pdf'],
  },
  'OK-10': {
    short: 'Stillwater', counterpartyShort: 'OG&E and the City of Stillwater', engagedOn: '2026-09-28', next: 'PSPS on the OG&E feeder for the wind event; evacuation pre-notice goes out 5 Oct.',
    agent: 2, stage: 'State plan', counterparty: 'OG&E and City of Stillwater', counterpartyType: 'Utility', decisionDue: '2026-10-02',
    entries: [
      e('2026-09-26', 'Watchlist at 87%; three downed-line ignition points identified on the feeder.', 'Pyrome agent'),
      e('2026-09-28', 'OG&E agrees PSPS for the wind event; restoration crews staged.', 'OG&E'),
      e('2026-09-29', 'Dated at 90%, 9 days out. Fuel work cannot finish in time; city issues evacuation pre-notice plan.', 'City of Stillwater'),
    ],
    documents: ['OG&E PSPS notice.pdf', 'Stillwater evacuation zones.pdf'],
  },
}

// Four from last month (September 2026), already closed or in delivery.
export const LAST_MONTH = [
  { id: 'NG-SEP-01', probability: 0.9, leadDays: 23, counterpartyShort: 'TFS', engagedOn: '2026-08-20', payers: ['state'], next: null, fire: { id: 'SEP-01', name: 'Willow City', place: 'Gillespie County, TX', date: '2026-09-12' }, agent: 3, stage: 'Fire prevented', counterparty: 'Texas A&M Forest Service', counterpartyType: 'State agency', decisionDue: '2026-08-30', cost: 96000, saving: 5.8e6, entries: [e('2026-08-20', 'Dated at 90%, 23 days out.', 'Pyrome agent'), e('2026-08-27', 'TFS burned the block in the humidity window.', 'Texas A&M Forest Service'), e('2026-09-12', 'Window closed with no ignition in the treated block.', 'Pyrome agent')], documents: ['Burn completion report.pdf'] },
  { id: 'NG-SEP-02', probability: 0.91, leadDays: 21, counterpartyShort: 'Xcel', engagedOn: '2026-08-28', payers: ['utility'], next: null, fire: { id: 'SEP-02', name: 'White Deer', place: 'Carson County, TX', date: '2026-09-18' }, agent: 0, stage: 'Work complete', counterparty: 'Xcel Energy (SPS)', counterpartyType: 'Utility', decisionDue: '2026-09-02', cost: 410000, saving: 12.4e6, entries: [e('2026-08-28', 'Dated at 91%, 21 days out.', 'Pyrome agent'), e('2026-09-04', 'Xcel replaced 38 poles and mowed 22 km of ROW.', 'Xcel Energy (SPS)'), e('2026-09-18', 'Red-flag day passed without an ignition on the treated span.', 'Pyrome agent')], documents: ['Xcel work completion.pdf'] },
  { id: 'NG-SEP-03', probability: 0.9, leadDays: 21, counterpartyShort: 'Clay County', engagedOn: '2026-08-31', payers: [], next: null, fire: { id: 'SEP-03', name: 'Lake Arrowhead', place: 'Clay County, TX', date: '2026-09-21' }, agent: 2, stage: 'Identified', counterparty: 'Clay County', counterpartyType: 'County', decisionDue: '2026-09-08', cost: 0, saving: 0, declinedOutcome: 'Burned on the predicted date: 2,300 ac, 4 homes, $1.9M insured loss.', entries: [e('2026-08-31', 'Dated at 90%, 21 days out.', 'Pyrome agent'), e('2026-09-08', 'County declined — budget; landowner declined — timing.', 'Clay County', true), e('2026-09-21', 'Burned on the predicted date.', 'Pyrome agent')], documents: ['Decline letter.pdf'] },
  { id: 'NG-SEP-04', probability: 0.9, leadDays: 20, counterpartyShort: 'Oklahoma Forestry Services', engagedOn: '2026-09-05', payers: ['state', 'utility'], next: null, fire: { id: 'SEP-04', name: 'Cooper Creek', place: 'Logan County, OK', date: '2026-09-25' }, agent: 1, stage: 'State plan', counterparty: 'Oklahoma Forestry Services', counterpartyType: 'State agency', decisionDue: '2026-09-15', cost: 140000, saving: 2.2e6, entries: [e('2026-09-05', 'Dated at 90%, 20 days out.', 'Pyrome agent'), e('2026-09-12', 'OFS pre-positioned engines; OG&E held a PSPS on the day.', 'Oklahoma Forestry Services'), e('2026-09-25', 'Fire held at 180 ac; no homes lost.', 'Pyrome agent')], documents: ['OFS after-action note.pdf'] },
]
