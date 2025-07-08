import { createContext } from 'react'

export const NavigationContext = createContext({
  direction: 'down',
  containerRef: null,
})
