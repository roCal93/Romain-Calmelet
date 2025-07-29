import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './contactGame.module.scss'

// ==================== CONSTANTS ====================
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

// ==================== UTILITIES ====================
/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, delay) => {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall < delay) return
    lastCall = now
    return func(...args)
  }
}

/**
 * Generate random position for logo placement
 * @param {number} max - Maximum boundary
 * @param {number} logoSize - Size of the logo
 * @returns {number} Random position
 */
const getRandomPosition = (max, logoSize) =>
  Math.random() * Math.max(0, max - logoSize)

// ==================== ICON COMPONENTS ====================
/**
 * LinkedIn SVG Icon Component
 * @param {Object} props - Component props
 * @param {number} props.size - Icon size
 * @returns {JSX.Element} LinkedIn icon
 */
const LinkedInIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

/**
 * GitHub SVG Icon Component
 * @param {Object} props - Component props
 * @param {number} props.size - Icon size
 * @returns {JSX.Element} GitHub icon
 */
const GitHubIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

// ==================== MODAL COMPONENTS ====================
/**
 * Success Modal displayed when logo is dropped in zone
 * @param {Object} props - Component props
 * @param {string} props.id - Logo ID (linkedin/github)
 * @param {string} props.url - Profile URL
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {Function} props.onClose - Close action handler
 * @returns {JSX.Element} Success modal
 */
