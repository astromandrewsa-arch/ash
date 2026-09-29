import { useEffect, useState } from 'react'
import { DATA_FILES, loadData, store } from './lib/store.js'
import AppProvider from './state/AppProvider.jsx'
import SpreadProvider from './state/SpreadProvider.jsx'
import Shell from './components/shell/Shell.jsx'
import BootScreen from './components/shell/BootScreen.jsx'

export default function App() {
  const [ready, setReady] = useState(store.ready)
  const [loaded, setLoaded] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ready) return undefined
    let live = true
    loadData((n) => live && setLoaded(n))
      .then(() => live && setReady(true))
      .catch((err) => live && setError(err.message))
    return () => {
      live = false
    }
  }, [ready])

  if (!ready) return <BootScreen progress={loaded / DATA_FILES} error={error} />
  return (
    <AppProvider>
      <SpreadProvider>
        <Shell />
      </SpreadProvider>
    </AppProvider>
  )
}
