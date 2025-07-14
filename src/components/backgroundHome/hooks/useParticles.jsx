import { useRef, useCallback } from 'react'
import { createParticles } from '../utils/particle'

/**
 * Custom hook to manage the particle system
 * Optimizes performance by avoiding unnecessary re-creations
 *
 * @param {Object} config - Particle configuration
 * @returns {Object} - Particle management interface
 */
export const useParticles = (config) => {
  // Persistent storage of the particle array
  const particlesRef = useRef([])

  // Flag to avoid multiple reinitializations
  const initializedRef = useRef(false)

  /**
   * Initializes particles if not already done
   * Memoized with useCallback to avoid re-renders
   *
   * @param {HTMLCanvasElement} canvas - Canvas element for dimensions
   */
  const initParticles = useCallback(
    (canvas) => {
      // Check to avoid multiple reinitializations
      if (!initializedRef.current) {
        // Create particle array based on canvas dimensions
        particlesRef.current = createParticles(canvas, config)

        // Mark as initialized
        initializedRef.current = true
      }
    },
    [config] // Reinitialize if config changes
  )

  /**
   * Resets the particle system
   * Useful for forcing a complete reinitialization
   */
  const resetParticles = useCallback(() => {
    particlesRef.current = []
    initializedRef.current = false
  }, [])

  return {
    particles: particlesRef.current, // Current particle array
    initParticles, // Initialization function
    resetParticles, // Reset function
  }
}