const DropSuccessModal = ({ id, url, onConfirm, onClose }) => {
  const { t } = useTranslation()
  const networkName = id === 'linkedin' ? 'LinkedIn' : 'GitHub'

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>🎉{t('contactGame.dropSuccessTitle')} </h2>
        <p>
          {t('contactGame.dropSuccessText1')}
          <strong>{networkName}</strong> !
        </p>
        <p>{t('contactGame.dropSuccessText2')}</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm}>
            {t('contactGame.dropSuccessOpenButton')}
          </button>
          <button onClick={onClose}>
            {t('contactGame.dropSuccessCloseButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Notification component for popup blocking alerts
 * @param {Object} props - Component props
 * @param {string} props.url - URL to open
 * @param {string} props.type - Notification type (error/success)
 * @param {Function} props.onAction - Action button handler
 * @param {Function} props.onClose - Close button handler
 * @returns {JSX.Element} Notification component
 */
const Notification = ({ url, type, onAction, onClose }) => {
  const { t } = useTranslation()

  return (
    <div className={`${styles.popupNotification} ${styles[type]}`}>
      <div className={styles.notificationContent}>
        {type === 'error' ? (
          <>
            <p>{t('contactGame.notificationTitle')}</p>
            <p className={styles.notificationUrl}>{url}</p>
            <div className={styles.notificationActions}>
              <button onClick={onAction} className={styles.notificationButton}>
                {t('contactGame.notificationOpen')}
              </button>
              <button onClick={onClose} className={styles.secondaryButton}>
                {t('contactGame.notificationCancel')}
              </button>
            </div>
          </>
        ) : type === 'success' ? (
          <>
            <p>{t('contactGame.notificationSuccess')}</p>
            <p className={styles.notificationUrl}>{url}</p>
          </>
        ) : (
          <p className={styles.successMessage}>{url}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
/**
 * ContactGame - Interactive game where users catch floating logos
 * Logos move around the screen and can be caught by moving them to a drop zone
 * @returns {JSX.Element} Contact game component
 */
function ContactGame() {
  const { t } = useTranslation()

  // ==================== REFS ====================
  const gameContainerRef = useRef(null)
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const hasClickedRef = useRef({ linkedin: false, github: false })
  const logoTouchedRef = useRef({ linkedin: false, github: false })

  // ==================== STATE ====================
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
  const [modalInfo, setModalInfo] = useState(null)

  // ==================== RESPONSIVE CONFIGURATION ====================
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 })

  // Get configuration based on device type
  const config = useMemo(
    () =>
      isMobile
        ? RESPONSIVE_CONFIG.mobile
        : isTablet
        ? RESPONSIVE_CONFIG.tablet
        : RESPONSIVE_CONFIG.desktop,
    [isMobile, isTablet]
  )

  // ==================== LOGO INITIALIZATION ====================
  /**
   * Initialize logo positions and properties
   * @returns {Array} Array of logo objects with initial properties
   */
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

  // Initialize logos when component mounts or config changes
  useEffect(() => {
    setLogos(initializeLogos())
  }, [initializeLogos])

  // ==================== EVENT HANDLERS ====================
  /**
   * Handle notification action button click
   * Tries to open URL in new tab, fallback to current window
   */
  const handleNotificationAction = useCallback(() => {
    if (notification.url) {
      try {
        window.open(notification.url, '_blank', 'noopener,noreferrer')
        setNotification({ show: false, url: null, type: 'error' })
      } catch {
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

  /**
   * Close notification handler
   */
  const closeNotification = useCallback(() => {
    setNotification({ show: false, url: null, type: 'error' })
  }, [])

  // ==================== MOUSE/TOUCH HANDLING ====================
  /**
   * Throttled mouse move handler for performance
   * Updates mouse position for logo repulsion effect
   */
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
      }, 16), // ~60fps
    []
  )

  // Add mouse move listener
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Mobile touch support
  useEffect(() => {
    if (!isMobile) return

    const container = gameContainerRef.current
    if (!container) return

    /**
     * Handle touch move events for mobile devices
     * @param {TouchEvent} e - Touch event
     */
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

  // ==================== WINDOW RESIZE HANDLING ====================
  useEffect(() => {
    /**
     * Handle window resize - keep logos within bounds
     */
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

  // ==================== ANIMATION LOGIC ====================
  /**
   * Update logo position with physics simulation
   * @param {Object} logo - Logo object
   * @param {number} containerWidth - Container width
   * @param {number} containerHeight - Container height
   * @param {Array} otherLogos - Other logos for collision detection
   * @returns {Object} Updated logo object
   */
  const updateLogoPosition = useCallback(
    (logo, containerWidth, containerHeight, otherLogos) => {
      let { x, y, dx, dy, size, baseSpeed } = logo

      // Calculate new position
      let newX = x + dx
      let newY = y + dy
      let newDx = dx
      let newDy = dy

      // Mouse interaction - repulsion effect
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
        // Mark logo as touched by mouse
        logoTouchedRef.current[logo.id] = true

        // Calculate repulsion force
        const angle = Math.atan2(logoCenterY - mouseY, logoCenterX - mouseX)
        const force =
          (1 - distanceToMouse / detectionRadius) *
          ANIMATION_CONFIG.repulsionForce

        newDx += Math.cos(angle) * force
        newDy += Math.sin(angle) * force

        // Limit maximum speed
        const maxSpeed = baseSpeed * ANIMATION_CONFIG.maxSpeedMultiplier
        const currentSpeed = Math.hypot(newDx, newDy)

        if (currentSpeed > maxSpeed) {
          const ratio = maxSpeed / currentSpeed
          newDx *= ratio
          newDy *= ratio
        }
      } else {
        // Speed regulation when not near mouse
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

      // Boundary collision - bounce off edges
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

      // Logo-to-logo collision detection
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

          // Separate overlapping logos
          const angle = Math.atan2(
            newY + size / 2 - other.y - other.size / 2,
            newX + size / 2 - other.x - other.size / 2
          )
          const pushDistance = minDist + separation
          newX =
            other.x + other.size / 2 + Math.cos(angle) * pushDistance - size / 2
          newY =
            other.y + other.size / 2 + Math.sin(angle) * pushDistance - size / 2

          // Keep within bounds after collision
          newX = Math.max(0, Math.min(containerWidth - size, newX))
          newY = Math.max(0, Math.min(containerHeight - size, newY))
        }
      })

      return { ...logo, x: newX, y: newY, dx: newDx, dy: newDy }
    },
    []
  )

  /**
   * Check if logo is in drop zone
   * @param {Object} logo - Logo object
   * @param {number} containerWidth - Container width
   * @param {number} containerHeight - Container height
   * @returns {boolean} True if logo is in drop zone
   */
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

  // ==================== ANIMATION LOOP ====================
  useEffect(() => {
    /**
     * Main animation loop
     * Updates logo positions and checks for drop zone interactions
     */
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

          // Check if logo is in drop zone
          const isInZone = checkDropZone(updatedLogo, width, height)
          tempLogoInZone[logo.id] = isInZone

          // Trigger modal if logo dropped in zone after being touched
          if (
            isInZone &&
            !hasClickedRef.current[logo.id] &&
            logoTouchedRef.current[logo.id]
          ) {
            hasClickedRef.current[logo.id] = true
            setModalInfo({ id: logo.id, url: logo.url })
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
  }, [updateLogoPosition, checkDropZone])

  // ==================== RENDER ====================
  return (
    <div className={styles.gameContainer} ref={gameContainerRef}>
      {/* Drop Zone */}
      <div
        className={`${styles.detectionZone} ${
          logoInZone.linkedin || logoInZone.github ? styles.active : ''
        }`}
        style={{
          width: `${config.detectionZone}px`,
          height: `${config.detectionZone}px`,
        }}
      >
        <span className={styles.zoneText}>{t('contactGame.dropZone')}</span>
      </div>

      {/* Floating Logos */}
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
            aria-label={`Open ${logo.id} profile`}
          >
            {logo.id === 'linkedin' ? (
              <LinkedInIcon size={isMobile ? 20 : 30} />
            ) : (
              <GitHubIcon size={isMobile ? 20 : 30} />
            )}
          </div>
        ))}
      </div>

      {/* Interaction Hint */}
      <div className={styles.interactionHint}>
        <p>{t('contactGame.interactionHint')}</p>
      </div>

      {/* Success Modal */}
      {modalInfo && (
        <DropSuccessModal
          id={modalInfo.id}
          url={modalInfo.url}
          onConfirm={() => {
            hasClickedRef.current[modalInfo.id] = false // Reset for reusability
            setModalInfo(null)
            window.open(modalInfo.url, '_blank', 'noopener,noreferrer')
          }}
          onClose={() => {
            hasClickedRef.current[modalInfo.id] = false // Reset for reusability
            setModalInfo(null)
          }}
        />
      )}

      {/* Popup Blocked Notification */}
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
