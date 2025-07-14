/**
 * Class representing an animated geometric particle
 * Manages physics, interactions, and visual properties
 */
export class Particle {
  constructor(canvas, config) {
    // === POSITION AND MOVEMENT ===
    // Random initial position within the canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height

    // Random velocity on both axes
    this.speedX = (Math.random() - 0.5) * config.particle.baseSpeed
    this.speedY = (Math.random() - 0.5) * config.particle.baseSpeed

    // === VISUAL PROPERTIES ===
    // Random size within defined range
    this.size =
      Math.random() * (config.particle.maxSize - config.particle.minSize) +
      config.particle.minSize
    this.baseSize = this.size // Base size for animations

    // Random opacity within defined range
    this.opacity =
      Math.random() *
        (config.particle.maxOpacity - config.particle.minOpacity) +
      config.particle.minOpacity
    this.baseOpacity = this.opacity // Base opacity for animations

    // === SHAPE AND ROTATION ===
    // Random geometric shape (0: circle, 1: square, 2: triangle)
    this.shape = Math.floor(Math.random() * 3)

    // Random rotation speed
    this.rotationSpeed = (Math.random() - 0.5) * config.particle.rotationSpeed
    this.rotation = 0 // Current rotation angle

    // === CONNECTIONS ===
    // Set to avoid duplicate connections
    this.connections = new Set()
  }

  /**
   * Updates the particle each frame
   * Handles movement, collisions, and interactions
   *
   * @param {HTMLCanvasElement} canvas - Canvas for boundaries
   * @param {Object} mouse - Mouse position {x, y}
   * @param {Object} config - System configuration
   */
  update(canvas, mouse, config) {
    // === BASIC MOVEMENT ===
    // Movement based on velocity
    this.x += this.speedX
    this.y += this.speedY

    // Continuous rotation
    this.rotation += this.rotationSpeed

    // === COLLISION HANDLING ===
    // Bounce off horizontal edges
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1

    // Bounce off vertical edges
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

    // === POSITION CONSTRAINTS ===
    // Keep within canvas boundaries
    this.x = Math.max(0, Math.min(canvas.width, this.x))
    this.y = Math.max(0, Math.min(canvas.height, this.y))

    // === MOUSE INTERACTION ===
    // Calculate distance to mouse
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If within mouse influence radius
    if (distance < config.interaction.mouseRadius) {
      // Calculate force based on distance
      const force =
        (config.interaction.mouseRadius - distance) /
        config.interaction.mouseRadius

      // === REPULSION ===
      // Move away from mouse with proportional force
      this.x -= dx * force * config.interaction.mouseForce
      this.y -= dy * force * config.interaction.mouseForce

      // === VISUAL EFFECTS ===
      // Increase opacity during interaction
      this.opacity = Math.min(
        config.particle.maxOpacity,
        this.baseOpacity + force * 0.3
      )

      // Increase size during interaction
      this.size = Math.min(config.particle.maxSize, this.baseSize + force * 2)
    } else {
      // === RETURN TO NORMAL STATE ===
      // Progressive opacity fade out
      this.opacity = Math.max(this.baseOpacity, this.opacity - 0.01)

      // Progressive size reduction
      this.size = Math.max(this.baseSize, this.size - 0.05)
    }
  }
}

/**
 * Creates an array of particles for a given canvas
 * Number of particles is calculated based on area and density
 *
 * @param {HTMLCanvasElement} canvas - Canvas to calculate dimensions
 * @param {Object} config - Particle configuration
 * @returns {Array<Particle>} - Array of created particles
 */
export const createParticles = (canvas, config) => {
  // Calculate particle count based on area
  const count = Math.floor(
    (canvas.width * canvas.height) / config.particleDensity
  )

  // Create array with calculated count
  return Array.from({ length: count }, () => new Particle(canvas, config))
}
