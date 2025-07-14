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

// ==================== SENSITIVITY PARAMETERS ====================
const SENSITIVITY_CONFIG = {
  // Mouse wheel
  wheel: {
    debounceTime: 50, // Minimum delay between wheel events (ms)
    deltaThreshold: 50, // Scroll amount needed for navigation (lower = more sensitive)
    resetTimeout: 1500, // Time before state reset (ms)
  },

  // Touch navigation
  touch: {
    minSwipeDistance: 30, // Minimum distance to detect a swipe (px)
    resetTimeout: 2000, // Time before state reset (ms)
  },

  // Scroll detection
  scroll: {
    epsilon: 5, // Error margin for detecting edges (px)
    navigationCooldown: 800, // Blocking delay after navigation (ms)
    initDelay: 200, // Event initialization delay (ms)
    animationDuration: 1900, // Transition animation duration (ms)
  },
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // References for navigation management
  const mainRef = useRef(null)
  const isNavigatingRef = useRef(false)
  const lastWheelTimeRef = useRef(0)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const touchEndRef = useRef({ x: 0, y: 0 })
  const timeoutRef = useRef(null)

  // NEW REFERENCES: Scroll edge management
  const scrollEndReachedRef = useRef(false)
  const scrollEndTimeoutRef = useRef(null)
  const wheelDeltaAccumulatorRef = useRef(0)

  // ADDED: Reference for scroll activation timer
  const enableScrollTimerRef = useRef(null)

  // State for navigation direction
  const [direction, setDirection] = useState('down')

  /**
   * Gets the current section index based on URL
   */
  const getCurrentSectionIndex = useCallback(() => {
    return SECTIONS.findIndex((section) => section.path === location.pathname)
  }, [location.pathname])

  /**
   * Resets the navigation flag
   */
  const resetNavigation = useCallback(() => {
    isNavigatingRef.current = false
  }, [])

  /**
   * Resets the scroll end state
   */
  const resetScrollEndState = useCallback(() => {
    scrollEndReachedRef.current = false
    wheelDeltaAccumulatorRef.current = 0
  }, [])

  /**
   * Navigates to the next or previous section
   * @param {string} direction - 'up' or 'down'
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

      // Reset scroll end state after navigation
      resetScrollEndState()

      timeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
        timeoutRef.current = null
      }, SENSITIVITY_CONFIG.scroll.navigationCooldown)
    },
    [getCurrentSectionIndex, navigate, resetScrollEndState]
  )

  /**
   * Checks if the target element is within a scrollable area
   */
  const isScrollableArea = (target) => {
    return target.closest('.allowScroll, .features, .scrollable')
  }

  /**
   * Gets scroll information for an element
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
   * Resets navigation state on each route change
   */
  useEffect(() => {
    // Disable scroll during transition
    if (mainRef.current) {
      mainRef.current.style.overflowY = 'hidden'
      mainRef.current.scrollTop = 0
    }

    // Reset scroll end state on page change
    resetScrollEndState()

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current)
      scrollEndTimeoutRef.current = null
    }

    // Cancel previous timer if it exists
    if (enableScrollTimerRef.current) {
      clearTimeout(enableScrollTimerRef.current)
    }

    // Re-enable scroll after animation
    enableScrollTimerRef.current = setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.style.overflowY = 'auto'
      }
      enableScrollTimerRef.current = null
    }, SENSITIVITY_CONFIG.scroll.animationDuration)

    const resetTimer = setTimeout(() => {
      isNavigatingRef.current = false
    }, SENSITIVITY_CONFIG.scroll.initDelay)

    return () => {
      clearTimeout(resetTimer)
      if (enableScrollTimerRef.current) {
        clearTimeout(enableScrollTimerRef.current)
      }
    }
  }, [location.pathname, resetScrollEndState])

  /**
   * Handles mouse wheel navigation with smooth scrolling
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

      // If no scroll possible, direct navigation
      if (!canScroll) {
        e.preventDefault()
        lastWheelTimeRef.current = now
        const direction = e.deltaY > 0 ? 'down' : 'up'
        navigateToSection(direction)
        return
      }

      // If scrollable and not at edges, allow normal scroll
      if (!atBottom && !atTop) {
        // Reset state if scrolling within content
        resetScrollEndState()
        return
      }

      // If at edges
      if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
        e.preventDefault()
        lastWheelTimeRef.current = now

        const direction = e.deltaY > 0 ? 'down' : 'up'

        // If end not yet reached, mark as reached
        if (!scrollEndReachedRef.current) {
          scrollEndReachedRef.current = true
          wheelDeltaAccumulatorRef.current = 0

          // Reset after delay if no other scroll
          if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current)
          }
          scrollEndTimeoutRef.current = setTimeout(() => {
            resetScrollEndState()
          }, SENSITIVITY_CONFIG.wheel.resetTimeout)

          return
        }

        // If already at end, accumulate delta
        wheelDeltaAccumulatorRef.current += Math.abs(e.deltaY)

        // Navigate if enough delta accumulated (equivalent to additional scroll)
        if (
          wheelDeltaAccumulatorRef.current >=
          SENSITIVITY_CONFIG.wheel.deltaThreshold
        ) {
          navigateToSection(direction)
        }

        // Reset timeout
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
   * Handles touch navigation with smooth scrolling
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

      // If no scroll possible, direct navigation
      if (!canScroll) {
        const direction = deltaY < 0 ? 'down' : 'up'
        navigateToSection(direction)
        return
      }

      // If scrollable and not at edges, allow normal scroll
      if (!atBottom && !atTop) {
        resetScrollEndState()
        return
      }

      // If at edges
      const direction = deltaY < 0 ? 'down' : 'up'

      if ((deltaY < 0 && atBottom) || (deltaY > 0 && atTop)) {
        // If end not yet reached, mark as reached
        if (!scrollEndReachedRef.current) {
          scrollEndReachedRef.current = true

          // Reset after delay if no other gesture
          if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current)
          }
          scrollEndTimeoutRef.current = setTimeout(() => {
            resetScrollEndState()
          }, SENSITIVITY_CONFIG.touch.resetTimeout)

          return
        }

        // If already at end, navigate
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
   * Handles keyboard navigation (modified to avoid conflicts with modals)
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isNavigatingRef.current) return

      // Check if active element is in a scrollable area or modal
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

      // If in scrollable area or modal, don't intercept arrow keys
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
