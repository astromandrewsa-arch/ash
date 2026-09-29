import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './styles/tokens.css'
import './styles/legacy/tokens.css'
import './styles/legacy/app.css'
import './styles/legacy/map.css'
import './styles/legacy/panels.css'
import './styles/legacy/drawer.css'
import './styles/legacy/pages.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/map.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
