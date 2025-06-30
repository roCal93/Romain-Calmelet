import { Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useRef, useCallback, useState } from 'react'
import { NavigationContext } from './navigationContext'
import Header from '../components/header/Header'
import '../styles/reset.scss'
import '../styles/global.scss'

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

  const touchStartRef = useRef({ x: 0, y: 0 })
  const touchEndRef = useRef({ x: 0, y: 0 })

  const [direction, setDirection] = useState('down')

  const getCurrentSectionIndex = useCallback(() => {
    return SECTIONS.findIndex((section) => section.path === location.pathname)
  }, [location.pathname])

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

      // CORRECTION 1: Déclencher la navigation après avoir défini la direction
      requestAnimationFrame(() => {
        navigate(SECTIONS[nextIndex].path)
      })

      // CORRECTION 2: Ajuster le timeout selon la durée de transition CSS
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 600) // Correspond à la transition CSS de 0.6s
    },
    [getCurrentSectionIndex, navigate]
  )

  // CORRECTION 3: Synchroniser avec le changement de route
  useEffect(() => {
    // Reset du flag de navigation quand la route change effectivement
    const timer = setTimeout(() => {
      isNavigatingRef.current = false
    }, 650) // Légèrement plus long que la transition

    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    const handleWheel = (e) => {
      // Vérifier si on est dans une zone qui doit pouvoir scroller
      if (
        e.target.closest('.allowScroll') ||
        e.target.closest('.features') ||
        e.target.closest('[class*="features"]')
      )
        return

      e.preventDefault()

      // CORRECTION 4: Debounce pour éviter les events multiples
      if (isNavigatingRef.current) return

      const dir = e.deltaY > 0 ? 'down' : 'up'
      navigateToSection(dir)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [navigateToSection])

  useEffect(() => {
    const handleTouchStart = (e) => {
      // CORRECTION 5: Vérifier qu'on n'est pas en train de naviguer
      if (isNavigatingRef.current) return

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchMove = (e) => {
      if (isNavigatingRef.current) return
      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      if (isNavigatingRef.current) return

      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        const dir = deltaY > 0 ? 'up' : 'down'
        navigateToSection(dir)
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
      container.addEventListener('touchend', handleTouchEnd, {
        passive: true,
      })

      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [navigateToSection])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isNavigatingRef.current) return

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
    <NavigationContext.Provider value={{ direction }}>
      <div
        ref={containerRef}
        style={{
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden', // CORRECTION 6: Changer 'auto' en 'hidden' pour éviter le scroll
            transition: 'all 0.6s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            // CORRECTION 7: S'assurer de la position relative pour les animations
            position: 'relative',
          }}
        >
          <Outlet />
        </main>
      </div>
    </NavigationContext.Provider>
  )
}

export default App
