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
  const mainRef = useRef(null) // Référence vers le conteneur principal
  const isNavigatingRef = useRef(false) // Flag pour éviter les navigations multiples
  const lastWheelTimeRef = useRef(0) // Timestamp du dernier événement wheel
  const touchStartRef = useRef({ x: 0, y: 0 }) // Position de début du touch
  const touchEndRef = useRef({ x: 0, y: 0 }) // Position de fin du touch
  const timeoutRef = useRef(null) // Référence du timeout de navigation

  // État pour la direction de navigation (utilisé pour les animations)
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
   * Navigue vers la section suivante ou précédente
   * @param {string} direction - 'up' ou 'down'
   */
  const navigateToSection = useCallback(
    (direction) => {
      // Évite les navigations multiples simultanées
      if (isNavigatingRef.current) return

      const currentIndex = getCurrentSectionIndex()
      if (currentIndex === -1) return

      // Calcule l'index de la section suivante
      let nextIndex
      if (direction === 'down' && currentIndex < SECTIONS.length - 1) {
        nextIndex = currentIndex + 1
      } else if (direction === 'up' && currentIndex > 0) {
        nextIndex = currentIndex - 1
      } else {
        return // Pas de section suivante disponible
      }

      // Active le flag de navigation et met à jour la direction
      setDirection(direction)
      isNavigatingRef.current = true

      // Nettoie le timeout précédent si existant
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Effectue la navigation
      navigate(SECTIONS[nextIndex].path)

      // Réinitialise le flag après un délai pour permettre les transitions
      timeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
        timeoutRef.current = null
      }, 800)
    },
    [getCurrentSectionIndex, navigate]
  )

  /**
   * Vérifie si l'élément cible est dans une zone scrollable
   * @param {Element} target - L'élément cible
   * @returns {boolean}
   */
  const isScrollableArea = (target) => {
    return target.closest('.allowScroll, .features, .scrollable')
  }

  /**
   * Obtient les informations de scroll d'un élément
   * @param {Element} element - L'élément à analyser
   * @returns {Object} Informations de scroll
   */
  const getScrollInfo = (element) => {
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight
    const epsilon = 5 // Marge d'erreur pour les calculs de position

    return {
      scrollTop,
      scrollHeight,
      clientHeight,
      canScroll: scrollHeight - clientHeight > epsilon, // Peut-on scroller ?
      atBottom: scrollTop + clientHeight >= scrollHeight - epsilon, // En bas ?
      atTop: scrollTop <= epsilon, // En haut ?
    }
  }

  /**
   * Réinitialise l'état de navigation à chaque changement de route
   */
  useEffect(() => {
    // Remet le scroll en haut de la nouvelle page
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }

    // Nettoie le timeout en cours
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Réinitialise le flag de navigation après un court délai
    const resetTimer = setTimeout(() => {
      isNavigatingRef.current = false
    }, 200)

    return () => clearTimeout(resetTimer)
  }, [location.pathname])

  /**
   * Gestion de la navigation par molette de souris
   */
  useEffect(() => {
    const handleWheel = (e) => {
      // Bloque si navigation en cours
      if (isNavigatingRef.current) {
        e.preventDefault()
        return
      }

      const el = mainRef.current
      // Ignore si pas d'élément ou si dans une zone scrollable
      if (!el || isScrollableArea(e.target)) return

      // Throttling pour éviter les événements trop fréquents
      const now = Date.now()
      if (now - lastWheelTimeRef.current < 50) {
        e.preventDefault()
        return
      }

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      // Si pas de scroll possible, navigation directe
      if (!canScroll) {
        e.preventDefault()
        lastWheelTimeRef.current = now
        navigateToSection(e.deltaY > 0 ? 'down' : 'up')
        return
      }

      // Si scroll possible mais aux extrémités, navigation vers section suivante
      if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
        e.preventDefault()
        lastWheelTimeRef.current = now
        navigateToSection(e.deltaY > 0 ? 'down' : 'up')
      }
    }

    const el = mainRef.current
    if (!el) return

    // Ajoute l'événement après un délai pour éviter les conflits
    const timer = setTimeout(() => {
      el.addEventListener('wheel', handleWheel, { passive: false })
    }, 200)

    return () => {
      clearTimeout(timer)
      if (el) {
        el.removeEventListener('wheel', handleWheel)
      }
    }
  }, [navigateToSection, location.pathname])

  /**
   * Gestion de la navigation tactile (touch)
   */
  useEffect(() => {
    const handleTouchStart = (e) => {
      // Ignore si dans une zone scrollable
      if (isScrollableArea(e.target)) return

      // Enregistre la position de début
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchEnd = (e) => {
      // Bloque si navigation en cours ou dans une zone scrollable
      if (isNavigatingRef.current || isScrollableArea(e.target)) return

      // Enregistre la position de fin
      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      // Calcule la différence de position
      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y

      // Vérifie si c'est un swipe vertical suffisant
      if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) <= 50) return

      const el = mainRef.current
      if (!el) return

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      // Logique similaire à la molette
      if (!canScroll) {
        navigateToSection(deltaY < 0 ? 'down' : 'up')
      } else if ((deltaY < 0 && atBottom) || (deltaY > 0 && atTop)) {
        navigateToSection(deltaY < 0 ? 'down' : 'up')
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
  }, [navigateToSection, location.pathname])

  /**
   * Gestion de la navigation par clavier
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bloque si navigation en cours
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
          // Va directement à la première section
          e.preventDefault()
          if (currentIndex !== 0) {
            setDirection('up')
            navigate(SECTIONS[0].path)
          }
          break
        case 'End': {
          // Va directement à la dernière section
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
        direction, // Direction de navigation pour les animations
        containerRef: mainRef, // Référence du conteneur pour les composants enfants
        resetNavigation, // Fonction pour réinitialiser la navigation
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
