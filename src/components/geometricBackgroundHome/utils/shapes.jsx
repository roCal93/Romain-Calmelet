export const drawShape = (ctx, particle, colors) => {
    ctx.save()
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
    gradient.addColorStop(0, colors.fillCenter)
    gradient.addColorStop(1, colors.fillEdge)

    ctx.fillStyle = gradient
    ctx.strokeStyle = colors.stroke
    ctx.lineWidth = 1.5

    switch (particle.shape) {
        case 0: // Cercle
            ctx.beginPath()
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            break
        case 1: // Carré
            ctx.beginPath()
            ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
            ctx.fill()
            ctx.stroke()
            break
        case 2: // Triangle
            ctx.beginPath()
            ctx.moveTo(0, -particle.size)
            ctx.lineTo(-particle.size * 0.866, particle.size * 0.5)
            ctx.lineTo(particle.size * 0.866, particle.size * 0.5)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            break
    }

    ctx.restore()
}

export const drawConnections = (ctx, particles, config, connectionColor) => {
    const drawn = new Set()

    particles.forEach((p1, i) => {
        if (p1.connections.size >= config.interaction.maxConnectionsPerParticle) return

        particles.forEach((p2, j) => {
            if (i >= j) return

            const key = `${i}-${j}`
            if (drawn.has(key)) return

            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < config.interaction.connectionDistance) {
                drawn.add(key)
                const opacity = (config.interaction.connectionDistance - distance) / config.interaction.connectionDistance

                ctx.strokeStyle = connectionColor(opacity * 0.4)
                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.stroke()
            }
        })
    })
}