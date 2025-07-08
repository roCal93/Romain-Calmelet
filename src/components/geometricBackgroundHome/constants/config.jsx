export const DEFAULT_CONFIG = {
  particleDensity: 20000,
  particle: {
    minSize: 4,
    maxSize: 12,
    baseSpeed: 0.5,
    rotationSpeed: 0.02,
    minOpacity: 0.3,
    maxOpacity: 1.0,
  },
  interaction: {
    mouseRadius: 100,
    mouseForce: 0.1,
    connectionDistance: 120,
    maxConnectionsPerParticle: 3,
  },
  performance: {
    spatialGridCellSize: 150,
    throttleDelay: 16,
  },
}
