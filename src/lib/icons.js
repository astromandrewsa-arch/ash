// Inline SVG glyphs for Leaflet divIcons (CLAUDE.md §3): flame, and one icon per asset kind.
// Strings, not React, because Leaflet markers take HTML.

const svg = (body, { size = 24, stroke = 'currentColor', fill = 'none', sw = 1.8 } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

/** Flame glyph, filled orange with a pale core. */
export function flameSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.2 1.8c.5 3.1 2.6 4.9 4.3 7 1.7 2.1 2.9 4.1 2.9 6.6 0 4.1-3.3 6.9-7.3 6.9s-7.4-2.9-7.4-7c0-2.7 1.4-4.8 3.1-6.4.1 1.8.9 3.1 2.2 3.8-.5-3.8 1-7.4 2.2-10.9Z" fill="#E2561B" stroke="#FFD2B8" stroke-width="0.9"/>
    <path d="M12.4 12.2c1.6 1.6 3 3 3 4.8 0 1.9-1.5 3.2-3.4 3.2S8.6 19 8.6 17.1c0-1.3.7-2.4 1.6-3.2.2 1 .7 1.6 1.4 1.9-.2-1.3.3-2.5.8-3.6Z" fill="#FFE8B0"/>
  </svg>`
}

const BODIES = {
  // A cluster of three roofs.
  homes: '<path d="M3 13.5 8 9l5 4.5"/><path d="M4.5 12.3V20h7v-7.7"/><path d="M13 11.2 17 8l4 3.2"/><path d="M14.3 10.3V20h5.4v-9.7"/><path d="M7 20v-3.2h2V20"/>',
  // Power pole with cross-arm and two conductors.
  line: '<path d="M12 3v18"/><path d="M6 6h12"/><path d="M8 6 5.5 10"/><path d="M16 6l2.5 4"/><path d="M9 21h6"/><circle cx="6" cy="6" r="0.9" fill="currentColor"/><circle cx="18" cy="6" r="0.9" fill="currentColor"/>',
  // Tank cluster with a flare stack.
  refinery: '<ellipse cx="8" cy="15" rx="4.2" ry="1.6"/><path d="M3.8 15v4c0 .9 1.9 1.6 4.2 1.6s4.2-.7 4.2-1.6v-4"/><ellipse cx="15.5" cy="12" rx="3.2" ry="1.3"/><path d="M12.3 12v6.2"/><path d="M18.7 12v8"/><path d="M20 4v8"/><path d="M20 4c-.9.8-1 1.7-.2 2.6"/>',
  tankfarm: '<ellipse cx="7" cy="9" rx="3.5" ry="1.4"/><path d="M3.5 9v8c0 .8 1.6 1.4 3.5 1.4s3.5-.6 3.5-1.4V9"/><ellipse cx="16.5" cy="11" rx="3.5" ry="1.4"/><path d="M13 11v7c0 .8 1.6 1.4 3.5 1.4S20 18.8 20 18v-7"/>',
  // Dashed pipe segment with a valve.
  pipeline: '<path d="M2 12h4" /><path d="M9 12h2"/><path d="M13 12h2"/><path d="M18 12h4"/><path d="M11 8h2v8h-2z" fill="currentColor"/><path d="M12 8V5"/><path d="M10 5h4"/>',
  // Wind turbine.
  wind: '<path d="M12 11v10"/><path d="M10 21h4"/><circle cx="12" cy="9.5" r="1.3"/><path d="M12 8.2 11.2 2.5c1.6.3 2.4 2.3.8 5.7Z" fill="currentColor"/><path d="m13.2 10.1 5.3 2.2c-.9 1.3-3 1.2-5.3-2.2Z" fill="currentColor"/><path d="m10.8 10.1-5.3 2.2c.9 1.3 3 1.2 5.3-2.2Z" fill="currentColor"/>',
  // Fence post with two wires.
  ranch: '<path d="M6 4v17"/><path d="M18 4v17"/><path d="M4.5 4.8 6 3.5l1.5 1.3"/><path d="M16.5 4.8 18 3.5l1.5 1.3"/><path d="M6 9h12"/><path d="M6 14h12"/><path d="M9 9l-.6-.8M12 9l.5-.8M15 14l.5-.8"/>',
  // Transformer yard: box with lightning bolt.
  substation: '<rect x="3.5" y="6" width="17" height="13" rx="1.5"/><path d="M12.8 8.5 9.5 13h3l-1.3 3.8 3.4-4.8h-3Z" fill="currentColor"/><path d="M7 6V3.5M17 6V3.5"/>',
}

export function assetSvg(kind, size = 18) {
  return svg(BODIES[kind] || BODIES.line, { size })
}
