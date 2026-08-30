// frontend/lib/mapConfig.ts

export const MAP_CONFIG = {
  defaultCenter: [78.9629, 20.5937] as [number, number], // India Geographic Center
  defaultZoom: 4.8,
  minZoom: 3.5,
  maxZoom: 14,
  bounds: [
    [65.0, 5.0],  // Southwest coordinates (Lon, Lat)
    [100.0, 38.0], // Northeast coordinates (Lon, Lat)
  ] as [[number, number], [number, number]],
  // Dark basemap styles (Carto Dark Matter free & reliable vector style)
  style: {
    version: 8,
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>'
      }
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 20
      }
    ]
  }
}
