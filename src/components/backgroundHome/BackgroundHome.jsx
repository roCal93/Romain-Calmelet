import { useCallback, useEffect } from 'react'
import { useCanvas } from './hooks/useCanvas'
import { useMousePosition } from './hooks/useMouseInteraction'
import { useParticles } from './hooks/useParticles'
import { drawShape, drawConnections } from './utils/shapes'
import { getCachedColor } from './utils/colors'
import { DEFAULT_CONFIG } from './constants/config'
import styles from './styles/backgroundHome.module.scss'

const GeometricBackgroundHome = ({
  config = DEFAULT_CONFIG,
  enableConnections = true,
  enableMouseInteraction = true,
}) => {
  const { particles, initParticles } = useParticles(config)
  const mouse = useMousePosition(enableMouseInteraction)

  const draw = useCallback(
    (ctx, canvas) => {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0.2, getCachedColor('--bg-gradient-start'))
      gradient.addColorStop(1, getCachedColor('--bg-gradient-end'))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update et draw particles
      particles.forEach((particle) => {
        if (enableMouseInteraction) {
          particle.update(canvas, mouse, config)
        } else {
          particle.update(canvas, { x: 0, y: 0 }, config)
        }

        const colors = {
          fillCenter: getCachedColor(
            '--particle-fill-center',
            particle.opacity
          ),
          fillEdge: getCachedColor(
            '--particle-fill-edge',
            particle.opacity * 0.7
          ),
          stroke: getCachedColor('--particle-stroke', particle.opacity),
        }

        drawShape(ctx, particle, colors)
      })

      // Connections
      if (enableConnections) {
        drawConnections(ctx, particles, config, (opacity) =>
          getCachedColor('--particle-connections', opacity)
        )
      }
    },
    [config, enableConnections, enableMouseInteraction, mouse, particles]
  )

  const canvasRef = useCanvas(draw)

  // Initialiser les particules quand le canvas est prêt
  useEffect(() => {
    if (canvasRef.current) {
      initParticles(canvasRef.current)
    }
  }, [initParticles, canvasRef])

  // Réinitialiser les particules lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Petit délai pour s'assurer que le canvas a été redimensionné
        setTimeout(() => {
          initParticles(canvasRef.current)
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initParticles, canvasRef])

  return <canvas ref={canvasRef} className={styles.canvas} />
}

export default GeometricBackgroundHome
