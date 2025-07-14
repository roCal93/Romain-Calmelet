import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './backgroundPresentation.module.scss'

/**
 * MouseReactiveBackground Component
 *
 * Creates an interactive particle system that responds to mouse movements.
 * Particles are repelled by the cursor within a certain radius and create
 * dynamic visual effects including attraction, repulsion, and blast effects.
 *
 * Features:
 * - Dynamic particle count based on screen size
 * - Mouse-reactive particle physics with attraction/repulsion zones
 * - Optimized rendering with conditional will-change
 * - Smooth animations using requestAnimationFrame
 * - Responsive design with mobile considerations
 * - Colors derived from SCSS theme variables
 */
const MouseReactiveBackground = () => {
  // ========== IMPORT SCSS VARIABLES ==========
  /**
   * Import color configuration from SCSS
   * This ensures consistency between CSS and JS
   */
  const particleHueBase = parseFloat(styles.particleHueBase) || 30
  const particleHueRange = parseFloat(styles.particleHueRange) || 40
  const particleSaturation = parseInt(styles.particleSaturation) || 70
  const particleLightnessBase = parseInt(styles.particleLightnessBase) || 50
  const particleLightnessRange = parseInt(styles.particleLightnessRange) || 20

  // ========== CONFIGURATION PARAMETERS ==========
  // Easily adjustable parameters for particle behavior and appearance
  const MIN_PARTICLE_SIZE = 1 // Minimum particle diameter in pixels
  const MAX_PARTICLE_SIZE = 8 // Maximum particle diameter in pixels
  const MAX_OPTIMIZED_PARTICLES = 20 // Number of particles with priority optimization

  // ========== STATE MANAGEMENT ==========
  // Mouse position state - initialized to center of screen
  const [mousePos, setMousePos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })

  // Particle system state
  const [particles, setParticles] = useState([])

  // ========== REFS FOR PERFORMANCE ==========
  const containerRef = useRef(null) // Reference to container element
  const mousePosRef = useRef(mousePos) // Current mouse position (avoids stale closure)
  const previousMousePosRef = useRef(mousePos) // Previous frame mouse position for velocity calculation
  const animationRef = useRef() // Animation frame ID for cleanup

  // ========== PARTICLE INITIALIZATION ==========
  useEffect(() => {
    // Calculate particle count based on screen area
    // This ensures good performance on smaller screens
    const screenArea = window.innerWidth * window.innerHeight
    const baseParticles = 150
    const particleCount = Math.min(
      200, // Maximum cap to prevent performance issues
      Math.floor(baseParticles * (screenArea / 1920000)) // Scale based on 1920x1000 baseline
    )

    // Generate initial particle data
    const initialParticles = Array.from({ length: particleCount }, (_, i) => {
      // Random size within configured range
      const size =
        Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE) +
        MIN_PARTICLE_SIZE

      // Random initial direction (0 to 2π radians)
      const direction = Math.random() * Math.PI * 2

      // Base speed scaled between 0.05 and 0.15
      const baseSpeed = Math.random() * 0.1 + 0.05

      // ===== COLOR CALCULATION =====
      /**
       * Calculate particle color using imported SCSS values
       * This creates a cohesive color scheme based on primary color
       */
      const hueVariation = (Math.random() - 0.5) * particleHueRange
      const hue = particleHueBase + hueVariation

      const lightnessVariation = (Math.random() - 0.5) * particleLightnessRange
      const lightness = particleLightnessBase + lightnessVariation

      return {
        // ===== Core Properties =====
        id: i, // Unique identifier
        x: Math.random() * window.innerWidth, // Initial X position
        y: Math.random() * window.innerHeight, // Initial Y position
        size, // Current size (can change)
        baseSize: size, // Original size for reference
        opacity: Math.random() * 0.5 + 0.3, // Opacity between 0.3 and 0.8

        // ===== Velocity Properties =====
        baseVx: Math.cos(direction) * baseSpeed, // Base X velocity
        baseVy: Math.sin(direction) * baseSpeed, // Base Y velocity
        vx: Math.cos(direction) * baseSpeed, // Current X velocity
        vy: Math.sin(direction) * baseSpeed, // Current Y velocity

        // ===== Color Properties (from SCSS) =====
        hue, // Calculated from SCSS variables
        saturation: particleSaturation, // From SCSS
        lightness, // Base + variation

        // ===== Animation Properties =====
        pulseSpeed: Math.random() * 0.02 + 0.01, // Speed of size pulsing
        pulsePhase: Math.random() * Math.PI * 2, // Random phase offset for pulse

        // ===== Movement Properties =====
        directionChange: (Math.random() * 0.02 + 0.005) / 2, // Rate of direction wandering
        currentDirection: direction, // Current movement direction
        mass: 1 + size / 20, // Mass affects acceleration
        floatAmplitude: Math.random() * 20 + 10, // Amplitude of floating motion
        floatSpeed: (Math.random() * 0.02 + 0.01) / 2, // Speed of floating motion

        // ===== Interaction Properties =====
        mouseReactivity: 1.5 - size / 40, // Smaller particles react more to mouse
        dampening: 0.95, // Velocity dampening factor

        // ===== Optimization Properties =====
        isPriority: i < MAX_OPTIMIZED_PARTICLES, // First N particles get priority optimization
      }
    })
    setParticles(initialParticles)
  }, [
    particleHueBase,
    particleHueRange,
    particleSaturation,
    particleLightnessBase,
    particleLightnessRange,
  ])

  // ========== MOUSE MOVEMENT HANDLER ==========
  /**
   * Handles mouse movement events
   * Updates mouse position for particle physics calculations
   */
  const handleMouseMove = useCallback((e) => {
    // Store previous position for velocity calculation
    previousMousePosRef.current = mousePosRef.current

    // Update current position
    const newPos = { x: e.clientX, y: e.clientY }
    mousePosRef.current = newPos
    setMousePos(newPos)
  }, [])

  // ========== MOUSE EVENT LISTENER ==========
  useEffect(() => {
    // Add passive listener for better scroll performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  // ========== PARTICLE ANIMATION LOOP ==========
  useEffect(() => {
    let time = 0 // Time accumulator for periodic functions

    /**
     * Main animation loop - runs every frame
     * Updates particle positions based on physics simulation
     */
    const animateParticles = () => {
      // Get current mouse state
      const currentMousePos = mousePosRef.current
      const previousMousePos = previousMousePosRef.current

      // Calculate mouse velocity for blast effects
      const mouseVx = currentMousePos.x - previousMousePos.x
      const mouseVy = currentMousePos.y - previousMousePos.y
      const mouseSpeed = Math.sqrt(mouseVx ** 2 + mouseVy ** 2)

      // Increment time for animations
      time += 0.016 // Approximately 16ms per frame (60fps)

      // Update all particles
      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          // ===== CALCULATE MOUSE INTERACTION =====
          // Distance from particle to mouse
          const dx = currentMousePos.x - p.x
          const dy = currentMousePos.y - p.y
          const distance = Math.sqrt(dx ** 2 + dy ** 2)

          // ===== WANDERING MOVEMENT =====
          // Gradually change direction for organic movement
          p.currentDirection += (Math.random() - 0.5) * p.directionChange

          // Base wandering velocity
          const baseWanderVx = Math.cos(p.currentDirection) * 0.5
          const baseWanderVy = Math.sin(p.currentDirection) * 0.5

          // Floating motion using sine waves
          const floatX = Math.sin(time * p.floatSpeed) * p.floatAmplitude * 0.01
          const floatY =
            Math.cos(time * p.floatSpeed * 1.3) * p.floatAmplitude * 0.01

          // ===== MOUSE FORCES =====
          let mouseForceX = 0
          let mouseForceY = 0

          // Only apply forces within influence radius (200px)
          if (distance > 0 && distance < 200) {
            // Normalize direction vector
            const normDx = dx / distance
            const normDy = dy / distance

            // REPULSION ZONE (< 150px)
            if (distance < 150) {
              // Quadratic falloff for smooth repulsion
              const repulsion =
                Math.pow((150 - distance) / 150, 2) * 20 * p.mouseReactivity
              mouseForceX = -normDx * repulsion
              mouseForceY = -normDy * repulsion

              // BLAST EFFECT - Push particles when mouse moves fast
              if (mouseSpeed > 2) {
                const blast = mouseSpeed * 0.7 * p.mouseReactivity
                mouseForceX += (mouseVx * blast) / p.mass
                mouseForceY += (mouseVy * blast) / p.mass
              }

              // CHAOS ZONE - Add randomness when very close
              if (distance < 80) {
                mouseForceX += (Math.random() - 0.5) * 2
                mouseForceY += (Math.random() - 0.5) * 2
              }
            } else {
              // ATTRACTION ZONE (150px - 200px)
              // Gentle attraction at medium distances
              const attraction =
                ((distance - 150) / 150) * 0.2 * p.mouseReactivity
              mouseForceX = normDx * attraction
              mouseForceY = normDy * attraction
            }
          }

          // ===== VELOCITY CALCULATION =====
          // Combine all forces with dampening
          let newVx = p.vx * p.dampening + baseWanderVx + floatX + mouseForceX
          let newVy = p.vy * p.dampening + baseWanderVy + floatY + mouseForceY

          // Speed limiting to prevent particles from moving too fast
          const speed = Math.sqrt(newVx ** 2 + newVy ** 2)
          const maxSpeed = 0.8
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed
            newVy = (newVy / speed) * maxSpeed
          }

          // ===== POSITION UPDATE =====
          let newX = p.x + newVx
          let newY = p.y + newVy
          const margin = p.size // Boundary margin based on particle size

          // ===== BOUNDARY BEHAVIOR =====
          // Even-indexed particles bounce, odd-indexed particles wrap
          if (p.id % 2 === 0) {
            // BOUNCE BEHAVIOR - Reflect off edges with energy loss
            if (newX < margin || newX > window.innerWidth - margin) {
              p.currentDirection = Math.PI - p.currentDirection // Reverse X direction
              newVx *= -0.5 // Lose 50% velocity on bounce
              newX = Math.max(
                margin,
                Math.min(window.innerWidth - margin, newX)
              )
            }
            if (newY < margin || newY > window.innerHeight - margin) {
              p.currentDirection = -p.currentDirection // Reverse Y direction
              newVy *= -0.5 // Lose 50% velocity on bounce
              newY = Math.max(
                margin,
                Math.min(window.innerHeight - margin, newY)
              )
            }
          } else {
            // WRAP BEHAVIOR - Seamless edge teleportation
            if (newX < -margin) newX = window.innerWidth + margin
            if (newX > window.innerWidth + margin) newX = -margin
            if (newY < -margin) newY = window.innerHeight + margin
            if (newY > window.innerHeight + margin) newY = -margin
          }

          // ===== VISUAL EFFECTS =====
          // SIZE PULSING - Organic breathing effect
          const pulse = 1 + Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.2

          // SIZE BOOST - Particles grow when near mouse
          const distFactor =
            distance < 200 ? 1 + Math.pow((200 - distance) / 200, 2) * 0.5 : 1
          const currentSize = p.baseSize * pulse * distFactor

          // OPACITY CALCULATION - Multiple factors affect visibility
          const baseOpacity = 0.6
          const speedBoost = Math.min(1, speed / 5) // Faster particles are more visible
          const distOpacity =
            distance < 200
              ? Math.min(1, baseOpacity + ((200 - distance) / 200) * 0.4)
              : baseOpacity
          const newOpacity = Math.max(
            0.3, // Minimum opacity
            Math.min(1, distOpacity + speedBoost * 0.2) // Maximum opacity
          )

          // Return updated particle state
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

      // Schedule next frame
      animationRef.current = requestAnimationFrame(animateParticles)
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(animateParticles)

    // Cleanup on unmount
    return () => cancelAnimationFrame(animationRef.current)
  }, []) // Empty dependency array - animation setup only runs once

  // ========== RENDER ==========
  return (
    <div ref={containerRef} className={styles.container}>
      {/* Render all particles */}
      {particles.map((p) => {
        // ===== DYNAMIC COLOR CALCULATION =====
        /**
         * Calculate particle appearance based on state
         * Lightness increases with opacity for glowing effect
         */
        const dynamicLightness = p.lightness + p.opacity * 20
        const particleColor = `hsl(${p.hue}, ${p.saturation}%, ${dynamicLightness}%)`

        return (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              // Position
              left: `${p.x}px`,
              top: `${p.y}px`,
              // Size
              width: `${p.size}px`,
              height: `${p.size}px`,
              // Visual effects
              opacity: p.opacity,
              backgroundColor: particleColor,
              // Enhanced glow using the same color
              boxShadow: `
                0 0 ${p.size * 2}px ${particleColor},
                0 0 ${p.size * 4}px ${particleColor}40
              `,
              // Blur large particles for depth effect
              filter: p.size > 15 ? 'blur(0.5px)' : 'none',
              // Performance optimization - only priority particles get will-change
              willChange: p.isPriority ? 'transform, opacity' : 'auto',
            }}
          />
        )
      })}
    </div>
  )
}

export default MouseReactiveBackground
