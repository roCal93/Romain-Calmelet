/**
 * Spatial grid for optimizing neighborhood searches
 * Divides space into cells to reduce number of comparisons
 * Uses a Map to store particles by cell
 */
export class SpatialGrid {
  /**
   * Initializes a new spatial grid
   *
   * @param {number} cellSize - Size of a grid cell
   */
  constructor(cellSize) {
    this.cellSize = cellSize
    this.grid = new Map() // Map structure for O(1) performance
  }

  /**
   * Completely empties the grid
   * Useful before a complete rebuild
   */
  clear() {
    this.grid.clear()
  }

  /**
   * Adds a particle to the grid
   * Adds it to its cell AND the 8 adjacent cells
   * to handle particles at cell boundaries
   *
   * @param {Object} particle - Particle with x and y properties
   * @param {number} index - Particle index in the main array
   */
  add(particle, index) {
    // === CALCULATE MAIN CELL ===
    const cellX = Math.floor(particle.x / this.cellSize)
    const cellY = Math.floor(particle.y / this.cellSize)

    // === ADD TO 9 CELLS (3x3) ===
    // Iterate through adjacent cells (-1, 0, 1) in each direction
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        // Generate unique key for each cell
        const key = `${cellX + dx},${cellY + dy}`

        // === INITIALIZE CELL IF NECESSARY ===
        if (!this.grid.has(key)) {
          this.grid.set(key, [])
        }

        // === ADD INDEX TO CELL ===
        this.grid.get(key).push(index)
      }
    }
  }

  /**
   * Gets indices of nearby particles
   * Returns only particles from the current cell
   *
   * @param {Object} particle - Reference particle
   * @returns {Array} - Array of neighboring particle indices
   */
  getNearby(particle) {
    // === CALCULATE PARTICLE'S CELL ===
    const cellX = Math.floor(particle.x / this.cellSize)
    const cellY = Math.floor(particle.y / this.cellSize)
    const key = `${cellX},${cellY}`

    // === RETURN NEIGHBORS OR EMPTY ARRAY ===
    return this.grid.get(key) || []
  }

  /**
   * Completely rebuilds the grid with all particles
   * Efficient method to update entire structure
   *
   * @param {Array} particles - Array of all particles
   */
  rebuild(particles) {
    // === COMPLETE RESET ===
    this.clear()

    // === ADD ALL PARTICLES ===
    particles.forEach((particle, index) => {
      this.add(particle, index)
    })
  }
}

/**
 * Finds all particles within a given radius
 * Simplified version without spatial grid (brute force)
 * Useful for small sets or visual connections
 *
 * @param {Object} particle - Reference particle
 * @param {Array} particles - Array of all particles
 * @param {number} maxDistance - Maximum search distance
 * @returns {Array} - Nearby particles sorted by distance
 */
export const findNearbyParticles = (particle, particles, maxDistance) => {
  const nearby = []

  // === ITERATE THROUGH ALL PARTICLES ===
  particles.forEach((other, index) => {
    // Skip if it's the same particle
    if (other === particle) return

    // === CALCULATE EUCLIDEAN DISTANCE ===
    const dx = particle.x - other.x
    const dy = particle.y - other.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // === ADD IF WITHIN RADIUS ===
    if (distance < maxDistance) {
      nearby.push({
        particle: other,
        distance,
        index,
      })
    }
  })

  // === SORT BY INCREASING DISTANCE ===
  // Closest first
  return nearby.sort((a, b) => a.distance - b.distance)
}
