import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { NavigationContext } from './navigationContext'
import Header from '../components/header/Header'
import '../styles/reset.scss'
import '../styles/global.scss'

// Navigation sections configuration
const SECTIONS = [
  { path: '/', id: 'home' },
  { path: '/presentation', id: 'presentation' },
  { path: '/portfolio', id: 'portfolio' },
  { path: '/contact', id: 'contact' },
]

// Configuration optimisée
const CONFIG = {
  navigationCooldown: 800, // Augmenté pour éviter les sauts multiples
  edgeConfirmationTimeout: 600, // Réduit pour une confirmation plus rapide
  scrollThreshold: 30, // Réduit pour une meilleure sensibilité
  touchThreshold: 50,
  wheelGestureTimeout: 400, // Augmenté pour bloquer les gestes longs
  wheelEventCooldown: 100, // Nouveau: cooldown entre événements wheel
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Références consolidées
  const mainRef = useRef(null)
  const navigationStateRef = useRef({
    isNavigating: false,
    lastNavigationTime: 0,
    cooldownTimer: null,
  })

  const wheelStateRef = useRef({
    isInGesture: false,
    gestureTimer: null,
    lastWheelTime: 0,
    lastNavigationDirection: null,
    gestureStartTime: 0,
    totalDelta: 0,
    eventCount: 0,
  })

  const edgeStateRef = useRef({
    isAtEdge: false,
    direction: null,
    timestamp: 0,
    confirmationTimer: null,
  })

  // État pour la direction de navigation
  const [direction, setDirection] = useState('down')

  // Mémorisation de l'index de section actuelle
  const currentSectionIndex = useMemo(() => {
    const index = SECTIONS.findIndex(
      (section) => section.path === location.pathname
    )
    return index
  }, [location.pathname])

  /**
   * Fonction de nettoyage complète
   */
  const cleanupAllStates = useCallback(() => {
    const navState = navigationStateRef.current
    const wheelState = wheelStateRef.current
    const edgeState = edgeStateRef.current

    // Nettoyer les timers
    if (navState.cooldownTimer) {
      clearTimeout(navState.cooldownTimer)
      navState.cooldownTimer = null
    }
    if (wheelState.gestureTimer) {
      clearTimeout(wheelState.gestureTimer)
      wheelState.gestureTimer = null
    }
    if (edgeState.confirmationTimer) {
      clearTimeout(edgeState.confirmationTimer)
      edgeState.confirmationTimer = null
    }

    // Reset des états
    wheelState.isInGesture = false
    wheelState.totalDelta = 0
    wheelState.eventCount = 0
    edgeState.isAtEdge = false
    edgeState.direction = null
  }, [])

  /**
   * Utilitaire pour vérifier si on peut scroller
   */
  const getScrollInfo = useCallback((element) => {
    if (!element) return { canScroll: false, atBottom: false, atTop: true }

    const { scrollTop, scrollHeight, clientHeight } = element
    const epsilon = 3

    return {
      canScroll: scrollHeight - clientHeight > epsilon,
      atBottom: scrollTop + clientHeight >= scrollHeight - epsilon,
      atTop: scrollTop <= epsilon,
    }
  }, [])

  /**
   * Vérification zone scrollable
   */
  const isScrollableArea = useCallback((target) => {
    return target.closest(
      '.allowScroll, .features, .scrollable, input, textarea, select, [contenteditable]'
    )
  }, [])

  /**
   * Navigation optimisée vers une section
   */
  const navigateToSection = useCallback(
    (navDirection) => {
      const navState = navigationStateRef.current
      const now = Date.now()

      // Vérifications préliminaires
      if (navState.isNavigating) {
        return
      }

      if (currentSectionIndex === -1) {
        return
      }

      // Cooldown entre navigations
      if (now - navState.lastNavigationTime < CONFIG.navigationCooldown) {
        return
      }

      // Calcul de la prochaine section
      let nextIndex
      if (
        navDirection === 'down' &&
        currentSectionIndex < SECTIONS.length - 1
      ) {
        nextIndex = currentSectionIndex + 1
      } else if (navDirection === 'up' && currentSectionIndex > 0) {
        nextIndex = currentSectionIndex - 1
      } else {
        return
      }

      const nextSection = SECTIONS[nextIndex]
      if (!nextSection?.path) return

      // Mise à jour des états
      navState.isNavigating = true
      navState.lastNavigationTime = now
      setDirection(navDirection)

      // Nettoyage des autres états
      cleanupAllStates()

      // Navigation
      navigate(nextSection.path)

      // Timer de cooldown
      navState.cooldownTimer = setTimeout(() => {
        navState.isNavigating = false
      }, CONFIG.navigationCooldown)
    },
    [currentSectionIndex, navigate, cleanupAllStates]
  )

  /**
   * Gestionnaire de wheel avec protection renforcée contre les gestes multiples
   */
  useEffect(() => {
    const handleWheel = (e) => {
      const navState = navigationStateRef.current
      const wheelState = wheelStateRef.current
      const edgeState = edgeStateRef.current
      const now = Date.now()

      // Blocages préliminaires
      if (navState.isNavigating || isScrollableArea(e.target)) {
        return
      }

      // Ignorer les petits mouvements
      if (Math.abs(e.deltaY) < CONFIG.scrollThreshold) {
        return
      }

      // Protection contre les événements wheel trop rapprochés
      if (now - wheelState.lastWheelTime < CONFIG.wheelEventCooldown) {
        e.preventDefault()
        return
      }

      const element = mainRef.current
      if (!element) return

      const scrollInfo = getScrollInfo(element)
      const scrollDirection = e.deltaY > 0 ? 'down' : 'up'

      // Détecter si c'est le début d'un nouveau geste
      const isNewGesture =
        !wheelState.isInGesture ||
        now - wheelState.gestureStartTime > CONFIG.wheelGestureTimeout ||
        wheelState.lastNavigationDirection !== scrollDirection

      if (isNewGesture) {
        // Réinitialiser le suivi du geste
        wheelState.gestureStartTime = now
        wheelState.totalDelta = 0
        wheelState.eventCount = 0
        wheelState.lastNavigationDirection = scrollDirection
      }

      // Accumuler les données du geste
      wheelState.totalDelta += Math.abs(e.deltaY)
      wheelState.eventCount++
      wheelState.lastWheelTime = now

      // Page non scrollable → navigation directe (mais avec protection)
      if (!scrollInfo.canScroll) {
        e.preventDefault()

        // Pour les pages non scrollables, on navigue immédiatement mais on bloque les suivants
        if (!wheelState.isInGesture) {
          wheelState.isInGesture = true
          navigateToSection(scrollDirection)

          // Bloquer les événements suivants du même geste
          if (wheelState.gestureTimer) clearTimeout(wheelState.gestureTimer)
          wheelState.gestureTimer = setTimeout(() => {
            wheelState.isInGesture = false
            wheelState.totalDelta = 0
            wheelState.eventCount = 0
          }, CONFIG.wheelGestureTimeout)
        }
        return
      }

      // Détecter si on est au bord
      const atEdge =
        (scrollDirection === 'down' && scrollInfo.atBottom) ||
        (scrollDirection === 'up' && scrollInfo.atTop)

      if (atEdge) {
        e.preventDefault()

        // Si on est déjà en train de traiter un geste, ignorer
        if (wheelState.isInGesture) {
          return
        }

        // Vérifier si on attend déjà une confirmation dans cette direction
        const isAwaitingConfirmation =
          edgeState.isAtEdge &&
          edgeState.direction === scrollDirection &&
          now - edgeState.timestamp <= CONFIG.edgeConfirmationTimeout

        if (isAwaitingConfirmation) {
          // Confirmation reçue → navigation avec protection
          wheelState.isInGesture = true
          navigateToSection(scrollDirection)

          // Bloquer les événements suivants
          if (wheelState.gestureTimer) clearTimeout(wheelState.gestureTimer)
          wheelState.gestureTimer = setTimeout(() => {
            wheelState.isInGesture = false
            wheelState.totalDelta = 0
            wheelState.eventCount = 0
          }, CONFIG.wheelGestureTimeout)

          return
        }

        // Premier passage au bord → attendre confirmation
        edgeState.isAtEdge = true
        edgeState.direction = scrollDirection
        edgeState.timestamp = now

        // Nettoyer le timer précédent
        if (edgeState.confirmationTimer) {
          clearTimeout(edgeState.confirmationTimer)
        }

        // Timer de confirmation
        edgeState.confirmationTimer = setTimeout(() => {
          edgeState.isAtEdge = false
          edgeState.direction = null
        }, CONFIG.edgeConfirmationTimeout)
      } else {
        // Pas au bord, reset de l'état edge si nécessaire
        if (edgeState.isAtEdge) {
          edgeState.isAtEdge = false
          edgeState.direction = null
          if (edgeState.confirmationTimer) {
            clearTimeout(edgeState.confirmationTimer)
            edgeState.confirmationTimer = null
          }
        }

        // Reset du geste wheel si on scroll normalement
        if (wheelState.isInGesture) {
          wheelState.isInGesture = false
          wheelState.totalDelta = 0
          wheelState.eventCount = 0
        }
      }
    }

    const element = mainRef.current
    if (!element) return

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
      cleanupAllStates()
    }
  }, [
    navigateToSection,
    getScrollInfo,
    isScrollableArea,
    cleanupAllStates,
    currentSectionIndex,
  ])

  /**
   * Gestionnaire tactile optimisé
   */
  useEffect(() => {
    let touchStart = { x: 0, y: 0 }
    let touchActive = false

    const handleTouchStart = (e) => {
      if (isScrollableArea(e.target)) return

      const touch = e.touches[0]
      touchStart = { x: touch.clientX, y: touch.clientY }
      touchActive = true
    }

    const handleTouchEnd = (e) => {
      if (
        !touchActive ||
        navigationStateRef.current.isNavigating ||
        isScrollableArea(e.target)
      ) {
        touchActive = false
        return
      }

      const touch = e.changedTouches[0]
      const deltaY = touch.clientY - touchStart.y
      const deltaX = touch.clientX - touchStart.x

      touchActive = false

      // Vérifier que c'est un swipe vertical
      if (
        Math.abs(deltaY) <= Math.abs(deltaX) ||
        Math.abs(deltaY) < CONFIG.touchThreshold
      ) {
        return
      }

      const element = mainRef.current
      if (!element) return

      const scrollInfo = getScrollInfo(element)
      const swipeDirection = deltaY < 0 ? 'down' : 'up'

      // Navigation directe pour pages non scrollables ou si au bord
      if (
        !scrollInfo.canScroll ||
        (swipeDirection === 'down' && scrollInfo.atBottom) ||
        (swipeDirection === 'up' && scrollInfo.atTop)
      ) {
        navigateToSection(swipeDirection)
      }
    }

    const element = mainRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [navigateToSection, getScrollInfo, isScrollableArea, currentSectionIndex])

  /**
   * Navigation clavier optimisée
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (navigationStateRef.current.isNavigating) return

      const activeElement = document.activeElement
      const isInInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.hasAttribute('contenteditable') ||
          activeElement.closest('.allowScroll, .modal, [role="dialog"]'))

      if (isInInput) return

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          navigateToSection('down')
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          navigateToSection('up')
          break
        case 'Home':
          e.preventDefault()
          if (currentSectionIndex !== 0) {
            setDirection('up')
            navigate(SECTIONS[0].path)
          }
          break
        case 'End': {
          e.preventDefault()
          const lastIndex = SECTIONS.length - 1
          if (currentSectionIndex !== lastIndex) {
            setDirection('down')
            navigate(SECTIONS[lastIndex].path)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateToSection, navigate, currentSectionIndex])

  /**
   * Reset au changement de route
   */
  useEffect(() => {
    // Reset scroll position
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }

    // Nettoyage complet des états
    cleanupAllStates()

    // Reset navigation avec un délai minimal
    const timer = setTimeout(() => {
      navigationStateRef.current.isNavigating = false
    }, 50)

    return () => clearTimeout(timer)
  }, [location.pathname, cleanupAllStates])

  // Valeur du contexte mémorisée
  const contextValue = useMemo(
    () => ({
      direction,
      containerRef: mainRef,
      resetNavigation: () => {
        navigationStateRef.current.isNavigating = false
        cleanupAllStates()
      },
      currentSectionIndex,
    }),
    [direction, currentSectionIndex, cleanupAllStates]
  )

  return (
    <NavigationContext.Provider value={contextValue}>
      <div className="app-container">
        <Header />
        <main ref={mainRef} className="main-content">
          <Outlet />
        </main>
      </div>
    </NavigationContext.Provider>
  )
}

export default App
