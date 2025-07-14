/**
 * Draws a geometric particle with gradient and outline
 * Handles three shape types: circle, square, and triangle
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Particle} particle - Particle to draw
 * @param {Object} colors - Colors for rendering
 * @param {string} colors.fillCenter - Gradient center color
 * @param {string} colors.fillEdge - Gradient edge color
 * @param {string} colors.stroke - Outline color
 */
export const drawShape = (ctx, particle, colors) => {
  // === CONTEXT PREPARATION ===
  ctx.save() // Save current state

  // Translate to particle position
  ctx.translate(particle.x, particle.y)

  // Apply rotation
  ctx.rotate(particle.rotation)

  // === CREATE RADIAL GRADIENT ===
  // Gradient from center to edges for depth effect
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
  gradient.addColorStop(0, colors.fillCenter) // More opaque center
  gradient.addColorStop(1, colors.fillEdge) // More transparent edge

  // === CONFIGURE STYLES ===
  ctx.fillStyle = gradient
  ctx.strokeStyle = colors.stroke
  ctx.lineWidth = 1.5

  // === RENDER BASED ON SHAPE TYPE ===
  switch (particle.shape) {
    case 0: // CIRCLE
      ctx.beginPath()
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      break

    case 1: // SQUARE
      ctx.beginPath()
      // Square centered on origin
      ctx.rect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size
      )
      ctx.fill()
      ctx.stroke()
      break

    case 2: // EQUILATERAL TRIANGLE
      ctx.beginPath()
      // Top point
      ctx.moveTo(0, -particle.size)
      // Bottom left point
      ctx.lineTo(-particle.size * 0.866, particle.size * 0.5)
      // Bottom right point
      ctx.lineTo(particle.size * 0.866, particle.size * 0.5)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      break
  }

  // === RESTORE CONTEXT ===
  ctx.restore() // Restore previous state
}

/**
 * Draws connections between nearby particles
 * Uses optimized algorithm to avoid duplicates
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array<Particle>} particles - Array of particles
 * @param {Object} config - System configuration
 * @param {Function} connectionColor - Function returning color based on opacity
 */
export const drawConnections = (ctx, particles, config, connectionColor) => {
  // === DUPLICATE PREVENTION ===
  // Set to avoid drawing the same connection multiple times
  const drawn = new Set()

  // === ITERATE THROUGH PARTICLES ===
  particles.forEach((p1, i) => {
    // Limit connections per particle for performance
    if (p1.connections.size >= config.interaction.maxConnectionsPerParticle)
      return

    // === SEARCH FOR NEIGHBORING PARTICLES ===
    particles.forEach((p2, j) => {
      // Avoid self-comparison and duplicates
      if (i >= j) return

      // Unique key for this particle pair
      const key = `${i}-${j}`
      if (drawn.has(key)) return

      // === CALCULATE DISTANCE ===
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // === DRAW CONNECTION ===
      // If particles are close enough
      if (distance < config.interaction.connectionDistance) {
        // Mark as drawn
        drawn.add(key)

        // Calculate opacity based on distance
        // Closer = more opaque
        const opacity =
          (config.interaction.connectionDistance - distance) /
          config.interaction.connectionDistance

        // === RENDER LINE ===
        ctx.strokeStyle = connectionColor(opacity * 0.4) // Reduced opacity
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y) // Starting point
        ctx.lineTo(p2.x, p2.y) // Ending point
        ctx.stroke()
      }
    })
  })
}
