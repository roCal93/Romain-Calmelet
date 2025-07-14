import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './backgroundContact.module.scss'
import variables from '../../styles/variables.module.scss'

/**
 * Debounce utility function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * BackgroundContact Component
 *
 * Renders an animated wave background that responds to mouse movement.
 **/
const BackgroundContact = () => {
  // Device capability detection
  const devicePixelRatio = window.devicePixelRatio || 1
  const isHighDensity = devicePixelRatio > 1.5

  // Get wave color from SCSS variables
  const waveColor = variables.waveColor || '#e74c3c'

  // Performance-optimized parameters
  const WAVE_COUNT = isHighDensity ? 2 : 3 // Fewer waves on high-density displays
  const MAX_OPTIMIZED_WAVES = 2 // Limit will-change to first 2 waves
  const WAVE_AMPLITUDE = 80
  const WAVE_FREQUENCY = 0.02
  const WAVE_SPEED = 0.005
  const MOUSE_INFLUENCE = 50
  const MOUSE_DISTANCE_EFFECT = 150
  const MOUSE_DISTANCE_EFFECT_SQUARED = MOUSE_DISTANCE_EFFECT ** 2
  const WAVE_STEP = isHighDensity ? 16 : 8 // Larger steps for performance on retina

  // Check user's motion preference
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  // State management
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [mousePos, setMousePos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
  const [waves, setWaves] = useState([])
  const [isMouseMoving, setIsMouseMoving] = useState(false)

  // Performance optimization refs
  const animationRef = useRef()
  const mousePosRef = useRef(mousePos)
  const mouseTimeoutRef = useRef()
  const frameCountRef = useRef(0)
  const waveRefs = useRef([])
  const willChangeTimeoutRef = useRef()

  /**
   * Optimizes will-change property usage to improve performance
   * Only applies will-change to priority waves and removes it after animation
   */
  const optimizeWillChange = useCallback(() => {
    // Apply will-change only to priority waves
    waveRefs.current.forEach((wave, index) => {
      if (wave && index < MAX_OPTIMIZED_WAVES) {
        wave.style.willChange = 'transform, filter'
      }
    })

    // Remove will-change after animation completes
    clearTimeout(willChangeTimeoutRef.current)
    willChangeTimeoutRef.current = setTimeout(() => {
      waveRefs.current.forEach((wave) => {
        if (wave) {
          wave.style.willChange = 'auto'
        }
      })
    }, 1000)
  }, [MAX_OPTIMIZED_WAVES])

  /**
   * Handle window resize with debouncing
   */
  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }, 300)

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /**
   * Initialize wave data with random variations
   */
  useEffect(() => {
    const initialWaves = Array.from({ length: WAVE_COUNT }, (_, i) => ({
      id: i,
      phase: (i * Math.PI * 2) / WAVE_COUNT,
      amplitude: WAVE_AMPLITUDE * (0.5 + Math.random() * 0.5),
      frequency: WAVE_FREQUENCY * (0.8 + Math.random() * 0.4),
      speed: WAVE_SPEED * (0.5 + Math.random() * 1.5),
      opacity: 0.15 + Math.random() * 0.25,
      offset: Math.random() * 100,
      isPriority: i < MAX_OPTIMIZED_WAVES,
    }))
    setWaves(initialWaves)
  }, [
    WAVE_COUNT,
    WAVE_AMPLITUDE,
    WAVE_FREQUENCY,
    WAVE_SPEED,
    MAX_OPTIMIZED_WAVES,
  ])

  /**
   * Handle mouse movement with performance optimizations
   */
  const handleMouseMove = useCallback(
    (e) => {
      const newPos = { x: e.clientX, y: e.clientY }
      mousePosRef.current = newPos
      setMousePos(newPos)
      setIsMouseMoving(true)

      // Optimize will-change during movement
      optimizeWillChange()

      // Reset mouse moving state after inactivity
      clearTimeout(mouseTimeoutRef.current)
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false)
      }, 150)
    },
    [optimizeWillChange]
  )

  /**
   * Set up mouse event listener
   */
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(mouseTimeoutRef.current)
      clearTimeout(willChangeTimeoutRef.current)
    }
  }, [handleMouseMove])

  /**
   * Main animation loop with frame skipping for performance
   */
  useEffect(() => {
    if (prefersReducedMotion) return

    const frameSkip = isHighDensity ? 2 : 1

    const animate = () => {
      frameCountRef.current++

      // Skip frames on high-density displays
      if (frameCountRef.current % frameSkip === 0) {
        setWaves((prev) =>
          prev.map((wave) => ({
            ...wave,
            phase: wave.phase + wave.speed,
          }))
        )
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    // Periodic optimization when mouse is idle
    const optimizationInterval = setInterval(() => {
      if (!isMouseMoving) {
        optimizeWillChange()
      }
    }, 3000)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      clearInterval(optimizationInterval)
    }
  }, [prefersReducedMotion, isHighDensity, isMouseMoving, optimizeWillChange])

  /**
   * Generate SVG path points for wave animation
   * Includes mouse interaction effects
   */
  const generateWavePoints = useCallback(
    (wave) => {
      const points = []
      const { width, height } = windowSize
      const centerY = height / 2.5

      // Generate wave points along x-axis
      for (let x = 0; x <= width; x += WAVE_STEP) {
        // Calculate base wave position
        const baseY =
          centerY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude

        let mouseEffect = 0

        // Apply mouse influence if mouse is moving
        if (isMouseMoving) {
          const dx = x - mousePosRef.current.x
          const dy = baseY - mousePosRef.current.y
          const distanceSquared = dx * dx + dy * dy

          // Calculate mouse effect based on distance
          if (distanceSquared < MOUSE_DISTANCE_EFFECT_SQUARED) {
            const distance = Math.sqrt(distanceSquared)
            const influence = 1 - distance / MOUSE_DISTANCE_EFFECT
            mouseEffect = Math.sin(influence * Math.PI) * MOUSE_INFLUENCE * 1.5
          }
        }

        const finalY = baseY + mouseEffect + wave.offset
        points.push(`${x},${finalY}`)
      }

      // Close the path
      points.push(`${width},${height}`)
      points.push(`0,${height}`)

      return `M ${points.join(' L ')} Z`
    },
    [
      windowSize,
      isMouseMoving,
      MOUSE_INFLUENCE,
      MOUSE_DISTANCE_EFFECT,
      MOUSE_DISTANCE_EFFECT_SQUARED,
      WAVE_STEP,
    ]
  )

  // Render static background for reduced motion preference
  if (prefersReducedMotion) {
    return (
      <div className={styles.container} aria-hidden="true">
        <div className={styles.staticBackground} />
      </div>
    )
  }

  // Main render
  return (
    <div className={styles.container} aria-hidden="true">
      <svg className={styles.waveSvg}>
        {/* Define gradients for each wave */}
        <defs>
          {waves.map((wave) => (
            <linearGradient
              key={`gradient-${wave.id}`}
              id={`gradient-${wave.id}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={waveColor} stopOpacity="0" />
              <stop
                offset="50%"
                stopColor={waveColor}
                stopOpacity={wave.opacity}
              />
              <stop offset="100%" stopColor={waveColor} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Render animated wave paths */}
        {waves.map((wave, index) => (
          <path
            key={`wave-${wave.id}`}
            ref={(el) => (waveRefs.current[index] = el)}
            d={generateWavePoints(wave)}
            fill={`url(#gradient-${wave.id})`}
            className={styles.wavePath}
            style={{
              // Progressive blur for depth effect
              filter: `blur(${1 + wave.id * 0.5}px)`,
              // will-change managed by JavaScript for performance
              willChange: 'auto',
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default BackgroundContact
