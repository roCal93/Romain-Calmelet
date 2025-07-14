import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import styles from './contactGame.module.scss'

// ==================== CONSTANTES ====================
const LINKS = {
  linkedin: 'https://www.linkedin.com/in/romain-calmelet/',
  github: 'https://github.com/RoCal93',
}

const ANIMATION_CONFIG = {
  baseSpeed: 4,
  detectionRadius: 30,
  maxSpeedMultiplier: 2,
  repulsionForce: 3,
  speedRegulation: {
    reduction: 0.98,
    increase: 1.1,
    minThreshold: 0.5,
  },
  collision: {
    damping: 0.9,
    separation: 2,
  },
}

const RESPONSIVE_CONFIG = {
  mobile: { speedFactor: 0.8, logoSize: 40, detectionZone: 120 },
  tablet: { speedFactor: 0.9, logoSize: 60, detectionZone: 180 },
  desktop: { speedFactor: 1, logoSize: 60, detectionZone: 180 },
}

// ==================== UTILITAIRES ====================
const throttle = (func, delay) => {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall < delay) return
    lastCall = now
    return func(...args)
  }
}

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('safari') && !ua.includes('chrome')
}

const getRandomPosition = (max, logoSize) =>
  Math.random() * Math.max(0, max - logoSize)

// ==================== COMPOSANTS ====================
const LinkedInIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const GitHubIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

const Notification = ({ url, type, onAction, onClose }) => (
  <div className={`${styles.popupNotification} ${styles[type]}`}>
    <div className={styles.notificationContent}>
      {type === 'error' ? (
        <>
          <p>Votre navigateur a bloqué l'ouverture du lien.</p>
          <p className={styles.notificationUrl}>{url}</p>
          <div className={styles.notificationActions}>
            <button onClick={onAction} className={styles.notificationButton}>
              Ouvrir
            </button>
            <button onClick={onClose} className={styles.secondaryButton}>
              Annuler
            </button>
          </div>
        </>
      ) : (
        <p className={styles.successMessage}>{url}</p>
      )}
    </div>
    <button
      onClick={onClose}
      className={styles.closeButton}
      aria-label="Fermer"
    >
      ✕
    </button>
  </div>
)

