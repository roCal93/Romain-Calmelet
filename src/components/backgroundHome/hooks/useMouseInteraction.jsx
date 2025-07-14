import { useEffect, useRef } from 'react'

/**
 * Custom hook to track mouse position in an optimized way
 * Uses requestAnimationFrame to throttle updates
 *
 * @param {boolean} enabled - Enable/disable mouse tracking
 * @returns {Object} - Current mouse position {x, y}
 */
export const useMousePosition = (enabled = true) => {
  // Persistent storage of mouse position
  const mouseRef = useRef({ x: 0, y: 0 })

  // Reference for RAF throttling
  const rafRef = useRef(null)

  useEffect(() => {
    // If disabled, don't listen to events
    if (!enabled) return

    /**
     * Mousemove event handler with throttling
     * Uses requestAnimationFrame to limit updates
     * and improve performance
     */
    const handleMouseMove = (e) => {
      // If a frame is already pending, ignore this update
      if (rafRef.current) return

      // Schedule update for next frame
      rafRef.current = requestAnimationFrame(() => {
        // Update position with client coordinates
        mouseRef.current.x = e.clientX
        mouseRef.current.y = e.clientY

        // Reset RAF reference
        rafRef.current = null
      })
    }

    // Listen to mouse movements on entire window
    window.addEventListener('mousemove', handleMouseMove)

    // Cleanup on unmount or when enabled changes
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)

      // Cancel pending frame if it exists
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled])

  // Return current position object (not the ref)
  return mouseRef.current
}
