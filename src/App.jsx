import AppProvider from './state/AppProvider.jsx'
import SpreadProvider from './state/SpreadProvider.jsx'
import Shell from './components/shell/Shell.jsx'

export default function App() {
  return (
    <AppProvider>
      <SpreadProvider>
        <Shell />
      </SpreadProvider>
    </AppProvider>
  )
}
