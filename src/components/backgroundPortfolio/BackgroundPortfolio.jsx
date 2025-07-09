import { useEffect, useRef, useState } from 'react'
import styles from './BackgroundPortfolio.module.scss'

function BackgroundPortfolio() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const animationFrameId = useRef()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Effet de lissage pour un mouvement plus fluide
  useEffect(() => {
    const smoothing = 0.1 // Facteur de lissage (0-1)

    const updatePosition = () => {
      setSmoothPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * smoothing,
        y: prev.y + (mousePosition.y - prev.y) * smoothing,
      }))
      animationFrameId.current = requestAnimationFrame(updatePosition)
    }

    animationFrameId.current = requestAnimationFrame(updatePosition)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [mousePosition])

  const normalizedX = (smoothPosition.x / window.innerWidth - 0.5) * 2
  const normalizedY = (smoothPosition.y / window.innerHeight - 0.5) * 2

  return (
    <div className={styles.backgroundContainer}>
      {/* Effet de lumière qui suit la souris */}
      <div
        className={styles.mouseGlow}
        style={{
          left: `${smoothPosition.x}px`,
          top: `${smoothPosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className={styles.morphWrapper}>
        <div
          className={styles.morph1}
          style={{
            transform: `translate(${normalizedX * 40}px, ${
              normalizedY * 40
            }px)`,
          }}
        />
        <div
          className={styles.morph2}
          style={{
            transform: `translate(${normalizedX * -30}px, ${
              normalizedY * -30
            }px)`,
          }}
        />
        <div
          className={styles.morph3}
          style={{
            transform: `translate(${normalizedX * 35}px, ${
              normalizedY * -35
            }px)`,
          }}
        />
      </div>

      {/* Points flottants */}
      <div className={styles.dotsContainer}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${styles[`dot${i + 1}`]}`}
            style={{
              transform: `translate(${normalizedX * (10 + i * 3)}px, ${
                normalizedY * (10 + i * 3)
              }px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default BackgroundPortfolio
