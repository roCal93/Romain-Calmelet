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
  const lastWheelTimeRef = useRef(0) // Pour le debounce du wheel

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

      // Navigation immédiate avec requestAnimationFrame pour synchronisation
      requestAnimationFrame(() => {
        navigate(SECTIONS[nextIndex].path)
      })

      // Reset du flag après la durée de transition
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 700) // Légèrement plus long que la transition CSS
    },
    [getCurrentSectionIndex, navigate]
  )

  // Synchronisation avec les changements de route
  useEffect(() => {
    const timer = setTimeout(() => {
      isNavigatingRef.current = false
    }, 750)

    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    const handleWheel = (e) => {
      // Vérifier si on est dans une zone scrollable
      if (
        e.target.closest('.allowScroll') ||
        e.target.closest('.features') ||
        e.target.closest('[class*="features"]') ||
        e.target.closest('.scrollable')
      ) {
        return
      }

      e.preventDefault()

      // Debounce pour éviter les events multiples
      const now = Date.now()
      if (now - lastWheelTimeRef.current < 100 || isNavigatingRef.current) {
        return
      }
      lastWheelTimeRef.current = now

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
      if (isNavigatingRef.current) return

      // Vérifier si le touch est dans une zone scrollable
      if (
        e.target.closest('.allowScroll') ||
        e.target.closest('.features') ||
        e.target.closest('.scrollable')
      ) {
        return
      }

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchMove = (e) => {
      if (isNavigatingRef.current) return

      // Ne pas empêcher le scroll dans les zones autorisées
      if (
        e.target.closest('.allowScroll') ||
        e.target.closest('.features') ||
        e.target.closest('.scrollable')
      ) {
        return
      }

      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      if (isNavigatingRef.current) return

      // Vérifier les zones scrollables
      if (
        e.target.closest('.allowScroll') ||
        e.target.closest('.features') ||
        e.target.closest('.scrollable')
      ) {
        return
      }

      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y

      // Seuil minimum pour éviter les micro-mouvements
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 80) {
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

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        navigateToSection('down')
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        navigateToSection('up')
      } else if (e.key === 'Home') {
        e.preventDefault()
        if (getCurrentSectionIndex() !== 0) {
          setDirection('up')
          navigate(SECTIONS[0].path)
        }
      } else if (e.key === 'End') {
        e.preventDefault()
        const lastIndex = SECTIONS.length - 1
        if (getCurrentSectionIndex() !== lastIndex) {
          setDirection('down')
          navigate(SECTIONS[lastIndex].path)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigateToSection, navigate, getCurrentSectionIndex])

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
            overflow: 'hidden',
            transition: 'all 0.6s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
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
