import { useEffect, useRef, useCallback } from 'react'
import styles from './geometricBackgroundHome.module.scss'

// Composant de fond géométrique interactif
const GeometricBackgroundHome = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef([])

  // Récupération des couleurs depuis les variables CSS
  const getColorFromCSS = useCallback((property) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Redimensionnement du canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Création des particules géométriques
    const createParticles = () => {
      const particles = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.8 + 0.3,
          shape: Math.floor(Math.random() * 3), // 0: circle, 1: square, 2: triangle
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          rotation: 0,
          connectionDistance: 120,
          mouseDistance: 0,
        })
      }

      particlesRef.current = particles
    }

    // Fonction pour convertir rgba en valeur avec opacité
    const applyOpacity = (color, opacity) => {
      // Si c'est déjà une valeur rgba, on remplace l'opacité
      if (color.startsWith('rgba')) {
        return color.replace(/[\d.]+\)$/g, `${opacity})`)
      }
      // Si c'est une valeur hex, on la convertit en rgba
      if (color.startsWith('#')) {
        const hex = color.slice(1)
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }
      // Si c'est rgb, on ajoute l'opacité
      if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
      }
      return color
    }

    // Fonction de dessin des formes géométriques
    const drawShape = (ctx, particle) => {
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
      gradient.addColorStop(
        0,
        applyOpacity(
          getColorFromCSS('--particle-fill-center'),
          particle.opacity
        )
      )
      gradient.addColorStop(
        1,
        applyOpacity(
          getColorFromCSS('--particle-fill-edge'),
          particle.opacity * 0.7
        )
      )

      ctx.fillStyle = gradient
      ctx.strokeStyle = applyOpacity(
        getColorFromCSS('--particle-stroke'),
        particle.opacity
      )
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
          ctx.rect(
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
          )
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

    // Animation des particules
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Mise à jour et dessin des particules
      particlesRef.current.forEach((particle) => {
        // Mouvement de base
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.rotation += particle.rotationSpeed

        // Rebond sur les bords
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // Garder dans les limites
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Interaction avec la souris
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        particle.mouseDistance = Math.sqrt(dx * dx + dy * dy)

        if (particle.mouseDistance < 100) {
          const force = (100 - particle.mouseDistance) / 100
          particle.x -= dx * force * 0.03
          particle.y -= dy * force * 0.03
          particle.opacity = Math.min(1.0, particle.opacity + force * 0.03)
          particle.size = Math.min(12, particle.size + force * 1.5)
        } else {
          particle.opacity = Math.max(0.3, particle.opacity - 0.01)
          particle.size = Math.max(4, particle.size - 0.05)
        }

        drawShape(ctx, particle)
      })

      // Dessiner les connexions
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]

          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < p1.connectionDistance) {
            const opacity =
              (p1.connectionDistance - distance) / p1.connectionDistance
            ctx.strokeStyle = applyOpacity(
              getColorFromCSS('--particle-connections'),
              opacity * 0.4
            )
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Gestion de la souris
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    createParticles()
    animate()

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [getColorFromCSS])

  return <canvas ref={canvasRef} className={styles.geometricCanvas} />
}

export default GeometricBackgroundHome
