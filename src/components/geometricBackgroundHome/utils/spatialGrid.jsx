export class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize
        this.grid = new Map()
    }

    clear() {
        this.grid.clear()
    }

    add(particle, index) {
        const cellX = Math.floor(particle.x / this.cellSize)
        const cellY = Math.floor(particle.y / this.cellSize)

        // Ajouter à la cellule et aux cellules adjacentes
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cellX + dx},${cellY + dy}`
                if (!this.grid.has(key)) {
                    this.grid.set(key, [])
                }
                this.grid.get(key).push(index)
            }
        }
    }

    getNearby(particle) {
        const cellX = Math.floor(particle.x / this.cellSize)
        const cellY = Math.floor(particle.y / this.cellSize)
        const key = `${cellX},${cellY}`

        return this.grid.get(key) || []
    }

    rebuild(particles) {
        this.clear()
        particles.forEach((particle, index) => {
            this.add(particle, index)
        })
    }
}

// Version simplifiée pour les connexions
export const findNearbyParticles = (particle, particles, maxDistance) => {
    const nearby = []

    particles.forEach((other, index) => {
        if (other === particle) return

        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
            nearby.push({ particle: other, distance, index })
        }
    })

    return nearby.sort((a, b) => a.distance - b.distance)
}