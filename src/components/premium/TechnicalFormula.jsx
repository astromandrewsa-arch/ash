/** P = (FE + E[L] × (1 + ALAE%)) / (1 − VE% − RoP%), set as a fraction in plain HTML. */
export default function TechnicalFormula() {
  return (
    <div className="formula" role="math" aria-label="P equals FE plus E of L times one plus ALAE percent, divided by one minus VE percent minus RoP percent">
      <var>P</var>
      <span className="f-op">=</span>
      <span className="f-frac">
        <span className="f-num">
          <var>FE</var> + <var>E[L]</var> × (1 + <var>ALAE%</var>)
        </span>
        <span className="f-den">
          1 − <var>VE%</var> − <var>RoP%</var>
        </span>
      </span>
    </div>
  )
}
