import { useEffect, useRef, useState } from 'react'
import styles from './BackgroundPortfolio.module.scss'

function BackgroundPortfolio() {
  // State to track the actual mouse position
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  // State to track the smoothed mouse position for fluid animations
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  // Reference to store the animation frame ID for cleanup
  const animationFrameId = useRef()

  // Effect to track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    // Add mouse move event listener
    window.addEventListener('mousemove', handleMouseMove)
    // Cleanup: remove event listener on component unmount
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Smoothing effect for smoother movement
  useEffect(() => {
    const smoothing = 0.1 // Smoothing factor (0-1) - lower values = smoother but slower movement

    const updatePosition = () => {
      // Gradually move smooth position towards actual mouse position
      setSmoothPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * smoothing,
        y: prev.y + (mousePosition.y - prev.y) * smoothing,
      }))
      // Continue animation loop
      animationFrameId.current = requestAnimationFrame(updatePosition)
    }

    // Start animation loop
    animationFrameId.current = requestAnimationFrame(updatePosition)

    // Cleanup: cancel animation frame on cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [mousePosition])

  // Normalize mouse position to range [-1, 1] for parallax calculations
  const normalizedX = (smoothPosition.x / window.innerWidth - 0.5) * 2
  const normalizedY = (smoothPosition.y / window.innerHeight - 0.5) * 2

  return (
    <div className={styles.backgroundContainer}>
      {/* Light effect that follows the mouse cursor */}
      <div
        className={styles.mouseGlow}
        style={{
          left: `${smoothPosition.x}px`,
          top: `${smoothPosition.y}px`,
          transform: 'translate(-50%, -50%)', // Center the glow on cursor
        }}
      />

      {/* Container for morphing background shapes */}
      <div className={styles.morphWrapper}>
        {/* Three morphing shapes with different parallax movements */}
        <div
          className={styles.morph1}
          style={{
            // Positive coefficients - moves in same direction as mouse
            transform: `translate(${normalizedX * 40}px, ${
              normalizedY * 40
            }px)`,
          }}
        />
        <div
          className={styles.morph2}
          style={{
            // Negative coefficients - moves opposite to mouse direction
            transform: `translate(${normalizedX * -30}px, ${
              normalizedY * -30
            }px)`,
          }}
        />
        <div
          className={styles.morph3}
          style={{
            // Mixed coefficients - creates diagonal movement
            transform: `translate(${normalizedX * 35}px, ${
              normalizedY * -35
            }px)`,
          }}
        />
      </div>

      {/* Floating dots with parallax effect */}
      <div className={styles.dotsContainer}>
        {/* Generate 12 dots dynamically */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${styles[`dot${i + 1}`]}`}
            style={{
              // Each dot has increasing parallax effect based on its index
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
