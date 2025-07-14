/**
 * Default configuration for the particle system
 * All values can be overridden via props
 */
export const DEFAULT_CONFIG = {
  // Particle density (higher value = fewer particles)
  // Calculation: (width * height) / particleDensity = number of particles
  particleDensity: 20000,

  // Individual particle configuration
  particle: {
    minSize: 4, // Minimum particle size (px)
    maxSize: 12, // Maximum particle size (px)
    baseSpeed: 0.5, // Base movement speed (px/frame)
    rotationSpeed: 0.02, // Rotation speed (radians/frame)
    minOpacity: 0.3, // Minimum opacity (0-1)
    maxOpacity: 1.0, // Maximum opacity (0-1)
  },

  // Interaction configuration
  interaction: {
    mouseRadius: 100, // Mouse influence radius (px)
    mouseForce: 0.1, // Mouse repulsion/attraction force
    connectionDistance: 120, // Max distance for drawing connections (px)
    maxConnectionsPerParticle: 3, // Max connections per particle
  },

  // Performance configuration
  performance: {
    spatialGridCellSize: 150, // Spatial grid cell size (px)
    throttleDelay: 16, // Throttling delay for interactions (ms)
  },
}
