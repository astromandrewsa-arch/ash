// Map behaviour (CLAUDE.md §2 rendering rule, §9). Business figures live in src/data; these only set
// how and when the map draws things.
export const MAP = {
  imageryUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  imageryAttribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
  labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  minZoom: 5,
  maxZoom: 18,
  maxNativeZoom: 18,
  zoomSnap: 0.25, // fly-to fits a fire or area to the free map area in quarter steps
  labelsMinZoom: 9, // dark labels "toggled on above zoom 8"
  labelsOpacity: 0.72,
  labelsOpacityFireOpen: 0.42, // county lines step back behind an open fire's perimeter
  dotsMinZoom: 9, // below this, one cluster dot per area
  footprintMinZoom: 14,
  poleMinZoom: 12,
  turbineMinZoom: 11,
  areaLabelMinZoom: 11,
  ranchLabelMinZoom: 8,
  viewportPad: 0.2, // homes drawn inside the viewport padded by 20%
  clusterMergePx: 30, // cluster dots closer than this on screen merge into one
  // Single-area towns the imagery's reference labels already name at zoom 11+; our yellow area name
  // would print the same word a few pixels away, so it is left to the basemap.
  basemapTowns: ['Bee Cave', 'Jonestown', 'Lago Vista', 'Spicewood', 'Dripping Springs', 'Wimberley', 'Smithville', 'Stinnett', 'Eastland', 'Cisco', 'Carbon', 'Mannford', 'Woodward'],
}
