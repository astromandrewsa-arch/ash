import AppProvider from './state/AppProvider.jsx'
import Shell from './components/Shell.jsx'

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
