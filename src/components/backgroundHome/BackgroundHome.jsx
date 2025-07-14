import { useCallback, useEffect } from 'react'
import { useCanvas } from './hooks/useCanvas'
import { useMousePosition } from './hooks/useMouseInteraction'
import { useParticles } from './hooks/useParticles'
import { drawShape, drawConnections } from './utils/shapes'
import { getCachedColor } from './utils/colors'
import { DEFAULT_CONFIG } from './constants/config'
import styles from './styles/backgroundHome.module.scss'

/**
 * Background component with animated geometric particles
 * Manages display and interactions with a particle system
 */
const GeometricBackgroundHome = ({
  config = DEFAULT_CONFIG,
  enableConnections = true,
  enableMouseInteraction = true,
}) => {
  // Hook to manage particles (creation, update)
  const { particles, initParticles } = useParticles(config)

  // Hook to track mouse position with throttling
  const mouse = useMousePosition(enableMouseInteraction)

  /**
   * Main canvas render function
   * Memoized with useCallback to avoid unnecessary re-renders
   */
  const draw = useCallback(
    (ctx, canvas) => {
      // === BACKGROUND RENDERING ===
      // Create vertical gradient for background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0.2, getCachedColor('--bg-gradient-start'))
      gradient.addColorStop(1, getCachedColor('--bg-gradient-end'))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // === PARTICLE RENDERING ===
      particles.forEach((particle) => {
        // Update particle position and properties
        if (enableMouseInteraction) {
          // With mouse interaction enabled
          particle.update(canvas, mouse, config)
        } else {
          // Without mouse interaction (neutral position)
          particle.update(canvas, { x: 0, y: 0 }, config)
        }

        // Prepare colors with dynamic opacity
        const colors = {
          fillCenter: getCachedColor(
            '--particle-fill-center',
            particle.opacity
          ),
          fillEdge: getCachedColor(
            '--particle-fill-edge',
            particle.opacity * 0.7 // Edge slightly more transparent
          ),
          stroke: getCachedColor('--particle-stroke', particle.opacity),
        }

        // Render geometric shape
        drawShape(ctx, particle, colors)
      })

      // === CONNECTION RENDERING ===
      // Draw lines between nearby particles
      if (enableConnections) {
        drawConnections(ctx, particles, config, (opacity) =>
          getCachedColor('--particle-connections', opacity)
        )
      }
    },
    [config, enableConnections, enableMouseInteraction, mouse, particles]
  )

  // Hook to manage canvas and animation loop
  const canvasRef = useCanvas(draw)

  // === PARTICLE INITIALIZATION ===
  // Initialize particles when canvas is ready
  useEffect(() => {
    if (canvasRef.current) {
      initParticles(canvasRef.current)
    }
  }, [initParticles, canvasRef])

  // === RESIZE HANDLING ===
  // Reinitialize particles on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Delay to ensure canvas has been resized
        setTimeout(() => {
          initParticles(canvasRef.current)
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initParticles, canvasRef])

  // Canvas positioned in background with negative z-index
  return <canvas ref={canvasRef} className={styles.canvas} />
}

export default GeometricBackgroundHome
