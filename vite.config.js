import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from https://astromandrewsa-arch.github.io/ash/ on GitHub Pages.
  base: '/ash/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Split the bundle so no single chunk trips the 500 kB warning and vendors cache separately.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 40 },
            { name: 'map', test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet)[\\/]/, priority: 30 },
            { name: 'charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|@reduxjs|redux|react-redux|immer|reselect|decimal\.js-light|es-toolkit)[\\/]/, priority: 20 },
            { name: 'mock-data', test: /src[\\/]data[\\/]/, priority: 15 },
            { name: 'vendor', test: /node_modules/, priority: 10 },
          ],
        },
      },
    },
  },
})
