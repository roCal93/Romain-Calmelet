import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useCallback, useState } from 'react'
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

// Configuration simple
const CONFIG = {
  navigationCooldown: 800,
  edgeConfirmationTimeout: 1500, // Temps max pour confirmer la navigation après avoir atteint le bord
  scrollThreshold: 50,
  touchThreshold: 50,
  animationDuration: 1000,
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Références de base
  const mainRef = useRef(null)
  const isNavigatingRef = useRef(false)
  const edgeStateRef = useRef({
    atEdge: false,
    edgeDirection: null,
    lastEdgeTime: 0,
    waitingForConfirmation: false,
  })

  // État pour la direction de navigation
  const [direction, setDirection] = useState('down')

  /**
   * Obtient l'index de la section actuelle
   */
  const getCurrentSectionIndex = useCallback(() => {
    return SECTIONS.findIndex((section) => section.path === location.pathname)
  }, [location.pathname])

  /**
   * Vérifie si on peut scroller dans un élément
   */
  const getScrollInfo = (element) => {
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    const epsilon = 2

    return {
      canScroll: scrollHeight - clientHeight > epsilon,
      atBottom: scrollTop + clientHeight >= scrollHeight - epsilon,
      atTop: scrollTop <= epsilon,
    }
  }

  /**
   * Navigation vers une section
   */
  const navigateToSection = useCallback(
    (direction) => {
      if (isNavigatingRef.current) return

      const currentIndex = getCurrentSectionIndex()
      if (currentIndex === -1) return

      let nextIndex
      if (direction === 'down' && currentIndex < SECTIONS.length - 1) {
        nextIndex = currentIndex + 1
      } else if (direction === 'up' && currentIndex > 0) {
        nextIndex = currentIndex - 1
      } else {
        return
      }

      // Mise à jour de l'état
      setDirection(direction)
      isNavigatingRef.current = true

      // Reset l'état du bord
      edgeStateRef.current = {
        atEdge: false,
        edgeDirection: null,
        lastEdgeTime: 0,
        waitingForConfirmation: false,
      }

      // Navigation
      navigate(SECTIONS[nextIndex].path)

      // Reset après cooldown
      setTimeout(() => {
        isNavigatingRef.current = false
      }, CONFIG.navigationCooldown)
    },
    [getCurrentSectionIndex, navigate]
  )

  /**
   * Vérifie si on est dans une zone scrollable
   */
  const isScrollableArea = (target) => {
    return target.closest('.allowScroll, .features, .scrollable')
  }

  /**
   * Gestionnaire de wheel unifié et simple
   */
  useEffect(() => {
    let wheelGestureTimer = null
    let isInWheelGesture = false

    const handleWheel = (e) => {
      // Bloquer si navigation en cours
      if (isNavigatingRef.current) {
        e.preventDefault()
        return
      }

      // Zones scrollables spéciales
      if (isScrollableArea(e.target)) return

      const el = mainRef.current
      if (!el) return

      // Ignorer les petits mouvements
      if (Math.abs(e.deltaY) < CONFIG.scrollThreshold) return

      const now = Date.now()
      const { canScroll, atBottom, atTop } = getScrollInfo(el)
      const scrollDirection = e.deltaY > 0 ? 'down' : 'up'

      // Cas 1: Page non scrollable → navigation directe
      if (!canScroll) {
        e.preventDefault()
        navigateToSection(scrollDirection)
        return
      }

      // Déterminer si on est au bord dans la direction du scroll
      const currentlyAtEdge =
        (scrollDirection === 'down' && atBottom) ||
        (scrollDirection === 'up' && atTop)

      // Cas 2: Page scrollable
      if (currentlyAtEdge) {
        // Si on est déjà dans un geste wheel continu au bord, on ignore
        if (isInWheelGesture) {
          e.preventDefault()
          return
        }

        // Si on attend déjà une confirmation dans la même direction
        if (
          edgeStateRef.current.waitingForConfirmation &&
          edgeStateRef.current.edgeDirection === scrollDirection &&
          now - edgeStateRef.current.lastEdgeTime <=
            CONFIG.edgeConfirmationTimeout
        ) {
          // Confirmation reçue → navigation
          e.preventDefault()

          // Reset complètement les états avant navigation
          edgeStateRef.current = {
            atEdge: false,
            edgeDirection: null,
            lastEdgeTime: 0,
            waitingForConfirmation: false,
          }

          isInWheelGesture = false
          if (wheelGestureTimer) {
            clearTimeout(wheelGestureTimer)
            wheelGestureTimer = null
          }

          navigateToSection(scrollDirection)
          return
        }

        // Si on vient d'arriver au bord ou c'est une nouvelle direction
        if (
          !edgeStateRef.current.atEdge ||
          edgeStateRef.current.edgeDirection !== scrollDirection ||
          now - edgeStateRef.current.lastEdgeTime >
            CONFIG.edgeConfirmationTimeout
        ) {
          // Première fois au bord → attendre confirmation
          e.preventDefault()
          edgeStateRef.current = {
            atEdge: true,
            edgeDirection: scrollDirection,
            lastEdgeTime: now,
            waitingForConfirmation: true,
          }

          // Marquer qu'on est dans un geste continu
          isInWheelGesture = true
          if (wheelGestureTimer) clearTimeout(wheelGestureTimer)
          wheelGestureTimer = setTimeout(() => {
            isInWheelGesture = false
          }, 300)
          return
        }

        // Sinon on bloque le scroll au bord
        e.preventDefault()
      } else {
        // On n'est pas au bord, on peut scroller normalement
        // Reset l'état si on quitte le bord
        if (edgeStateRef.current.atEdge) {
          edgeStateRef.current = {
            atEdge: false,
            edgeDirection: null,
            lastEdgeTime: 0,
            waitingForConfirmation: false,
          }
        }

        // Reset le geste wheel
        isInWheelGesture = false
        if (wheelGestureTimer) {
          clearTimeout(wheelGestureTimer)
          wheelGestureTimer = null
        }
      }
    }

    const el = mainRef.current
    if (!el) return

    el.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      el.removeEventListener('wheel', handleWheel)
      if (wheelGestureTimer) {
        clearTimeout(wheelGestureTimer)
      }
    }
  }, [navigateToSection])

  /**
   * Gestionnaire tactile simple
   */
  useEffect(() => {
    let touchStart = { x: 0, y: 0 }
    let isSwiping = false

    const handleTouchStart = (e) => {
      if (isScrollableArea(e.target)) return
      touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      isSwiping = true
    }

    const handleTouchEnd = (e) => {
      if (!isSwiping || isNavigatingRef.current || isScrollableArea(e.target)) {
        isSwiping = false
        return
      }

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const deltaY = touchEnd.y - touchStart.y
      const deltaX = touchEnd.x - touchStart.x

      // Ignorer si pas un swipe vertical ou trop petit
      if (
        Math.abs(deltaY) <= Math.abs(deltaX) ||
        Math.abs(deltaY) < CONFIG.touchThreshold
      ) {
        isSwiping = false
        return
      }

      const el = mainRef.current
      if (!el) return

      const now = Date.now()
      const { canScroll, atBottom, atTop } = getScrollInfo(el)
      const swipeDirection = deltaY < 0 ? 'down' : 'up'

      // Page non scrollable → navigation directe
      if (!canScroll) {
        navigateToSection(swipeDirection)
        isSwiping = false
        return
      }

      // Au bord actuellement
      const currentlyAtEdge =
        (swipeDirection === 'down' && atBottom) ||
        (swipeDirection === 'up' && atTop)

      // Page scrollable
      if (currentlyAtEdge) {
        // Si on attend déjà une confirmation dans la même direction
        if (
          edgeStateRef.current.waitingForConfirmation &&
          edgeStateRef.current.edgeDirection === swipeDirection &&
          now - edgeStateRef.current.lastEdgeTime <=
            CONFIG.edgeConfirmationTimeout
        ) {
          // Confirmation reçue → navigation
          navigateToSection(swipeDirection)
        } else {
          // Première fois au bord ou nouvelle direction → attendre confirmation
          edgeStateRef.current = {
            atEdge: true,
            edgeDirection: swipeDirection,
            lastEdgeTime: now,
            waitingForConfirmation: true,
          }
        }
      } else {
        // Pas au bord, reset si nécessaire
        if (edgeStateRef.current.atEdge) {
          edgeStateRef.current = {
            atEdge: false,
            edgeDirection: null,
            lastEdgeTime: 0,
            waitingForConfirmation: false,
          }
        }
      }

      isSwiping = false
    }

    const el = mainRef.current
    if (!el) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      if (el) {
        el.removeEventListener('touchstart', handleTouchStart)
        el.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [navigateToSection])

  /**
   * Navigation au clavier
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isNavigatingRef.current) return

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
          if (getCurrentSectionIndex() !== 0) {
            setDirection('up')
            navigate(SECTIONS[0].path)
          }
          break
        case 'End': {
          e.preventDefault()
          const lastIndex = SECTIONS.length - 1
          if (getCurrentSectionIndex() !== lastIndex) {
            setDirection('down')
            navigate(SECTIONS[lastIndex].path)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateToSection, navigate, getCurrentSectionIndex])

  /**
   * Reset au changement de route
   */
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }

    // Reset tous les états
    edgeStateRef.current = {
      atEdge: false,
      edgeDirection: null,
      lastEdgeTime: 0,
      waitingForConfirmation: false,
    }

    const timer = setTimeout(() => {
      isNavigatingRef.current = false
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <NavigationContext.Provider
      value={{
        direction,
        containerRef: mainRef,
        resetNavigation: () => {
          isNavigatingRef.current = false
        },
      }}
    >
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
