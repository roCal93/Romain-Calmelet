import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { useMediaQuery } from 'react-responsive'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'

function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)
  const containerRef = useRef(null)
  const linkedinRef = useRef(null)
  const githubRef = useRef(null)
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  // États pour gérer les popups bloqués
  const [pendingUrl, setPendingUrl] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [userHasInteracted, setUserHasInteracted] = useState(false)

  // Refs pour gérer les clics automatiques
  const hasClickedRef = useRef({
    linkedin: false,
    github: false,
  })

  // État pour montrer quand un logo est dans la zone
  const [logoInZone, setLogoInZone] = useState({
    linkedin: false,
    github: false,
  })

  // Détection des différentes tailles d'écran
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 })

  // Facteur de vitesse selon la taille d'écran
  const speedFactor = isMobile ? 0.8 : isTablet ? 0.9 : 1
  const baseSpeed = 4 // Vitesse de base

  // Taille de la zone de détection
  const detectionZoneSize = isMobile ? 120 : 180

  // États des logos
  const [logos, setLogos] = useState([
    {
      id: 'linkedin',
      x: 50,
      y: 50,
      dx: baseSpeed * speedFactor,
      dy: 1.5 * speedFactor,
      color: 'linkedin',
      size: isMobile ? 40 : 60,
      baseSpeed: baseSpeed * speedFactor,
      url: 'https://www.linkedin.com/in/votre-profil', // Remplacez par votre URL
    },
    {
      id: 'github',
      x: 200,
      y: 150,
      dx: -baseSpeed * speedFactor,
      dy: -2.2 * speedFactor,
      color: 'github',
      size: isMobile ? 40 : 60,
      baseSpeed: baseSpeed * speedFactor,
      url: 'https://github.com/votre-username', // Remplacez par votre URL
    },
  ])

  // Détecter la première interaction de l'utilisateur
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserHasInteracted(true)
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  // Fonction améliorée pour ouvrir les liens
  const triggerLinkClick = useCallback((url, logoId) => {
    console.log(`Tentative d'ouverture de ${logoId}: ${url}`)

    // Essayer d'ouvrir dans un nouvel onglet
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')

    // Vérifier si le popup a été bloqué
    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === 'undefined'
    ) {
      console.warn('Popup bloqué, affichage de la notification')

      // Afficher la notification avec le lien en attente
      setPendingUrl(url)
      setShowNotification(true)
    }
  }, [])

  // Gestionnaire pour le clic sur la notification
  const handleNotificationClick = useCallback(() => {
    if (pendingUrl) {
      // Deuxième tentative avec l'action directe de l'utilisateur
      const newWindow = window.open(pendingUrl, '_blank', 'noopener,noreferrer')

      // Si ça échoue encore, on redirige dans le même onglet
      if (!newWindow || newWindow.closed) {
        if (
          window.confirm(
            "Impossible d'ouvrir dans un nouvel onglet. Ouvrir dans la fenêtre actuelle ?"
          )
        ) {
          window.location.href = pendingUrl
        }
      }

      setShowNotification(false)
      setPendingUrl(null)
    }
  }, [pendingUrl])

  // Fermer la notification
  const closeNotification = useCallback(() => {
    setShowNotification(false)
    setPendingUrl(null)
  }, [])

  // Mise à jour de la position de la souris
  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Mise à jour de la vitesse quand la taille d'écran change
  useEffect(() => {
    setLogos((prevLogos) =>
      prevLogos.map((logo) => ({
        ...logo,
        dx:
          logo.dx > 0
            ? Math.abs(logo.dx) * speedFactor
            : -Math.abs(logo.dx) * speedFactor,
        dy:
          logo.dy > 0
            ? Math.abs(logo.dy) * speedFactor
            : -Math.abs(logo.dy) * speedFactor,
        size: isMobile ? 40 : 60,
        baseSpeed: baseSpeed * speedFactor,
      }))
    )
  }, [isMobile, isTablet, speedFactor])

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  // Animation principale
  useEffect(() => {
    // Fonction pour vérifier si un logo est dans la zone de détection
    const checkLogoInDetectionZone = (
      logo,
      containerWidth,
      containerHeight
    ) => {
      // Position du centre de la zone de détection
      const zoneX = containerWidth / 2 - detectionZoneSize / 2
      const zoneY = containerHeight - detectionZoneSize - 80 // 80px du bas

      // Centre du logo
      const logoCenterX = logo.x + logo.size / 2
      const logoCenterY = logo.y + logo.size / 2

      // Vérifier si le centre du logo est dans la zone
      const isInZone =
        logoCenterX >= zoneX &&
        logoCenterX <= zoneX + detectionZoneSize &&
        logoCenterY >= zoneY &&
        logoCenterY <= zoneY + detectionZoneSize

      return { isInZone, zoneX, zoneY }
    }

    const animate = () => {
      setLogos((prevLogos) => {
        const container = containerRef.current
        if (!container) return prevLogos

        const containerRect = container.getBoundingClientRect()
        const containerWidth = containerRect.width
        const containerHeight = containerRect.height

        // Objet temporaire pour stocker l'état des logos dans la zone
        const tempLogoInZone = { linkedin: false, github: false }

        const updatedLogos = prevLogos.map((logo, index) => {
          let newX = logo.x + logo.dx
          let newY = logo.y + logo.dy
          let newDx = logo.dx
          let newDy = logo.dy

          // Vérifier si le logo est dans la zone de détection
          const { isInZone } = checkLogoInDetectionZone(
            { ...logo, x: newX, y: newY },
            containerWidth,
            containerHeight
          )

          tempLogoInZone[logo.id] = isInZone

          if (isInZone) {
            if (!hasClickedRef.current[logo.id]) {
              // Marquer comme cliqué immédiatement pour éviter les multiples déclenchements
              hasClickedRef.current[logo.id] = true

              // Ajouter un délai avant de déclencher le clic
              setTimeout(() => {
                triggerLinkClick(logo.url, logo.id)
              }, 100) // 100ms de délai
            }
          } else {
            // Réinitialiser le flag quand le logo sort de la zone
            hasClickedRef.current[logo.id] = false
          }

          // Vérification de collision avec la souris
          const mouseX = mouseRef.current.x
          const mouseY = mouseRef.current.y

          // Centre du logo
          const logoCenterX = logo.x + logo.size / 2
          const logoCenterY = logo.y + logo.size / 2

          // Distance entre la souris et le centre du logo
          const distanceToMouse = Math.sqrt(
            Math.pow(mouseX - logoCenterX, 2) +
              Math.pow(mouseY - logoCenterY, 2)
          )

          // Zone de détection (rayon du logo + marge)
          const detectionRadius = logo.size / 2 + 30 // 30px de marge

          // Si la souris est proche du logo
          if (distanceToMouse < detectionRadius && distanceToMouse > 0) {
            // Calculer l'angle entre la souris et le centre du logo
            const angle = Math.atan2(logoCenterY - mouseY, logoCenterX - mouseX)

            // Force de répulsion inversement proportionnelle à la distance
            const repulsionForce = (1 - distanceToMouse / detectionRadius) * 3

            // Ajouter la force de répulsion à la vitesse existante
            newDx += Math.cos(angle) * repulsionForce
            newDy += Math.sin(angle) * repulsionForce

            // Limiter la vitesse maximale pour éviter des mouvements trop rapides
            const maxSpeed = logo.baseSpeed * 2
            const currentSpeed = Math.sqrt(newDx * newDx + newDy * newDy)

            if (currentSpeed > maxSpeed) {
              newDx = (newDx / currentSpeed) * maxSpeed
              newDy = (newDy / currentSpeed) * maxSpeed
            }
          } else {
            // Ramener progressivement à la vitesse de base si on est loin de la souris
            const currentSpeed = Math.sqrt(newDx * newDx + newDy * newDy)

            if (currentSpeed > logo.baseSpeed) {
              // Réduire progressivement la vitesse
              const speedReduction = 0.98
              newDx *= speedReduction
              newDy *= speedReduction
            } else if (currentSpeed < logo.baseSpeed * 0.5) {
              // Augmenter la vitesse si elle est trop faible
              const speedIncrease = 1.1
              newDx *= speedIncrease
              newDy *= speedIncrease
            }
          }

          // Rebond sur les bords (avec conservation de la vitesse)
          if (newX <= 0 || newX >= containerWidth - logo.size) {
            newDx = -newDx
            newX = Math.max(0, Math.min(containerWidth - logo.size, newX))
          }
          if (newY <= 0 || newY >= containerHeight - logo.size) {
            newDy = -newDy
            newY = Math.max(0, Math.min(containerHeight - logo.size, newY))
          }

          // Vérification des collisions avec les autres logos
          const otherLogos = prevLogos.filter((_, i) => i !== index)
          otherLogos.forEach((otherLogo) => {
            const centerX1 = newX + logo.size / 2
            const centerY1 = newY + logo.size / 2
            const centerX2 = otherLogo.x + otherLogo.size / 2
            const centerY2 = otherLogo.y + otherLogo.size / 2

            const distance = Math.sqrt(
              Math.pow(centerX1 - centerX2, 2) +
                Math.pow(centerY1 - centerY2, 2)
            )

            const collisionDistance = logo.size / 2 + otherLogo.size / 2

            if (distance < collisionDistance) {
              // Échange des vitesses pour un rebond plus réaliste
              const tempDx = newDx
              const tempDy = newDy
              newDx = -tempDx * 0.9 // Légère perte d'énergie
              newDy = -tempDy * 0.9

              const angle = Math.atan2(centerY1 - centerY2, centerX1 - centerX2)
              const separationDistance = collisionDistance + 2

              const newCenterX = centerX2 + Math.cos(angle) * separationDistance
              const newCenterY = centerY2 + Math.sin(angle) * separationDistance

              newX = newCenterX - logo.size / 2
              newY = newCenterY - logo.size / 2

              newX = Math.max(0, Math.min(containerWidth - logo.size, newX))
              newY = Math.max(0, Math.min(containerHeight - logo.size, newY))
            }
          })

          return {
            ...logo,
            x: newX,
            y: newY,
            dx: newDx,
            dy: newDy,
          }
        })

        // Mettre à jour l'état des logos dans la zone
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
  }, [detectionZoneSize, triggerLinkClick])

  return (
    <div
      className={`page-container ${
        isVisible
          ? direction === 'down'
            ? 'page-enter-down'
            : 'page-enter-up'
          : ''
      }`}
    >
      <div className={styles.container} ref={containerRef}>
        <ArrowUp />

        {/* Zone de détection */}
        <div
          className={`${styles.detectionZone} ${
            logoInZone.linkedin || logoInZone.github ? styles.active : ''
          }`}
          style={{
            width: `${detectionZoneSize}px`,
            height: `${detectionZoneSize}px`,
          }}
        >
          <span className={styles.zoneText}>Drop Zone</span>
          <div className={styles.cornerTopLeft}></div>
          <div className={styles.cornerTopRight}></div>
          <div className={styles.cornerBottomLeft}></div>
          <div className={styles.cornerBottomRight}></div>
        </div>

        {/* Logos animés avec collision */}
        <div className={styles.floatingLogos}>
          {logos.map((logo) => (
            <div
              key={logo.id}
              ref={logo.id === 'linkedin' ? linkedinRef : githubRef}
              className={`${styles.floatingLogo} ${styles[`${logo.id}Logo`]} ${
                logoInZone[logo.id] ? styles.inZone : ''
              }`}
              style={{
                left: `${logo.x}px`,
                top: `${logo.y}px`,
                width: `${logo.size}px`,
                height: `${logo.size}px`,
                transition: 'none',
              }}
            >
              {logo.id === 'linkedin' ? (
                <svg
                  width={isMobile ? '20' : '30'}
                  height={isMobile ? '20' : '30'}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              ) : (
                <svg
                  width={isMobile ? '20' : '30'}
                  height={isMobile ? '20' : '30'}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Notification pour les popups bloqués */}
        {showNotification && (
          <div className={styles.popupNotification}>
            <div className={styles.notificationContent}>
              <p>Le lien a été bloqué par votre navigateur.</p>
              <p className={styles.notificationUrl}>{pendingUrl}</p>
              <div className={styles.notificationActions}>
                <button
                  onClick={handleNotificationClick}
                  className={styles.notificationButton}
                >
                  Ouvrir le lien
                </button>
                <button
                  onClick={closeNotification}
                  className={styles.secondaryButton}
                >
                  Annuler
                </button>
              </div>
            </div>
            <button
              onClick={closeNotification}
              className={styles.closeButton}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Message d'aide si l'utilisateur n'a pas encore interagi */}
        {!userHasInteracted && (
          <div className={styles.interactionHint}>
            <p>Cliquez n'importe où pour activer les liens</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Contact
