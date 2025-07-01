import {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { useMediaQuery } from 'react-responsive'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'

/**
 * Fonction utilitaire pour limiter la fréquence d'appel d'une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} delay - Délai minimum entre les appels en ms
 * @returns {Function} Fonction throttlée
 */
const throttle = (func, delay) => {
  let lastCall = 0
  return (...args) => {
    const now = new Date().getTime()
    if (now - lastCall < delay) return
    lastCall = now
    return func(...args)
  }
}

/**
 * Détecte si le navigateur est Safari
 * @returns {boolean} True si Safari, false sinon
 */
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1
}

/**
 * Composant Contact avec interaction gamifiée
 * Permet d'accéder aux profils LinkedIn et GitHub via deux modes :
 * - Mode simple : clic direct sur les logos
 * - Mode jeu : guider les logos vers une zone de drop
 */
function Contact() {
  // ==================== ÉTATS ET CONTEXTE ====================

  // État pour l'animation d'entrée de page
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)

  // Références DOM
  const containerRef = useRef(null)
  const linkedinRef = useRef(null)
  const githubRef = useRef(null)
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  // États pour contrôler le jeu
  const [gameStarted, setGameStarted] = useState(false)
  const [userActivated, setUserActivated] = useState(false)

  // États pour gérer les popups bloqués par le navigateur
  const [pendingUrl, setPendingUrl] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationType, setNotificationType] = useState('error')

  // Références pour éviter les clics multiples
  const hasClickedRef = useRef({
    linkedin: false,
    github: false,
  })

  // Références pour suivre si chaque logo a été touché par la souris
  const logoTouchedByMouseRef = useRef({
    linkedin: false,
    github: false,
  })

  // État pour indiquer quand un logo est dans la zone de drop
  const [logoInZone, setLogoInZone] = useState({
    linkedin: false,
    github: false,
  })

  // ==================== CONFIGURATION RESPONSIVE ====================

  // Détection des différentes tailles d'écran
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 })

  // Facteurs de vitesse selon la taille d'écran
  const speedFactor = isMobile ? 0.8 : isTablet ? 0.9 : 1
  const baseSpeed = 4

  // Taille de la zone de détection selon l'écran
  const detectionZoneSize = isMobile ? 120 : 180

  // ==================== POSITIONS STATIQUES ====================

  // Positions initiales des logos (calculées une seule fois)
  const staticPositions = useMemo(
    () => ({
      linkedin: {
        x: isMobile ? window.innerWidth - 90 : window.innerWidth - 110,
        y: isMobile ? window.innerHeight - 300 : window.innerHeight - 380,
      },
      github: {
        x: isMobile ? window.innerWidth - 90 : window.innerWidth - 110,
        y: isMobile ? window.innerHeight - 230 : window.innerHeight - 280,
      },
    }),
    [isMobile]
  )

  // ==================== ÉTAT DES LOGOS ====================

  // Configuration initiale des logos avec leurs propriétés
  const [logos, setLogos] = useState([
    {
      id: 'linkedin',
      x: staticPositions.linkedin.x,
      y: staticPositions.linkedin.y,
      dx: baseSpeed * speedFactor, // Vitesse horizontale
      dy: 1.5 * speedFactor, // Vitesse verticale
      color: 'linkedin',
      size: isMobile ? 40 : 60,
      baseSpeed: baseSpeed * speedFactor,
      url: 'https://www.linkedin.com/in/romain-calmelet',
    },
    {
      id: 'github',
      x: staticPositions.github.x,
      y: staticPositions.github.y,
      dx: -baseSpeed * speedFactor, // Vitesse horizontale négative
      dy: -2.2 * speedFactor, // Vitesse verticale négative
      color: 'github',
      size: isMobile ? 40 : 60,
      baseSpeed: baseSpeed * speedFactor,
      url: 'https://github.com/RoCal93',
    },
  ])

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================

  /**
   * Démarre le mode jeu et repositionne les logos aléatoirement
   */
  const startGame = useCallback(() => {
    setGameStarted(true)
    setUserActivated(true)

    // Stocker le timestamp pour valider l'activation utilisateur
    window.userActivationTime = Date.now()

    // Repositionner les logos à des positions aléatoires
    setLogos((prevLogos) =>
      prevLogos.map((logo) => ({
        ...logo,
        x: Math.random() * (window.innerWidth - logo.size),
        y: Math.random() * (window.innerHeight - logo.size - 200), // Éviter la zone du bas
      }))
    )
  }, [])

  /**
   * Tente d'ouvrir un lien en gérant les popups bloqués
   * @param {string} url - URL à ouvrir
   * @param {string} logoId - Identifiant du logo
   */
  const triggerLinkClick = useCallback(
    (url, logoId) => {
      console.log(`Tentative d'ouverture de ${logoId}: ${url}`)

      const timeSinceActivation = Date.now() - (window.userActivationTime || 0)
      const isRecentlyActivated = timeSinceActivation < 30000 // 30 secondes

      if (userActivated && isRecentlyActivated) {
        // Gestion spécifique pour Safari
        if (isSafari()) {
          window.open(url, '_blank', 'noopener,noreferrer')
          // Afficher une notification sur Safari (popups souvent bloqués)
          setPendingUrl(url)
          setNotificationType('error')
          setShowNotification(true)
        } else {
          // Ouverture normale pour les autres navigateurs
          window.open(url, '_blank', 'noopener,noreferrer')
        }
      } else {
        // Activation utilisateur expirée ou inexistante
        setPendingUrl(url)
        setNotificationType('error')
        setShowNotification(true)
      }
    },
    [userActivated]
  )

  /**
   * Gère les clics directs sur les logos en mode statique
   * @param {string} url - URL à ouvrir
   * @param {string} logoId - Identifiant du logo
   */
  const handleStaticLogoClick = useCallback((url, logoId) => {
    console.log(`Clic direct sur ${logoId}: ${url}`)

    if (isSafari()) {
      window.open(url, '_blank', 'noopener,noreferrer')
      // Notification pour Safari
      setPendingUrl(url)
      setNotificationType('error')
      setShowNotification(true)
    } else {
      // Ouverture directe pour les autres navigateurs
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  /**
   * Gère la navigation au clavier (accessibilité)
   * @param {KeyboardEvent} e - Événement clavier
   * @param {Object} logo - Objet logo
   */
  const handleKeyDown = useCallback(
    (e, logo) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!gameStarted) {
          handleStaticLogoClick(logo.url, logo.id)
        }
      }
    },
    [gameStarted, handleStaticLogoClick]
  )

  /**
   * Gère le clic sur la notification de popup bloqué
   */
  const handleNotificationClick = useCallback(() => {
    if (pendingUrl && notificationType === 'error') {
      try {
        window.open(pendingUrl, '_blank', 'noopener,noreferrer')
        setShowNotification(false)
        setPendingUrl(null)
      } catch (error) {
        console.error('Erreur lors de la seconde tentative:', error)
        // Fallback : demander confirmation pour ouverture dans la même fenêtre
        if (
          window.confirm(
            "Impossible d'ouvrir le lien. Ouvrir dans la fenêtre actuelle ?"
          )
        ) {
          window.location.href = pendingUrl
        }
      }
    }
  }, [pendingUrl, notificationType])

  /**
   * Ferme la notification
   */
  const closeNotification = useCallback(() => {
    setShowNotification(false)
    setPendingUrl(null)
  }, [])

  // ==================== EFFETS ====================

  /**
   * Test de détection des popups bloqués au montage du composant
   */
  useEffect(() => {
    const testPopupBlocker = () => {
      const testWindow = window.open(
        '',
        '',
        'width=1,height=1,top=-100,left=-100'
      )
      if (
        !testWindow ||
        testWindow.closed ||
        typeof testWindow.closed == 'undefined'
      ) {
        console.log('Popups bloqués détectés')
        return true
      }
      testWindow.close()
      return false
    }

    if (testPopupBlocker()) {
      console.log('Note: Les popups semblent être bloqués sur ce navigateur')
    }
  }, [])

  /**
   * Gestion du redimensionnement de fenêtre
   * Recalcule les positions statiques des logos
   */
  useEffect(() => {
    const handleResize = () => {
      const newStaticPositions = {
        linkedin: {
          x: isMobile ? window.innerWidth - 90 : window.innerWidth - 110,
          y: isMobile ? window.innerHeight - 360 : window.innerHeight - 380,
        },
        github: {
          x: isMobile ? window.innerWidth - 90 : window.innerWidth - 110,
          y: isMobile ? window.innerHeight - 260 : window.innerHeight - 280,
        },
      }

      // Mettre à jour les positions seulement si le jeu n'a pas commencé
      if (!gameStarted) {
        setLogos((prevLogos) =>
          prevLogos.map((logo) => ({
            ...logo,
            x: newStaticPositions[logo.id].x,
            y: newStaticPositions[logo.id].y,
          }))
        )
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gameStarted, isMobile])

  /**
   * Gestionnaire de mouvement de souris avec throttle pour les performances
   */
  const handleMouseMove = useMemo(
    () =>
      throttle((e) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }, 16), // ~60fps
    []
  )

  /**
   * Écoute des mouvements de souris en mode jeu
   */
  useEffect(() => {
    if (!gameStarted) return

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [gameStarted, handleMouseMove])

  /**
   * Support du touch pour les appareils mobiles
   */
  useEffect(() => {
    if (!gameStarted || !isMobile) return

    const container = containerRef.current
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
  }, [gameStarted, isMobile])

  /**
   * Mise à jour des propriétés des logos lors du changement de taille d'écran
   */
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

  /**
   * Animation d'entrée de page
   */
  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  /**
   * BOUCLE D'ANIMATION PRINCIPALE
   * Gère le mouvement des logos, les collisions et les interactions
   */
  useEffect(() => {
    if (!gameStarted) return

    /**
     * Vérifie si un logo est dans la zone de détection
     * @param {Object} logo - Objet logo
     * @param {number} containerWidth - Largeur du conteneur
     * @param {number} containerHeight - Hauteur du conteneur
     * @returns {Object} Informations sur la zone
     */
    const checkLogoInDetectionZone = (
      logo,
      containerWidth,
      containerHeight
    ) => {
      const zoneX = containerWidth / 2 - detectionZoneSize / 2
      const zoneY = containerHeight - detectionZoneSize - 80

      const logoCenterX = logo.x + logo.size / 2
      const logoCenterY = logo.y + logo.size / 2

      const isInZone =
        logoCenterX >= zoneX &&
        logoCenterX <= zoneX + detectionZoneSize &&
        logoCenterY >= zoneY &&
        logoCenterY <= zoneY + detectionZoneSize

      return { isInZone, zoneX, zoneY }
    }

    /**
     * Fonction d'animation principale
     * Exécutée à chaque frame pour mettre à jour les positions des logos
     */
    const animate = () => {
      setLogos((prevLogos) => {
        const container = containerRef.current
        if (!container) return prevLogos

        const containerRect = container.getBoundingClientRect()
        const containerWidth = containerRect.width
        const containerHeight = containerRect.height

        const tempLogoInZone = { linkedin: false, github: false }

        const updatedLogos = prevLogos.map((logo, index) => {
          let newX = logo.x + logo.dx
          let newY = logo.y + logo.dy
          let newDx = logo.dx
          let newDy = logo.dy

          // Vérification de la zone de détection
          const { isInZone } = checkLogoInDetectionZone(
            { ...logo, x: newX, y: newY },
            containerWidth,
            containerHeight
          )

          tempLogoInZone[logo.id] = isInZone

          // Déclenchement du clic si le logo est dans la zone et a été touché
          if (isInZone) {
            if (
              !hasClickedRef.current[logo.id] &&
              logoTouchedByMouseRef.current[logo.id]
            ) {
              hasClickedRef.current[logo.id] = true
              triggerLinkClick(logo.url, logo.id)
            }
          } else {
            hasClickedRef.current[logo.id] = false
          }

          // INTERACTION AVEC LA SOURIS
          const mouseX = mouseRef.current.x
          const mouseY = mouseRef.current.y
          const logoCenterX = logo.x + logo.size / 2
          const logoCenterY = logo.y + logo.size / 2

          const distanceToMouse = Math.sqrt(
            Math.pow(mouseX - logoCenterX, 2) +
              Math.pow(mouseY - logoCenterY, 2)
          )

          const detectionRadius = logo.size / 2 + 30

          if (distanceToMouse < detectionRadius && distanceToMouse > 0) {
            // Marquer le logo comme touché par la souris
            logoTouchedByMouseRef.current[logo.id] = true

            // Calcul de la force de répulsion
            const angle = Math.atan2(logoCenterY - mouseY, logoCenterX - mouseX)
            const repulsionForce = (1 - distanceToMouse / detectionRadius) * 3

            newDx += Math.cos(angle) * repulsionForce
            newDy += Math.sin(angle) * repulsionForce

            // Limitation de la vitesse maximale
            const maxSpeed = logo.baseSpeed * 2
            const currentSpeed = Math.sqrt(newDx * newDx + newDy * newDy)

            if (currentSpeed > maxSpeed) {
              newDx = (newDx / currentSpeed) * maxSpeed
              newDy = (newDy / currentSpeed) * maxSpeed
            }
          } else {
            // Régulation de la vitesse quand pas d'interaction
            const currentSpeed = Math.sqrt(newDx * newDx + newDy * newDy)

            if (currentSpeed > logo.baseSpeed) {
              const speedReduction = 0.98
              newDx *= speedReduction
              newDy *= speedReduction
            } else if (currentSpeed < logo.baseSpeed * 0.5) {
              const speedIncrease = 1.1
              newDx *= speedIncrease
              newDy *= speedIncrease
            }
          }

          // GESTION DES REBONDS SUR LES BORDS
          if (newX <= 0 || newX >= containerWidth - logo.size) {
            newDx = -newDx
            newX = Math.max(0, Math.min(containerWidth - logo.size, newX))
            logoTouchedByMouseRef.current[logo.id] = false
          }
          if (newY <= 0 || newY >= containerHeight - logo.size) {
            newDy = -newDy
            newY = Math.max(0, Math.min(containerHeight - logo.size, newY))
            logoTouchedByMouseRef.current[logo.id] = false
          }

          // GESTION DES COLLISIONS ENTRE LOGOS
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
              // Inversion et amortissement de la vitesse
              const tempDx = newDx
              const tempDy = newDy
              newDx = -tempDx * 0.9
              newDy = -tempDy * 0.9

              // Séparation des logos qui se chevauchent
              const angle = Math.atan2(centerY1 - centerY2, centerX1 - centerX2)
              const separationDistance = collisionDistance + 2

              const newCenterX = centerX2 + Math.cos(angle) * separationDistance
              const newCenterY = centerY2 + Math.sin(angle) * separationDistance

              newX = newCenterX - logo.size / 2
              newY = newCenterY - logo.size / 2

              // Vérification des limites après séparation
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

        // Mise à jour de l'état des logos dans la zone
        setLogoInZone(tempLogoInZone)
        return updatedLogos
      })

      // Programmer la prochaine frame
      animationRef.current = requestAnimationFrame(animate)
    }

    // Démarrer l'animation
    animationRef.current = requestAnimationFrame(animate)

    // Nettoyage à la désactivation
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameStarted, detectionZoneSize, triggerLinkClick])

  // ==================== RENDU ====================

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

        {/* ÉCRAN DE DÉMARRAGE */}
        {!gameStarted && (
          <div className={styles.startScreen}>
            <div className={styles.startContent}>
              <h2>Contact Interactif</h2>
              <p>Deux modes pour accéder à mes profils :</p>
              <ul>
                <li>
                  <strong>Mode simple :</strong> Cliquez directement sur les
                  logos en bas à droite
                </li>
                <li>
                  <strong>Mode jeu :</strong> Guidez les logos vers la zone de
                  drop avec votre souris !
                </li>
              </ul>
              <div className={styles.startButtons}>
                <button onClick={startGame} className={styles.startButton}>
                  🎮 Commencer le jeu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ZONE DE DÉTECTION (visible seulement en mode jeu) */}
        {gameStarted && (
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
          </div>
        )}

        {/* LOGOS FLOTTANTS */}
        <div className={styles.floatingLogos}>
          {logos.map((logo) => (
            <div
              key={logo.id}
              ref={logo.id === 'linkedin' ? linkedinRef : githubRef}
              className={`${styles.floatingLogo} ${styles[`${logo.id}Logo`]} ${
                gameStarted && logoInZone[logo.id] ? styles.inZone : ''
              } ${
                gameStarted && logoTouchedByMouseRef.current[logo.id]
                  ? styles.touched
                  : ''
              } ${!gameStarted ? styles.static : ''}`}
              style={{
                left: `${logo.x}px`,
                top: `${logo.y}px`,
                width: `${logo.size}px`,
                height: `${logo.size}px`,
                transition: gameStarted ? 'none' : 'all 0.3s ease',
              }}
              onClick={() =>
                !gameStarted && handleStaticLogoClick(logo.url, logo.id)
              }
              onKeyDown={(e) => handleKeyDown(e, logo)}
              tabIndex={!gameStarted ? 0 : -1}
              role="button"
              aria-label={`Ouvrir le profil ${logo.id}`}
            >
              {/* LOGO LINKEDIN */}
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
                /* LOGO GITHUB */
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

        {/* MESSAGE D'AIDE (visible seulement en mode jeu) */}
        {gameStarted && (
          <div className={styles.interactionHint}>
            <p>
              Approchez votre souris des logos, puis poussez-les dans la zone
              pour ouvrir les liens
            </p>
          </div>
        )}

        {/* NOTIFICATION POUR LES POPUPS BLOQUÉS */}
        {showNotification && (
          <div
            className={`${styles.popupNotification} ${styles[notificationType]}`}
          >
            <div className={styles.notificationContent}>
              {notificationType === 'error' ? (
                <>
                  <p>Votre navigateur a bloqué l'ouverture du lien.</p>
                  <p className={styles.notificationUrl}>{pendingUrl}</p>
                  <div className={styles.notificationActions}>
                    <button
                      onClick={handleNotificationClick}
                      className={styles.notificationButton}
                    >
                      Ouvrir
                    </button>
                    <button
                      onClick={closeNotification}
                      className={styles.secondaryButton}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <p className={styles.successMessage}>{pendingUrl}</p>
              )}
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
      </div>
    </div>
  )
}

export default Contact
