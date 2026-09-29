const TONE = { Yes: 'pill-green', Targeted: 'pill-orange', Partly: 'pill-amber', 'Cannot be mitigated': 'pill-red', 'No action': '' }

/** The plan's verdict (§11). */
export default function VerdictPill({ verdict }) {
  return <span className={`pill ${TONE[verdict] ?? ''}`}>{verdict}</span>
}
