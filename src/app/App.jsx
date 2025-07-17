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
    debounceTime: 250,
    deltaThreshold: 150,
    resetTimeout: 2000,
    trackpadMultiplier: 0.1,
    // NEW: Trackpad-specific settings to prevent page jumping
    trackpadDebounceTime: 600, // Longer debounce for trackpad
    trackpadDeltaThreshold: 400, // Higher threshold for trackpad
    velocityThreshold: 80, // Minimum velocity to trigger navigation
    velocityWindowTime: 150, // Time window to calculate velocity
  },

  // Touch navigation
  touch: {
    minSwipeDistance: 30,
    resetTimeout: 2000,
  },

  // Scroll detection
  scroll: {
    epsilon: 5,
    navigationCooldown: 1200,
    initDelay: 200,
    animationDuration: 1900,
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

  // Scroll edge management
  const scrollEndReachedRef = useRef(false)
  const scrollEndTimeoutRef = useRef(null)
  const wheelDeltaAccumulatorRef = useRef(0)

  // Scroll direction tracking
  const wheelDirectionRef = useRef(null)

  // Trackpad detection
  const isTrackpadRef = useRef(false)
  const trackpadDetectionRef = useRef(0)

  // Reference for scroll activation timer
  const enableScrollTimerRef = useRef(null)

  // NEW: References to prevent multiple wheel events processing
  const wheelEventQueueRef = useRef([])
  const isProcessingWheelRef = useRef(false)

  // NEW: Velocity tracking to prevent accidental navigation
  const velocityTrackerRef = useRef({
    lastTime: 0,
    lastDelta: 0,
    velocity: 0,
    samples: [],
  })

  // NEW: Last navigation time to prevent rapid consecutive navigations
  const lastNavigationTimeRef = useRef(0)

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
   * Enhanced trackpad detection using deltaMode and patterns
   */
  const detectTrackpad = useCallback((e) => {
    const deltaY = Math.abs(e.deltaY)
    const deltaMode = e.deltaMode

    // deltaMode: 0 = pixels (trackpad), 1 = lines (mouse wheel), 2 = pages
    if (deltaMode === 0) {
      // Pixel mode is typically trackpad
      if (deltaY > 0 && deltaY < 80) {
        trackpadDetectionRef.current = Math.min(
          5,
          trackpadDetectionRef.current + 1
        )
      }
    } else if (deltaMode === 1) {
      // Line mode is typically mouse wheel
      trackpadDetectionRef.current = Math.max(
        0,
        trackpadDetectionRef.current - 2
      )
    }

    // Consider as trackpad if we had 3+ pixel-mode events
    isTrackpadRef.current = trackpadDetectionRef.current >= 3

    // Reset counter gradually
    setTimeout(() => {
      trackpadDetectionRef.current = Math.max(
        0,
        trackpadDetectionRef.current - 1
      )
    }, 1000)
  }, [])

  /**
   * Calculates scroll velocity to prevent accidental navigation
   */
  const calculateVelocity = useCallback((deltaY, currentTime) => {
    const tracker = velocityTrackerRef.current

    // Add new sample
    tracker.samples.push({
      delta: Math.abs(deltaY),
      time: currentTime,
    })

    // Keep only recent samples (within velocity window)
    tracker.samples = tracker.samples.filter(
      (sample) =>
        currentTime - sample.time < SENSITIVITY_CONFIG.wheel.velocityWindowTime
    )

    // Calculate average velocity
    if (tracker.samples.length >= 2) {
      const totalDelta = tracker.samples.reduce(
        (sum, sample) => sum + sample.delta,
        0
      )
      const timeSpan = currentTime - tracker.samples[0].time
      return timeSpan > 0 ? totalDelta / timeSpan : 0
    }

    return 0
  }, [])

  /**
   * Resets the scroll end state
   */
  const resetScrollEndState = useCallback(() => {
    scrollEndReachedRef.current = false
    wheelDeltaAccumulatorRef.current = 0
    wheelDirectionRef.current = null
    velocityTrackerRef.current.samples = []
  }, [])

  /**
   * Navigates to the next or previous section with protection against rapid calls
   */
  const navigateToSection = useCallback(
    (direction) => {
      const now = Date.now()

      // Prevent navigation if too soon after last navigation
      if (
        now - lastNavigationTimeRef.current <
        SENSITIVITY_CONFIG.scroll.navigationCooldown
      ) {
        return
      }

      // Double check to prevent multiple navigations
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

      // Update navigation state
      setDirection(direction)
      isNavigatingRef.current = true
      lastNavigationTimeRef.current = now

      // Reset all wheel-related states immediately
      wheelDeltaAccumulatorRef.current = 0
      isProcessingWheelRef.current = false
      velocityTrackerRef.current.samples = []

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      navigate(SECTIONS[nextIndex].path)

      // Immediate and complete reset after navigation
      resetScrollEndState()
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = null
      }

      // Extended cooldown period
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
   * Enhanced wheel handler with better trackpad support
   */
  useEffect(() => {
    const handleWheel = (e) => {
      // Block immediately if navigation is in progress
      if (isNavigatingRef.current) {
        e.preventDefault()
        wheelEventQueueRef.current = []
        return
      }

      const el = mainRef.current
      if (!el || isScrollableArea(e.target)) return

      // Enhanced trackpad detection
      detectTrackpad(e)

      const now = Date.now()

      // Use different debounce times for trackpad vs mouse wheel
      const debounceTime = isTrackpadRef.current
        ? SENSITIVITY_CONFIG.wheel.trackpadDebounceTime
        : SENSITIVITY_CONFIG.wheel.debounceTime

      // Check debounce
      if (now - lastWheelTimeRef.current < debounceTime) {
        e.preventDefault()
        return
      }

      // Prevent simultaneous processing of wheel events
      if (isProcessingWheelRef.current) {
        e.preventDefault()
        return
      }

      isProcessingWheelRef.current = true

      // Calculate velocity to detect intentional scrolls
      const velocity = calculateVelocity(e.deltaY, now)

      const { canScroll, atBottom, atTop } = getScrollInfo(el)

      // If no scroll possible, direct navigation
      if (!canScroll) {
        e.preventDefault()
        lastWheelTimeRef.current = now
        const direction = e.deltaY > 0 ? 'down' : 'up'
        navigateToSection(direction)
        isProcessingWheelRef.current = false
        return
      }

      // If scrollable and not at edges, allow normal scroll
      if (!atBottom && !atTop) {
        resetScrollEndState()
        isProcessingWheelRef.current = false
        return
      }

      // If at edges
      if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
        e.preventDefault()
        lastWheelTimeRef.current = now

        const direction = e.deltaY > 0 ? 'down' : 'up'

        // If first event at edge
        if (!scrollEndReachedRef.current) {
          scrollEndReachedRef.current = true
          wheelDeltaAccumulatorRef.current = 0
          wheelDirectionRef.current = direction

          // Reset after delay if no other scroll
          if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current)
          }
          scrollEndTimeoutRef.current = setTimeout(() => {
            resetScrollEndState()
          }, SENSITIVITY_CONFIG.wheel.resetTimeout)

          isProcessingWheelRef.current = false
          return
        }

        // Check that direction is consistent
        if (wheelDirectionRef.current !== direction) {
          resetScrollEndState()
          wheelDirectionRef.current = direction
          scrollEndReachedRef.current = true
          wheelDeltaAccumulatorRef.current = 0

          if (scrollEndTimeoutRef.current) {
            clearTimeout(scrollEndTimeoutRef.current)
          }
          scrollEndTimeoutRef.current = setTimeout(() => {
            resetScrollEndState()
          }, SENSITIVITY_CONFIG.wheel.resetTimeout)

          isProcessingWheelRef.current = false
          return
        }

        // Adjust delta based on input type
        let adjustedDelta = Math.abs(e.deltaY)
        if (isTrackpadRef.current) {
          adjustedDelta *= SENSITIVITY_CONFIG.wheel.trackpadMultiplier
        }

        // Accumulate delta
        wheelDeltaAccumulatorRef.current += adjustedDelta

        // Use different thresholds for trackpad vs mouse
        const threshold = isTrackpadRef.current
          ? SENSITIVITY_CONFIG.wheel.trackpadDeltaThreshold
          : SENSITIVITY_CONFIG.wheel.deltaThreshold

        // Check velocity threshold for trackpad (prevents accidental navigation)
        const velocityCheck =
          !isTrackpadRef.current ||
          velocity > SENSITIVITY_CONFIG.wheel.velocityThreshold

        // Navigate if enough delta accumulated AND velocity check passes
        if (wheelDeltaAccumulatorRef.current >= threshold && velocityCheck) {
          // Block navigation immediately
          isNavigatingRef.current = true
          wheelDeltaAccumulatorRef.current = 0

          // Small delay to ensure all queued events are blocked
          setTimeout(() => {
            navigateToSection(direction)
          }, 10)

          isProcessingWheelRef.current = false
          return
        }

        // Reset timeout
        if (scrollEndTimeoutRef.current) {
          clearTimeout(scrollEndTimeoutRef.current)
        }
        scrollEndTimeoutRef.current = setTimeout(() => {
          resetScrollEndState()
        }, SENSITIVITY_CONFIG.wheel.resetTimeout)
      }

      isProcessingWheelRef.current = false
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
  }, [
    navigateToSection,
    location.pathname,
    resetScrollEndState,
    detectTrackpad,
    calculateVelocity,
  ])

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
