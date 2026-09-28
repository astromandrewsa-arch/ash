import { useContext } from 'react'
import { SpreadContext } from './SpreadContext.js'

export default function useSpread() {
  const ctx = useContext(SpreadContext)
  if (!ctx) throw new Error('useSpread must be used inside <SpreadProvider>')
  return ctx
}