// ==================== COMPOSANT PRINCIPAL ====================
function ContactGame() {
  // Refs
  const gameContainerRef = useRef(null)
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const hasClickedRef = useRef({ linkedin: false, github: false })
  const logoTouchedRef = useRef({ linkedin: false, github: false })

  // États
  const [logos, setLogos] = useState([])
  const [logoInZone, setLogoInZone] = useState({
    linkedin: false,
    github: false,
  })
  const [notification, setNotification] = useState({
    show: false,
    url: null,
    type: 'error',
  })

  // Responsive
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 })

  const config = useMemo(
    () =>
      isMobile
        ? RESPONSIVE_CONFIG.mobile
        : isTablet
        ? RESPONSIVE_CONFIG.tablet
        : RESPONSIVE_CONFIG.desktop,
    [isMobile, isTablet]
  )

  // ==================== INITIALISATION ====================
  const initializeLogos = useCallback(() => {
    const { speedFactor, logoSize } = config
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    return [
      {
        id: 'linkedin',
        x: getRandomPosition(windowWidth, logoSize),
        y: getRandomPosition(windowHeight - 260, logoSize),
        dx: ANIMATION_CONFIG.baseSpeed * speedFactor,
        dy: 1.5 * speedFactor,
        size: logoSize,
        baseSpeed: ANIMATION_CONFIG.baseSpeed * speedFactor,
        url: LINKS.linkedin,
      },
      {
        id: 'github',
        x: getRandomPosition(windowWidth, logoSize),
        y: getRandomPosition(windowHeight - 260, logoSize),
        dx: -ANIMATION_CONFIG.baseSpeed * speedFactor,
        dy: -2.2 * speedFactor,
        size: logoSize,
        baseSpeed: ANIMATION_CONFIG.baseSpeed * speedFactor,
        url: LINKS.github,
      },
    ]
  }, [config])

  useEffect(() => {
    setLogos(initializeLogos())
  }, [initializeLogos])

  // ==================== GESTIONNAIRES ====================
  const openLink = useCallback((url, logoId) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer')

      if (isSafari()) {
        setNotification({ show: true, url, type: 'error' })
      }
    } catch (error) {
      console.error(`Erreur ouverture ${logoId}:`, error)
      setNotification({ show: true, url, type: 'error' })
    }
  }, [])

  const handleNotificationAction = useCallback(() => {
    if (notification.url) {
      try {
        window.open(notification.url, '_blank', 'noopener,noreferrer')
        setNotification({ show: false, url: null, type: 'error' })
      } catch {
        // Suppression de la variable 'error' non utilisée
        if (
          window.confirm(
            "Impossible d'ouvrir le lien. Ouvrir dans la fenêtre actuelle ?"
          )
        ) {
          window.location.href = notification.url
        }
      }
    }
  }, [notification.url])

  const closeNotification = useCallback(() => {
    setNotification({ show: false, url: null, type: 'error' })
  }, [])

  // ==================== GESTION SOURIS ====================
  const handleMouseMove = useMemo(
    () =>
      throttle((e) => {
        const container = gameContainerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }, 16),
    []
  )

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Support tactile mobile
  useEffect(() => {
    if (!isMobile) return

    const container = gameContainerRef.current
    if (!container) return

    const handleTouchMove = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = container.getBoundingClientRect()

      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => container.removeEventListener('touchmove', handleTouchMove)
  }, [isMobile])

  // ==================== GESTION REDIMENSIONNEMENT ====================
  useEffect(() => {
    const handleResize = () => {
      setLogos((prevLogos) =>
        prevLogos.map((logo) => ({
          ...logo,
          x: Math.min(logo.x, window.innerWidth - logo.size),
          y: Math.min(logo.y, window.innerHeight - logo.size - 200),
        }))
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ==================== LOGIQUE D'ANIMATION ====================
  const updateLogoPosition = useCallback(
    (logo, containerWidth, containerHeight, otherLogos) => {
      let { x, y, dx, dy, size, baseSpeed } = logo

      // Mise à jour position
      let newX = x + dx
      let newY = y + dy
      let newDx = dx
      let newDy = dy

      // Interaction souris
      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y
      const logoCenterX = x + size / 2
      const logoCenterY = y + size / 2
      const distanceToMouse = Math.hypot(
        mouseX - logoCenterX,
        mouseY - logoCenterY
      )
      const detectionRadius = size / 2 + ANIMATION_CONFIG.detectionRadius

      if (distanceToMouse < detectionRadius && distanceToMouse > 0) {
        logoTouchedRef.current[logo.id] = true

        const angle = Math.atan2(logoCenterY - mouseY, logoCenterX - mouseX)
        const force =
          (1 - distanceToMouse / detectionRadius) *
          ANIMATION_CONFIG.repulsionForce

        newDx += Math.cos(angle) * force
        newDy += Math.sin(angle) * force

        // Limitation vitesse max
        const maxSpeed = baseSpeed * ANIMATION_CONFIG.maxSpeedMultiplier
        const currentSpeed = Math.hypot(newDx, newDy)

        if (currentSpeed > maxSpeed) {
          const ratio = maxSpeed / currentSpeed
          newDx *= ratio
          newDy *= ratio
        }
      } else {
        // Régulation vitesse
        const currentSpeed = Math.hypot(newDx, newDy)
        const { reduction, increase, minThreshold } =
          ANIMATION_CONFIG.speedRegulation

        if (currentSpeed > baseSpeed) {
          newDx *= reduction
          newDy *= reduction
        } else if (currentSpeed < baseSpeed * minThreshold) {
          newDx *= increase
          newDy *= increase
        }
      }

      // Rebonds sur les bords
      if (newX <= 0 || newX >= containerWidth - size) {
        newDx = -newDx
        newX = Math.max(0, Math.min(containerWidth - size, newX))
        logoTouchedRef.current[logo.id] = false
      }
      if (newY <= 0 || newY >= containerHeight - size) {
        newDy = -newDy
        newY = Math.max(0, Math.min(containerHeight - size, newY))
        logoTouchedRef.current[logo.id] = false
      }

      // Collisions entre logos
      otherLogos.forEach((other) => {
        const dist = Math.hypot(
          newX + size / 2 - other.x - other.size / 2,
          newY + size / 2 - other.y - other.size / 2
        )
        const minDist = (size + other.size) / 2

        if (dist < minDist) {
          const { damping, separation } = ANIMATION_CONFIG.collision
          newDx = -newDx * damping
          newDy = -newDy * damping

          // Séparation
          const angle = Math.atan2(
            newY + size / 2 - other.y - other.size / 2,
            newX + size / 2 - other.x - other.size / 2
          )
          const pushDistance = minDist + separation
          newX =
            other.x + other.size / 2 + Math.cos(angle) * pushDistance - size / 2
          newY =
            other.y + other.size / 2 + Math.sin(angle) * pushDistance - size / 2

          // Garder dans les limites
          newX = Math.max(0, Math.min(containerWidth - size, newX))
          newY = Math.max(0, Math.min(containerHeight - size, newY))
        }
      })

      return { ...logo, x: newX, y: newY, dx: newDx, dy: newDy }
    },
    []
  )

  const checkDropZone = useCallback(
    (logo, containerWidth, containerHeight) => {
      const zoneSize = config.detectionZone
      const zoneX = containerWidth / 2 - zoneSize / 2
      const zoneY = containerHeight - zoneSize - 80

      const logoCenterX = logo.x + logo.size / 2
      const logoCenterY = logo.y + logo.size / 2

      return (
        logoCenterX >= zoneX &&
        logoCenterX <= zoneX + zoneSize &&
        logoCenterY >= zoneY &&
        logoCenterY <= zoneY + zoneSize
      )
    },
    [config.detectionZone]
  )

  // ==================== BOUCLE D'ANIMATION ====================
  useEffect(() => {
    const animate = () => {
      setLogos((prevLogos) => {
        const container = gameContainerRef.current
        if (!container) return prevLogos

        const { width, height } = container.getBoundingClientRect()
        const tempLogoInZone = { linkedin: false, github: false }

        const updatedLogos = prevLogos.map((logo, index) => {
          const otherLogos = prevLogos.filter((_, i) => i !== index)
          const updatedLogo = updateLogoPosition(
            logo,
            width,
            height,
            otherLogos
          )

          // Vérifier zone de drop
          const isInZone = checkDropZone(updatedLogo, width, height)
          tempLogoInZone[logo.id] = isInZone

          // Déclencher action si dans la zone
          if (
            isInZone &&
            !hasClickedRef.current[logo.id] &&
            logoTouchedRef.current[logo.id]
          ) {
            hasClickedRef.current[logo.id] = true
            openLink(logo.url, logo.id)
          } else if (!isInZone) {
            hasClickedRef.current[logo.id] = false
          }

          return updatedLogo
        })

        setLogoInZone(tempLogoInZone)
        return updatedLogos
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateLogoPosition, checkDropZone, openLink])

  // ==================== RENDU ====================
  return (
    <div className={styles.gameContainer} ref={gameContainerRef}>
      {/* Zone de drop */}
      <div
        className={`${styles.detectionZone} ${
          logoInZone.linkedin || logoInZone.github ? styles.active : ''
        }`}
        style={{
          width: `${config.detectionZone}px`,
          height: `${config.detectionZone}px`,
        }}
      >
        <span className={styles.zoneText}>Amenez le logo ici !</span>
      </div>

      {/* Logos */}
      <div className={styles.floatingLogos}>
        {logos.map((logo) => (
          <div
            key={logo.id}
            className={`${styles.floatingLogo} ${styles[`${logo.id}Logo`]} ${
              logoInZone[logo.id] ? styles.inZone : ''
            } ${logoTouchedRef.current[logo.id] ? styles.touched : ''}`}
            style={{
              left: `${logo.x}px`,
              top: `${logo.y}px`,
              width: `${logo.size}px`,
              height: `${logo.size}px`,
            }}
            aria-label={`Ouvrir le profil ${logo.id}`}
          >
            {logo.id === 'linkedin' ? (
              <LinkedInIcon size={isMobile ? 20 : 30} />
            ) : (
              <GitHubIcon size={isMobile ? 20 : 30} />
            )}
          </div>
        ))}
      </div>

      {/* Aide */}
      <div className={styles.interactionHint}>
        <p>
          Approchez votre souris des logos, puis poussez-les dans la zone pour
          ouvrir les liens
        </p>
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification
          url={notification.url}
          type={notification.type}
          onAction={handleNotificationAction}
          onClose={closeNotification}
        />
      )}
    </div>
  )
}

export default ContactGame
