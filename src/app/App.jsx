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

  // NOUVELLE RÉFÉRENCE: Compteur de tentatives de scroll aux extrémités
  const scrollAttemptRef = useRef({ top: 0, bottom: 0 })
  const resetScrollAttemptTimeoutRef = useRef(null)

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
   * Réinitialise les tentatives de scroll
   */
  const resetScrollAttempts = useCallback(() => {
    scrollAttemptRef.current = { top: 0, bottom: 0 }
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

      // Réinitialise les tentatives de scroll après navigation
      resetScrollAttempts()

      timeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
        timeoutRef.current = null
      }, 800)
    },
    [getCurrentSectionIndex, navigate, resetScrollAttempts]
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
    const epsilon = 5

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

    // Réinitialise les tentatives de scroll lors du changement de page
    resetScrollAttempts()

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const resetTimer = setTimeout(() => {
      isNavigatingRef.current = false
    }, 200)

    return () => clearTimeout(resetTimer)
  }, [location.pathname, resetScrollAttempts])

  /**
   * Gestion de la navigation par molette de souris avec sécurité
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
      if (now - lastWheelTimeRef.current < 50) {
        e.preventDefault()
        return
      }

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      // Si pas de scroll possible, navigation avec sécurité
      if (!canScroll) {
        e.preventDefault()
        lastWheelTimeRef.current = now

        const direction = e.deltaY > 0 ? 'down' : 'up'
        const attemptKey = e.deltaY > 0 ? 'bottom' : 'top'

        // Incrémente le compteur de tentatives
        scrollAttemptRef.current[attemptKey]++

        // Si c'est la deuxième tentative ou plus, navigue
        if (scrollAttemptRef.current[attemptKey] >= 2) {
          navigateToSection(direction)
        }

        // Réinitialise les tentatives après un délai
        if (resetScrollAttemptTimeoutRef.current) {
          clearTimeout(resetScrollAttemptTimeoutRef.current)
        }
        resetScrollAttemptTimeoutRef.current = setTimeout(() => {
          resetScrollAttempts()
        }, 1000) // Reset après 1 seconde d'inactivité

        return
      }

      // Si scroll possible mais aux extrémités, navigation avec sécurité
      if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
        e.preventDefault()
        lastWheelTimeRef.current = now

        const direction = e.deltaY > 0 ? 'down' : 'up'
        const attemptKey = e.deltaY > 0 ? 'bottom' : 'top'

        // Incrémente le compteur de tentatives
        scrollAttemptRef.current[attemptKey]++

        // Si c'est la deuxième tentative ou plus, navigue
        if (scrollAttemptRef.current[attemptKey] >= 2) {
          navigateToSection(direction)
        }

        // Réinitialise les tentatives après un délai
        if (resetScrollAttemptTimeoutRef.current) {
          clearTimeout(resetScrollAttemptTimeoutRef.current)
        }
        resetScrollAttemptTimeoutRef.current = setTimeout(() => {
          resetScrollAttempts()
        }, 1000) // Reset après 1 seconde d'inactivité
      } else {
        // Si on scroll dans le contenu, réinitialise les tentatives
        resetScrollAttempts()
      }
    }

    const el = mainRef.current
    if (!el) return

    const timer = setTimeout(() => {
      el.addEventListener('wheel', handleWheel, { passive: false })
    }, 200)

    return () => {
      clearTimeout(timer)
      if (resetScrollAttemptTimeoutRef.current) {
        clearTimeout(resetScrollAttemptTimeoutRef.current)
      }
      if (el) {
        el.removeEventListener('wheel', handleWheel)
      }
    }
  }, [navigateToSection, location.pathname, resetScrollAttempts])

  /**
   * Gestion de la navigation tactile avec sécurité
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

      if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) <= 30) return

      const el = mainRef.current
      if (!el) return

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      const direction = deltaY < 0 ? 'down' : 'up'
      const attemptKey = deltaY < 0 ? 'bottom' : 'top'

      if (!canScroll || (deltaY < 0 && atBottom) || (deltaY > 0 && atTop)) {
        // Incrémente le compteur de tentatives
        scrollAttemptRef.current[attemptKey]++

        // Si c'est la deuxième tentative ou plus, navigue
        if (scrollAttemptRef.current[attemptKey] >= 2) {
          navigateToSection(direction)
        }

        // Réinitialise les tentatives après un délai
        if (resetScrollAttemptTimeoutRef.current) {
          clearTimeout(resetScrollAttemptTimeoutRef.current)
        }
        resetScrollAttemptTimeoutRef.current = setTimeout(() => {
          resetScrollAttempts()
        }, 1000)
      } else {
        resetScrollAttempts()
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
  }, [navigateToSection, location.pathname, resetScrollAttempts])

  /**
   * Gestion de la navigation par clavier (sans sécurité pour une navigation directe)
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isNavigatingRef.current) return

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
