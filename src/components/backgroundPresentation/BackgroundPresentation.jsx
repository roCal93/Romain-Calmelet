import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './backgroundPresentation.module.scss'

const MouseReactiveBackground = () => {
  // Paramètres facilement modifiables
  const MIN_PARTICLE_SIZE = 1
  const MAX_PARTICLE_SIZE = 8
  const PARTICLE_HUE_BASE = 30 // violet
  const PARTICLE_HUE_RANGE = 40 // jusqu'à ~320 (rose)

  const [mousePos, setMousePos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
  const [particles, setParticles] = useState([])

  const containerRef = useRef(null)
  const mousePosRef = useRef(mousePos)
  const previousMousePosRef = useRef(mousePos)
  const animationRef = useRef()

  useEffect(() => {
    const screenArea = window.innerWidth * window.innerHeight
    const baseParticles = 150
    const particleCount = Math.min(
      200,
      Math.floor(baseParticles * (screenArea / 1920000))
    )

    const initialParticles = Array.from({ length: particleCount }, (_, i) => {
      const size =
        Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE) +
        MIN_PARTICLE_SIZE
      const direction = Math.random() * Math.PI * 2
      const baseSpeed = Math.random() * 0.1 + 0.05

      return {
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size,
        baseSize: size,
        opacity: Math.random() * 0.5 + 0.3,
        baseVx: Math.cos(direction) * baseSpeed,
        baseVy: Math.sin(direction) * baseSpeed,
        vx: Math.cos(direction) * baseSpeed,
        vy: Math.sin(direction) * baseSpeed,
        hue: PARTICLE_HUE_BASE + Math.random() * PARTICLE_HUE_RANGE,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        directionChange: (Math.random() * 0.02 + 0.005) / 2,
        currentDirection: direction,
        mass: 1 + size / 20,
        floatAmplitude: Math.random() * 20 + 10,
        floatSpeed: (Math.random() * 0.02 + 0.01) / 2,
        mouseReactivity: 1.5 - size / 40,
        dampening: 0.95,
      }
    })
    setParticles(initialParticles)
  }, [])

  const handleMouseMove = useCallback((e) => {
    previousMousePosRef.current = mousePosRef.current
    const newPos = { x: e.clientX, y: e.clientY }
    mousePosRef.current = newPos
    setMousePos(newPos)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => {
    let time = 0

    const animateParticles = () => {
      const currentMousePos = mousePosRef.current
      const previousMousePos = previousMousePosRef.current
      const mouseVx = currentMousePos.x - previousMousePos.x
      const mouseVy = currentMousePos.y - previousMousePos.y
      const mouseSpeed = Math.sqrt(mouseVx ** 2 + mouseVy ** 2)
      time += 0.016

      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          const dx = currentMousePos.x - p.x
          const dy = currentMousePos.y - p.y
          const distance = Math.sqrt(dx ** 2 + dy ** 2)

          p.currentDirection += (Math.random() - 0.5) * p.directionChange

          const baseWanderVx = Math.cos(p.currentDirection) * 0.5
          const baseWanderVy = Math.sin(p.currentDirection) * 0.5
          const floatX = Math.sin(time * p.floatSpeed) * p.floatAmplitude * 0.01
          const floatY =
            Math.cos(time * p.floatSpeed * 1.3) * p.floatAmplitude * 0.01

          let mouseForceX = 0
          let mouseForceY = 0

          if (distance > 0 && distance < 200) {
            const normDx = dx / distance
            const normDy = dy / distance

            if (distance < 150) {
              const repulsion =
                Math.pow((150 - distance) / 150, 2) * 20 * p.mouseReactivity
              mouseForceX = -normDx * repulsion
              mouseForceY = -normDy * repulsion

              if (mouseSpeed > 2) {
                const blast = mouseSpeed * 0.7 * p.mouseReactivity
                mouseForceX += (mouseVx * blast) / p.mass
                mouseForceY += (mouseVy * blast) / p.mass
              }

              if (distance < 80) {
                mouseForceX += (Math.random() - 0.5) * 2
                mouseForceY += (Math.random() - 0.5) * 2
              }
            } else {
              const attraction =
                ((distance - 150) / 150) * 0.2 * p.mouseReactivity
              mouseForceX = normDx * attraction
              mouseForceY = normDy * attraction
            }
          }

          let newVx = p.vx * p.dampening + baseWanderVx + floatX + mouseForceX
          let newVy = p.vy * p.dampening + baseWanderVy + floatY + mouseForceY
          const speed = Math.sqrt(newVx ** 2 + newVy ** 2)
          const maxSpeed = 0.8
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed
            newVy = (newVy / speed) * maxSpeed
          }

          let newX = p.x + newVx
          let newY = p.y + newVy
          const margin = p.size

          if (p.id % 2 === 0) {
            if (newX < margin || newX > window.innerWidth - margin) {
              p.currentDirection = Math.PI - p.currentDirection
              newVx *= -0.5
              newX = Math.max(
                margin,
                Math.min(window.innerWidth - margin, newX)
              )
            }
            if (newY < margin || newY > window.innerHeight - margin) {
              p.currentDirection = -p.currentDirection
              newVy *= -0.5
              newY = Math.max(
                margin,
                Math.min(window.innerHeight - margin, newY)
              )
            }
          } else {
            if (newX < -margin) newX = window.innerWidth + margin
            if (newX > window.innerWidth + margin) newX = -margin
            if (newY < -margin) newY = window.innerHeight + margin
            if (newY > window.innerHeight + margin) newY = -margin
          }

          const pulse = 1 + Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.2
          const distFactor =
            distance < 200 ? 1 + Math.pow((200 - distance) / 200, 2) * 0.5 : 1
          const currentSize = p.baseSize * pulse * distFactor

          const baseOpacity = 0.6
          const speedBoost = Math.min(1, speed / 5)
          const distOpacity =
            distance < 200
              ? Math.min(1, baseOpacity + ((200 - distance) / 200) * 0.4)
              : baseOpacity
          const newOpacity = Math.max(
            0.3,
            Math.min(1, distOpacity + speedBoost * 0.2)
          )

          return {
            ...p,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            size: currentSize,
            opacity: newOpacity,
            currentDirection: p.currentDirection,
          }
        })
      )

      animationRef.current = requestAnimationFrame(animateParticles)
    }

    animationRef.current = requestAnimationFrame(animateParticles)
    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  return (
    <div ref={containerRef} className={styles.container}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            backgroundColor: `hsl(${p.hue}, 70%, ${50 + p.opacity * 20}%)`,
            boxShadow: `0 0 ${p.size * 2}px hsl(${p.hue}, 70%, ${
              50 + p.opacity * 20
            }%), 0 0 ${p.size * 4}px hsl(${p.hue}, 70%, ${
              50 + p.opacity * 20
            }%)40`,
            filter: p.size > 15 ? 'blur(0.5px)' : 'none',
          }}
        />
      ))}

      <div
        className={styles.mouseFollower}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />
      <div
        className={styles.influenceZone}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />
      <div
        className={styles.cursorRing}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />
    </div>
  )
}

export default MouseReactiveBackground
