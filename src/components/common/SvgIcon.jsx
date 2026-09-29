/** Renders one of the inline SVG glyph strings from lib/icons.js. */
export default function SvgIcon({ html, className = '' }) {
  return <span className={`svg-icon ${className}`.trim()} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
}
