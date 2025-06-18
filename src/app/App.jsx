import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useCallback } from 'react'
import Header from '../components/header/Header'
import '../styles/reset.scss'
import '../styles/global.scss'

// Configuration des sections à l'extérieur du composant
const SECTIONS = [
  { path: '/Romain-Calmelet/', id: 'home' },
  { path: '/Romain-Calmelet/presentation', id: 'presentation' },
  { path: '/Romain-Calmelet/portfolio', id: 'portfolio' },
  { path: '/Romain-Calmelet/contact', id: 'contact' },
]

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const isNavigatingRef = useRef(false)

  // Pour la gestion du swipe mobile
  const touchStartRef = useRef({ x: 0, y: 0 })
  const touchEndRef = useRef({ x: 0, y: 0 })

  // Fonction pour obtenir l'index de la section actuelle
  const getCurrentSectionIndex = useCallback(() => {
    return SECTIONS.findIndex((section) => section.path === location.pathname)
  }, [location.pathname])

  // Fonction de navigation commune
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

      // Empêche les navigations multiples pendant la transition
      isNavigatingRef.current = true

      // Navigation vers la nouvelle section
      navigate(SECTIONS[nextIndex].path)

      // Réactive la navigation après un délai
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 800)
    },
    [getCurrentSectionIndex, navigate]
  )

  // Gestion de la navigation au scroll (desktop)
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? 'down' : 'up'
      navigateToSection(direction)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [navigateToSection])

  // Gestion du swipe mobile
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchMove = (e) => {
      // Empêche le scroll par défaut seulement pour la navigation
      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y

      // Détermine si c'est un swipe vertical (et pas horizontal)
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        const direction = deltaY > 0 ? 'up' : 'down'
        navigateToSection(direction)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      })
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [navigateToSection])

  // Gestion de la navigation au clavier (optionnel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        navigateToSection('down')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        navigateToSection('up')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigateToSection])

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Header />
      <main
        style={{
          height: '100%', // Ajustez selon la hauteur de votre header/footer
          overflow: 'hidden',
          transition: 'all 0.6s ease-in-out',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default App
