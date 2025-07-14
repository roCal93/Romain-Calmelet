import { useEffect, useRef } from 'react'

/**
 * Custom hook to manage an HTML5 canvas with animation loop
 *
 * @param {Function} draw - Render function called on each frame
 * @param {Object} options - Configuration options
 * @param {number} options.fps - Frames per second (default: 60)
 * @returns {React.RefObject} - Reference to the canvas
 */
export const useCanvas = (draw, options = {}) => {
  const canvasRef = useRef(null)
  const { fps = 60 } = options

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 2D context with alpha disabled for better performance
    const context = canvas.getContext('2d', { alpha: false })

    // Variables for FPS management
    let animationId
    let lastTime = 0
    const fpsInterval = 1000 / fps // Interval in milliseconds

    /**
     * Resizes the canvas to match the window
     * Maintains native resolution to avoid blur
     */
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initialize dimensions
    resizeCanvas()

    /**
     * Main animation loop
     * Controls FPS and calls the render function
     */
    const render = (currentTime) => {
      // Schedule next frame
      animationId = requestAnimationFrame(render)

      // Calculate time elapsed since last frame
      const deltaTime = currentTime - lastTime

      // Render only if FPS interval is respected
      if (deltaTime > fpsInterval) {
        // Adjust time to maintain constant FPS
        lastTime = currentTime - (deltaTime % fpsInterval)

        // Call user render function
        draw(context, canvas)
      }
    }

    // Start animation loop
    render(0)

    // Listen for window resize
    window.addEventListener('resize', resizeCanvas)

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [draw, fps])

  return canvasRef
}
