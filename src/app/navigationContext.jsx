import { createContext } from 'react'

// Creates a context for navigation-related state that can be shared across components
// This context appears to be designed for tracking scroll direction and maintaining a reference to a container element
export const NavigationContext = createContext({
  // Default scroll direction - 'down' suggests this tracks whether user is scrolling up or down
  // This could be used for showing/hiding navigation bars or other UI elements based on scroll behavior
  direction: 'down',

  // Reference to a container element, likely used for scroll event listeners or DOM measurements
  // Being null by default means it will be set later when the actual container component mounts
  containerRef: null,
})
