export class Particle {
    constructor(canvas, config) {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * (config.particle.maxSize - config.particle.minSize) + config.particle.minSize
        this.baseSize = this.size
        this.speedX = (Math.random() - 0.5) * config.particle.baseSpeed
        this.speedY = (Math.random() - 0.5) * config.particle.baseSpeed
        this.opacity = Math.random() * (config.particle.maxOpacity - config.particle.minOpacity) + config.particle.minOpacity
        this.baseOpacity = this.opacity
        this.shape = Math.floor(Math.random() * 3)
        this.rotationSpeed = (Math.random() - 0.5) * config.particle.rotationSpeed
        this.rotation = 0
        this.connections = new Set()
    }

    update(canvas, mouse, config) {
        // Mouvement
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed

        // Rebonds
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        // Limites
        this.x = Math.max(0, Math.min(canvas.width, this.x))
        this.y = Math.max(0, Math.min(canvas.height, this.y))

        // Interaction souris
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < config.interaction.mouseRadius) {
            const force = (config.interaction.mouseRadius - distance) / config.interaction.mouseRadius
            this.x -= dx * force * config.interaction.mouseForce
            this.y -= dy * force * config.interaction.mouseForce
            this.opacity = Math.min(config.particle.maxOpacity, this.baseOpacity + force * 0.3)
            this.size = Math.min(config.particle.maxSize, this.baseSize + force * 2)
        } else {
            this.opacity = Math.max(this.baseOpacity, this.opacity - 0.01)
            this.size = Math.max(this.baseSize, this.size - 0.05)
        }
    }
}

export const createParticles = (canvas, config) => {
    const count = Math.floor((canvas.width * canvas.height) / config.particleDensity)
    return Array.from({ length: count }, () => new Particle(canvas, config))
}