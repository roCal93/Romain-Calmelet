import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './backgroundContact.module.scss'

// Fonction de debounce
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

const BackgroundContact = () => {
  // Détection des capacités de l'appareil
  const devicePixelRatio = window.devicePixelRatio || 1
  const isHighDensity = devicePixelRatio > 1.5

  // Paramètres adaptatifs
  const WAVE_COUNT = isHighDensity ? 3 : 5
  const WAVE_AMPLITUDE = 80
  const WAVE_FREQUENCY = 0.02
  const WAVE_SPEED = 0.005
  const MOUSE_INFLUENCE = 50
  const MOUSE_DISTANCE_EFFECT = 150
  const MOUSE_DISTANCE_EFFECT_SQUARED = MOUSE_DISTANCE_EFFECT ** 2
  const WAVE_STEP = isHighDensity ? 16 : 8

  // Vérifier la préférence pour les animations réduites
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  // États
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

  // Refs
  const animationRef = useRef()
  const mousePosRef = useRef(mousePos)
  const mouseTimeoutRef = useRef()
  const frameCountRef = useRef(0)

  // Gestion du redimensionnement de la fenêtre
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

  // Initialisation des vagues
  useEffect(() => {
    const initialWaves = Array.from({ length: WAVE_COUNT }, (_, i) => ({
      id: i,
      phase: (i * Math.PI * 2) / WAVE_COUNT,
      amplitude: WAVE_AMPLITUDE * (0.5 + Math.random() * 0.5),
      frequency: WAVE_FREQUENCY * (0.8 + Math.random() * 0.4),
      speed: WAVE_SPEED * (0.5 + Math.random() * 1.5),
      hue: 0,
      opacity: 0.15 + Math.random() * 0.25,
      offset: Math.random() * 100,
    }))
    setWaves(initialWaves)
  }, [WAVE_COUNT])

  // Gestion du mouvement de la souris
  const handleMouseMove = useCallback((e) => {
    const newPos = { x: e.clientX, y: e.clientY }
    mousePosRef.current = newPos
    setMousePos(newPos)
    setIsMouseMoving(true)

    clearTimeout(mouseTimeoutRef.current)
    mouseTimeoutRef.current = setTimeout(() => {
      setIsMouseMoving(false)
    }, 150)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(mouseTimeoutRef.current)
    }
  }, [handleMouseMove])

  // Animation principale optimisée
  useEffect(() => {
    if (prefersReducedMotion) return

    const frameSkip = isHighDensity ? 2 : 1

    const animate = () => {
      frameCountRef.current++

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
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [prefersReducedMotion, isHighDensity])

  // Génération optimisée des points de vague
  const generateWavePoints = useCallback(
    (wave) => {
      const points = []
      const { width, height } = windowSize
      const centerY = height / 2.5

      for (let x = 0; x <= width; x += WAVE_STEP) {
        const baseY =
          centerY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude

        let mouseEffect = 0

        if (isMouseMoving) {
          const dx = x - mousePosRef.current.x
          const dy = baseY - mousePosRef.current.y
          const distanceSquared = dx * dx + dy * dy

          if (distanceSquared < MOUSE_DISTANCE_EFFECT_SQUARED) {
            const distance = Math.sqrt(distanceSquared)
            const influence = 1 - distance / MOUSE_DISTANCE_EFFECT
            mouseEffect = Math.sin(influence * Math.PI) * MOUSE_INFLUENCE * 1.5
          }
        }

        const finalY = baseY + mouseEffect + wave.offset
        points.push(`${x},${finalY}`)
      }

      points.push(`${width},${height}`)
      points.push(`0,${height}`)

      return `M ${points.join(' L ')} Z`
    },
    [
      windowSize,
      isMouseMoving,
      MOUSE_INFLUENCE,
      MOUSE_DISTANCE_EFFECT_SQUARED,
      WAVE_STEP,
    ]
  )

  // Si l'utilisateur préfère des animations réduites
  if (prefersReducedMotion) {
    return (
      <div className={styles.container} aria-hidden="true">
        <div className={styles.staticBackground} />
      </div>
    )
  }

  // Version SVG optimisée
  return (
    <div className={styles.container} aria-hidden="true">
      <svg className={styles.waveSvg}>
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
              <stop offset="0%" stopColor="#e74c3c" stopOpacity="0" />
              <stop
                offset="50%"
                stopColor="#e74c3c"
                stopOpacity={wave.opacity}
              />
              <stop offset="100%" stopColor="#e74c3c" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {waves.map((wave) => (
          <path
            key={`wave-${wave.id}`}
            d={generateWavePoints(wave)}
            fill={`url(#gradient-${wave.id})`}
            className={styles.wavePath}
            style={{
              filter: `blur(${1 + wave.id * 0.5}px)`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default BackgroundContact
