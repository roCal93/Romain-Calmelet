import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useCallback, useState } from 'react'
import { NavigationContext } from './navigationContext'
import Header from '../components/header/Header'
import '../styles/reset.scss'
import '../styles/global.scss'

// Configuration des sections de navigation
const SECTIONS = [
  { path: '/Romain-Calmelet/', id: 'home' },
  { path: '/Romain-Calmelet/presentation', id: 'presentation' },
  { path: '/Romain-Calmelet/portfolio', id: 'portfolio' },
  { path: '/Romain-Calmelet/contact', id: 'contact' },
]

// ==================== PARAMÈTRES DE SENSIBILITÉ ====================
const SENSITIVITY_CONFIG = {
  // Molette de souris
  wheel: {
    debounceTime: 50, // Délai minimum entre les événements wheel (ms)
    deltaThreshold: 50, // Quantité de scroll nécessaire pour navigation (plus bas = plus sensible)
    resetTimeout: 1500, // Temps avant réinitialisation de l'état (ms)
  },

  // Navigation tactile
  touch: {
    minSwipeDistance: 30, // Distance minimale pour détecter un swipe (px)
    resetTimeout: 2000, // Temps avant réinitialisation de l'état (ms)
  },

  // Détection de scroll
  scroll: {
    epsilon: 5, // Marge d'erreur pour détecter les extrémités (px)
    navigationCooldown: 800, // Délai de blocage après navigation (ms)
    initDelay: 200, // Délai d'initialisation des événements (ms)
  },
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Références pour la gestion de la navigation
  const mainRef = useRef(null)
  const isNavigatingRef = useRef(false)
  const lastWheelTimeRef = useRef(0)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const touchEndRef = useRef({ x: 0, y: 0 })
  const timeoutRef = useRef(null)

  // NOUVELLES RÉFÉRENCES: Gestion du scroll aux extrémités
  const scrollEndReachedRef = useRef(false)
  const scrollEndTimeoutRef = useRef(null)
  const wheelDeltaAccumulatorRef = useRef(0)

  // État pour la direction de navigation
  const [direction, setDirection] = useState('down')

  /**
   * Obtient l'index de la section actuelle basé sur l'URL
   */
  const getCurrentSectionIndex = useCallback(() => {
    return SECTIONS.findIndex((section) => section.path === location.pathname)
  }, [location.pathname])

  /**
   * Réinitialise le flag de navigation
   */
  const resetNavigation = useCallback(() => {
    isNavigatingRef.current = false
  }, [])

  /**
   * Réinitialise l'état de fin de scroll
   */
  const resetScrollEndState = useCallback(() => {
    scrollEndReachedRef.current = false
    wheelDeltaAccumulatorRef.current = 0
  }, [])

  /**
   * Navigue vers la section suivante ou précédente
   * @param {string} direction - 'up' ou 'down'
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

      setDirection(direction)
      isNavigatingRef.current = true

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      navigate(SECTIONS[nextIndex].path)

      // Réinitialise l'état de fin de scroll après navigation
      resetScrollEndState()

      timeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
        timeoutRef.current = null
      }, SENSITIVITY_CONFIG.scroll.navigationCooldown)
    },
    [getCurrentSectionIndex, navigate, resetScrollEndState]
  )

  /**
   * Vérifie si l'élément cible est dans une zone scrollable
   */
  const isScrollableArea = (target) => {
    return target.closest('.allowScroll, .features, .scrollable')
  }

  /**
   * Obtient les informations de scroll d'un élément
   */
  const getScrollInfo = (element) => {
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    const epsilon = SENSITIVITY_CONFIG.scroll.epsilon

    return {
      scrollTop,
      scrollHeight,
      clientHeight,
      canScroll: scrollHeight - clientHeight > epsilon,
      atBottom: scrollTop + clientHeight >= scrollHeight - epsilon,
      atTop: scrollTop <= epsilon,
    }
  }

  /**
   * Réinitialise l'état de navigation à chaque changement de route
   */
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }

    // Réinitialise l'état de fin de scroll lors du changement de page
    resetScrollEndState()

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current)
      scrollEndTimeoutRef.current = null
    }

    const resetTimer = setTimeout(() => {
      isNavigatingRef.current = false
    }, SENSITIVITY_CONFIG.scroll.initDelay)

    return () => clearTimeout(resetTimer)
  }, [location.pathname, resetScrollEndState])

  /**
   * Gestion de la navigation par molette de souris avec scroll fluide
   */
  useEffect(() => {
    const handleWheel = (e) => {
      if (isNavigatingRef.current) {
        e.preventDefault()
        return
      }

      const el = mainRef.current
      if (!el || isScrollableArea(e.target)) return

      const now = Date.now()
      if (
        now - lastWheelTimeRef.current <
        SENSITIVITY_CONFIG.wheel.debounceTime
      ) {
        e.preventDefault()
        return
      }

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      // Si pas de scroll possible, navigation directe
      if (!canScroll) {
        e.preventDefault()
        lastWheelTimeRef.current = now
        const direction = e.deltaY > 0 ? 'down' : 'up'
        navigateToSection(direction)
        return
      }

      // Si on peut scroller et qu'on n'est pas aux extrémités, permettre le scroll normal
      if (!atBottom && !atTop) {
        // Réinitialise l'état si on scroll dans le contenu
        resetScrollEndState()
        return
      }

      // Si on est aux extrémités
      if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
        e.preventDefault()
        lastWheelTimeRef.current = now

        const direction = e.deltaY > 0 ? 'down' : 'up'

        // Si on n'a pas encore atteint la fin, marquer comme atteint
        if (!scrollEndReachedRef.current) {
          scrollEndReachedRef.current = true
          wheelDeltaAccumulatorRef.current = 0

          // Réinitialise après un délai si pas d'autre scroll
          if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current)
          }
          scrollEndTimeoutRef.current = setTimeout(() => {
            resetScrollEndState()
          }, SENSITIVITY_CONFIG.wheel.resetTimeout)

          return
        }

        // Si on a déjà atteint la fin, accumuler le delta
        wheelDeltaAccumulatorRef.current += Math.abs(e.deltaY)

        // Navigue si assez de delta accumulé (équivalent à un scroll supplémentaire)
        if (
          wheelDeltaAccumulatorRef.current >=
          SENSITIVITY_CONFIG.wheel.deltaThreshold
        ) {
          navigateToSection(direction)
        }

        // Réinitialise le timeout
        if (scrollEndTimeoutRef.current) {
          clearTimeout(scrollEndTimeoutRef.current)
        }
        scrollEndTimeoutRef.current = setTimeout(() => {
          resetScrollEndState()
        }, SENSITIVITY_CONFIG.wheel.resetTimeout)
      }
    }

    const el = mainRef.current
    if (!el) return

    const timer = setTimeout(() => {
      el.addEventListener('wheel', handleWheel, { passive: false })
    }, SENSITIVITY_CONFIG.scroll.initDelay)

    return () => {
      clearTimeout(timer)
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current)
      }
      if (el) {
        el.removeEventListener('wheel', handleWheel)
      }
    }
  }, [navigateToSection, location.pathname, resetScrollEndState])

  /**
   * Gestion de la navigation tactile avec scroll fluide
   */
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (isScrollableArea(e.target)) return

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchEnd = (e) => {
      if (isNavigatingRef.current || isScrollableArea(e.target)) return

      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y

      if (
        Math.abs(deltaY) <= Math.abs(deltaX) ||
        Math.abs(deltaY) <= SENSITIVITY_CONFIG.touch.minSwipeDistance
      )
        return

      const el = mainRef.current
      if (!el) return

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      // Si pas de scroll possible, navigation directe
      if (!canScroll) {
        const direction = deltaY < 0 ? 'down' : 'up'
        navigateToSection(direction)
        return
      }

      // Si on peut scroller et qu'on n'est pas aux extrémités, permettre le scroll normal
      if (!atBottom && !atTop) {
        resetScrollEndState()
        return
      }

      // Si on est aux extrémités
      const direction = deltaY < 0 ? 'down' : 'up'

      if ((deltaY < 0 && atBottom) || (deltaY > 0 && atTop)) {
        // Si on n'a pas encore atteint la fin, marquer comme atteint
        if (!scrollEndReachedRef.current) {
          scrollEndReachedRef.current = true

          // Réinitialise après un délai si pas d'autre geste
          if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current)
          }
          scrollEndTimeoutRef.current = setTimeout(() => {
            resetScrollEndState()
          }, SENSITIVITY_CONFIG.touch.resetTimeout)

          return
        }

        // Si on a déjà atteint la fin, naviguer
        navigateToSection(direction)
      } else {
        resetScrollEndState()
      }
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
  }, [navigateToSection, location.pathname, resetScrollEndState])

  /**
   * Gestion de la navigation par clavier (modifiée pour éviter les conflits avec les modales)
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isNavigatingRef.current) return

      // Vérifier si l'élément actif est dans une zone scrollable ou une modale
      const activeElement = document.activeElement
      const isInScrollableArea =
        activeElement &&
        (activeElement.closest(
          '.allowScroll, .features, .scrollable, .modal, .project-modal, [role="dialog"]'
        ) ||
          activeElement.tagName === 'UL' ||
          activeElement.tagName === 'LI' ||
          activeElement.hasAttribute('tabindex') ||
          activeElement.closest('[tabindex]'))

      // Si on est dans une zone scrollable ou une modale, ne pas intercepter les flèches
      if (isInScrollableArea) {
        return
      }

      const currentIndex = getCurrentSectionIndex()

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
          if (currentIndex !== 0) {
            setDirection('up')
            navigate(SECTIONS[0].path)
          }
          break
        case 'End': {
          e.preventDefault()
          const lastIndex = SECTIONS.length - 1
          if (currentIndex !== lastIndex) {
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

  return (
    <NavigationContext.Provider
      value={{
        direction,
        containerRef: mainRef,
        resetNavigation,
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
