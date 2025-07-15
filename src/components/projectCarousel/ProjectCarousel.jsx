import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './projectCarousel.module.scss'

// ===================================
// Constants
// ===================================
const SCROLL_SENSITIVITY = 2 // Multiplier for scroll/drag sensitivity
const SNAP_THRESHOLD = 50 // Minimum distance in pixels to trigger snap
const VELOCITY_THRESHOLD = 0.5 // Minimum velocity to trigger momentum scroll
const DRAG_THRESHOLD = 5 // Minimum movement to consider as drag
const TAP_DURATION = 300 // Maximum duration for a tap (vs drag)
const FOCUS_DELAY = 50 // Delay before focusing element

// Safari detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

/**
 * Custom hook for implementing focus trap within modal
 * Ensures keyboard navigation stays within modal boundaries
 * @param {boolean} isActive - Whether the focus trap is active
 * @param {React.RefObject} modalRef - Reference to the modal element
 */
const useFocusTrap = (isActive, modalRef) => {
  useEffect(() => {
    if (!isActive) return

    const handleTab = (e) => {
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return

      // Find all focusable elements within modal
      const focusableElements = modal.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Trap focus at boundaries
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isActive, modalRef])
}

/**
 * Custom hook for managing browser history with modal state
 * Handles back button to close modal instead of navigating away
 */
const useModalHistory = (isModalOpen, closeModal) => {
  const modalHistoryPushed = useRef(false)

  useEffect(() => {
    if (isModalOpen && !modalHistoryPushed.current) {
      // Push a new history entry when modal opens
      window.history.pushState({ modalOpen: true }, '', window.location.href)
      modalHistoryPushed.current = true
    } else if (!isModalOpen && modalHistoryPushed.current) {
      // Reset flag when modal closes
      modalHistoryPushed.current = false
    }
  }, [isModalOpen])

  useEffect(() => {
    const handlePopState = (event) => {
      if (isModalOpen && modalHistoryPushed.current) {
        // If modal is open and user hits back, close modal
        event.preventDefault()
        closeModal()
        modalHistoryPushed.current = false
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isModalOpen, closeModal])

  return modalHistoryPushed
}

/**
 * ProjectCarousel Component
 * A horizontal scrolling carousel with modal view, keyboard navigation,
 * and touch/mouse drag support
 *
 * @param {Array} cards - Array of React elements to display in modal
 * @param {Array} cardsTitle - Array of titles for carousel items
 * @param {boolean} autoFocus - Whether to auto-focus first item on mount
 */
export default function ProjectCarousel({
  cards = [],
  cardsTitle = [],
  autoFocus = false, // Disabled by default for better UX
}) {
  // ===================================
  // Refs
  // ===================================
  const containerRef = useRef(null) // Main carousel container
  const cardRefs = useRef([]) // Array of card element refs
  const modalRef = useRef(null) // Modal container ref
  const lastFocusedElement = useRef(null) // Store element to restore focus
  const closeButtonRef = useRef(null) // Modal close button ref

  // ===================================
  // State
  // ===================================
  const [focusedIndex, setFocusedIndex] = useState(0) // Currently focused card index
  const [isDragging, setIsDragging] = useState(false) // Drag state
  const [selectedCard, setSelectedCard] = useState(null) // Selected card for modal
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal visibility
  const [showLeftArrow, setShowLeftArrow] = useState(false) // Left arrow visibility
  const [showRightArrow, setShowRightArrow] = useState(true) // Right arrow visibility
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false) // Track keyboard usage

  // ===================================
  // Drag/Swipe tracking variables
  // ===================================
  const dragStartX = useRef(0) // Initial X position
  const dragStartY = useRef(0) // Initial Y position for vertical detection
  const scrollStartX = useRef(0) // Initial scroll position
  const lastMoveTime = useRef(Date.now()) // Time of last move
  const lastMoveX = useRef(0) // Last X position
  const velocity = useRef(0) // Current swipe velocity
  const dragStartTime = useRef(0) // Drag start timestamp
  const hasMoved = useRef(false) // Whether user has moved during drag

  /**
   * Close modal and restore focus to triggering element
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)

    // Delay cleanup to allow animation
    setTimeout(() => {
      setSelectedCard(null)
      document.body.style.overflow = 'unset' // Restore body scroll

      // Restore focus to last focused element
      if (
        lastFocusedElement.current &&
        lastFocusedElement.current.tabIndex === 0
      ) {
        lastFocusedElement.current.focus({ preventScroll: true })
      }
    }, 300)
  }, [])

  // Apply focus trap hook
  useFocusTrap(isModalOpen, modalRef)

  // Apply modal history management hook
  useModalHistory(isModalOpen, closeModal)

  // ===================================
  // Focus Management
  // ===================================

  /**
   * Focus card element with enhanced browser compatibility
   * Only focuses during keyboard navigation to prevent unwanted scrolling
   */
  const focusCard = useCallback(
    (index, force = false) => {
      // Only focus if keyboard navigation or forced
      if (!force && !isKeyboardNavigation) return

      const targetCard = cardRefs.current[index]
      if (!targetCard) return

      const doFocus = () => {
        if (targetCard.tabIndex === 0) {
          targetCard.focus({ preventScroll: true })
          // Retry focus if needed (browser compatibility)
          if (document.activeElement !== targetCard) {
            setTimeout(
              () => targetCard.focus({ preventScroll: true }),
              FOCUS_DELAY
            )
          }
        }
      }

      // Use RAF for smooth focus transition
      requestAnimationFrame(() => {
        setTimeout(doFocus, 10)
      })
    },
    [isKeyboardNavigation]
  )

  /**
   * Update focused card index based on scroll position
   * Determines which card is closest to center of viewport
   */
  const updateFocusedIndex = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerCenter = container.scrollLeft + container.clientWidth / 2
    const items = container.querySelectorAll(`.${styles.carouselItem}`)

    let closestIndex = 0
    let minDistance = Infinity

    // Find card closest to center
    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const distance = Math.abs(containerCenter - itemCenter)

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    // Update tabIndex for accessibility
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === closestIndex ? 0 : -1
      }
    })

    setFocusedIndex(closestIndex)
    setShowLeftArrow(closestIndex > 0)
    setShowRightArrow(closestIndex < cards.length - 1)
  }, [cards.length])

  /**
   * Smoothly scroll to specific card index
   * Centers the target card in viewport
   */
  const scrollToCard = useCallback(
    (index) => {
      const container = containerRef.current
      if (!container) return

      const items = container.querySelectorAll(`.${styles.carouselItem}`)
      const targetItem = items[Math.max(0, Math.min(index, cards.length - 1))]

      if (targetItem) {
        const containerWidth = container.clientWidth
        const itemWidth = targetItem.offsetWidth

        // Calculate scroll position to center the item
        let scrollLeft =
          targetItem.offsetLeft - (containerWidth - itemWidth) / 2

        // Safari fix: ensure we don't scroll past the maximum scroll position
        const maxScrollLeft = container.scrollWidth - containerWidth
        scrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft))

        // For Safari, use a more reliable scroll method
        if (isSafari) {
          // Use requestAnimationFrame for smoother scrolling in Safari
          const startScrollLeft = container.scrollLeft
          const distance = scrollLeft - startScrollLeft
          const duration = 300 // ms
          let startTime = null

          const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime
            const timeElapsed = currentTime - startTime
            const progress = Math.min(timeElapsed / duration, 1)

            // Easing function for smooth animation
            const easeProgress =
              progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress

            container.scrollLeft = startScrollLeft + distance * easeProgress

            if (progress < 1) {
              requestAnimationFrame(animateScroll)
            }
          }

          requestAnimationFrame(animateScroll)
        } else {
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          })
        }
      }
    },
    [cards.length]
  )

  // ===================================
  // Navigation Functions
  // ===================================

  /**
   * Navigate to previous card
   * Wraps to last card if at beginning
   */
  const handlePrevious = useCallback(() => {
    setIsKeyboardNavigation(false) // Reset keyboard flag for button clicks
    const newIndex = focusedIndex > 0 ? focusedIndex - 1 : cards.length - 1

    // Update tabIndex immediately
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === newIndex ? 0 : -1
      }
    })

    setFocusedIndex(newIndex)
    scrollToCard(newIndex)
  }, [focusedIndex, cards.length, scrollToCard])

  /**
   * Navigate to next card
   * Wraps to first card if at end
   */
  const handleNext = useCallback(() => {
    setIsKeyboardNavigation(false) // Reset keyboard flag for button clicks
    const newIndex = focusedIndex < cards.length - 1 ? focusedIndex + 1 : 0

    // Update tabIndex immediately
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === newIndex ? 0 : -1
      }
    })

    setFocusedIndex(newIndex)
    scrollToCard(newIndex)
  }, [focusedIndex, cards.length, scrollToCard])

  /**
   * Open modal with selected card content
   * Stores focus reference for restoration
   */
  const openModal = (index) => {
    lastFocusedElement.current = cardRefs.current[index]
    setSelectedCard(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden' // Prevent body scroll

    // Auto-focus close button only for keyboard users
    if (isKeyboardNavigation) {
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    }
  }

  // ===================================
  // Touch/Mouse Interaction Handlers
  // ===================================

  /**
   * Handle start of drag/swipe gesture
   * Initialize tracking variables
   */
  const handlePointerDown = (e) => {
    setIsDragging(true)
    setIsKeyboardNavigation(false) // User is using mouse/touch

    dragStartX.current = e.clientX || e.touches?.[0]?.clientX
    dragStartY.current = e.clientY || e.touches?.[0]?.clientY
    scrollStartX.current = containerRef.current.scrollLeft
    lastMoveTime.current = Date.now()
    lastMoveX.current = dragStartX.current
    velocity.current = 0
    dragStartTime.current = Date.now()
    hasMoved.current = false

    if (e.cancelable) {
      e.preventDefault()
    }
  }

  /**
   * Handle drag/swipe movement
   * Calculate velocity and update scroll position
   */
  const handlePointerMove = (e) => {
    if (!isDragging) return

    if (e.cancelable) {
      e.preventDefault()
    }

    const currentX = e.clientX || e.touches?.[0]?.clientX
    const deltaX = (dragStartX.current - currentX) * SCROLL_SENSITIVITY

    hasMoved.current = true

    // Calculate velocity for momentum
    const currentTime = Date.now()
    const timeDelta = currentTime - lastMoveTime.current
    if (timeDelta > 0) {
      velocity.current = (currentX - lastMoveX.current) / timeDelta
    }

    lastMoveTime.current = currentTime
    lastMoveX.current = currentX

    // Update scroll position with Safari boundary check
    const container = containerRef.current
    const newScrollLeft = scrollStartX.current + deltaX
    const maxScrollLeft = container.scrollWidth - container.clientWidth

    container.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft))
  }

  /**
   * Handle end of drag/swipe gesture
   * Determine final card position based on velocity and distance
   */
  const handlePointerUp = (e) => {
    if (!isDragging) return

    setIsDragging(false)

    const endX = e.clientX || e.changedTouches?.[0]?.clientX
    const deltaX = dragStartX.current - endX

    // Ignore tiny movements
    if (Math.abs(deltaX) < DRAG_THRESHOLD) return

    // Check if swipe was significant enough
    if (
      Math.abs(deltaX) > SNAP_THRESHOLD ||
      Math.abs(velocity.current) > VELOCITY_THRESHOLD
    ) {
      if (deltaX > 0 || velocity.current < -VELOCITY_THRESHOLD) {
        handleNext()
      } else if (deltaX < 0 || velocity.current > VELOCITY_THRESHOLD) {
        handlePrevious()
      }
    } else {
      // Snap to closest card
      setTimeout(() => {
        updateFocusedIndex()
        scrollToCard(focusedIndex)
      }, 100)
    }
  }

  /**
   * Handle card click/tap
   * Distinguish between tap and drag
   */
  const handleCardClick = (index, e) => {
    const currentTime = Date.now()
    const timeDelta = currentTime - dragStartTime.current

    const deltaX = Math.abs(
      dragStartX.current - (e.clientX || e.changedTouches?.[0]?.clientX || 0)
    )

    // Determine if this was a real tap (not a drag)
    const isRealTap =
      !hasMoved.current &&
      deltaX < 10 &&
      timeDelta < TAP_DURATION &&
      !isDragging

    if (!isRealTap) return

    openModal(index)
  }

  /**
   * Handle keyboard navigation on cards
   * Supports arrow keys, Home, End, Enter, and Space
   */
  const handleCardKeyDown = (index, e) => {
    e.stopPropagation()
    setIsKeyboardNavigation(true) // Mark as keyboard navigation

    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault()
        openModal(index)
        break
      }

      case 'ArrowLeft': {
        e.preventDefault()
        handlePrevious()
        // Focus previous card after navigation
        setTimeout(
          () =>
            focusCard(
              focusedIndex > 0 ? focusedIndex - 1 : cards.length - 1,
              true
            ),
          150
        )
        break
      }

      case 'ArrowRight': {
        e.preventDefault()
        handleNext()
        // Focus next card after navigation
        setTimeout(
          () =>
            focusCard(
              focusedIndex < cards.length - 1 ? focusedIndex + 1 : 0,
              true
            ),
          150
        )
        break
      }

      case 'Home': {
        e.preventDefault()
        // Navigate to first card
        cardRefs.current.forEach((card, i) => {
          if (card) card.tabIndex = i === 0 ? 0 : -1
        })
        setFocusedIndex(0)
        scrollToCard(0)
        setTimeout(() => focusCard(0, true), 150)
        break
      }

      case 'End': {
        e.preventDefault()
        // Navigate to last card
        const lastIndex = cards.length - 1
        cardRefs.current.forEach((card, i) => {
          if (card) card.tabIndex = i === lastIndex ? 0 : -1
        })
        setFocusedIndex(lastIndex)
        scrollToCard(lastIndex)
        setTimeout(() => focusCard(lastIndex, true), 150)
        break
      }
    }
  }

  /**
   * Handle modal keyboard shortcuts
   * Currently supports Escape key
   */
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  /**
   * Handle direct focus on card elements
   * Updates state when user tabs into carousel
   */
  const handleCardFocus = (index) => {
    setIsKeyboardNavigation(true)
    setFocusedIndex(index)
    scrollToCard(index)
  }

  // ===================================
  // Effects
  // ===================================

  /**
   * Scroll event handler
   * Updates focused index with debouncing
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout
    const handleScroll = () => {
      if (!isDragging) {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(updateFocusedIndex, 50)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [updateFocusedIndex, isDragging])

  /**
   * Initial focus setup
   * Only runs if autoFocus prop is true
   */
  useEffect(() => {
    if (autoFocus && cards.length > 0) {
      const initializeFocus = () => {
        const firstCard = cardRefs.current[0]
        if (firstCard) {
          // Set initial tabIndex values
          cardRefs.current.forEach((card, index) => {
            if (card) {
              card.tabIndex = index === 0 ? 0 : -1
            }
          })
          setFocusedIndex(0)
          setIsKeyboardNavigation(true)
          focusCard(0, true)
        } else {
          // Retry if elements not ready
          setTimeout(initializeFocus, 50)
        }
      }

      requestAnimationFrame(initializeFocus)
    }
  }, [autoFocus, cards.length, focusCard])

  /**
   * Update tabindex when focused index changes
   * Ensures only one card is keyboard accessible at a time
   */
  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === focusedIndex ? 0 : -1
      }
    })
  }, [focusedIndex])

  /**
   * Touch event handlers for mobile devices
   * Handles swipe gestures with vertical scroll detection
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    /**
     * Initialize touch tracking
     */
    const handleTouchStart = (e) => {
      setIsDragging(true)
      setIsKeyboardNavigation(false)
      dragStartX.current = e.touches?.[0]?.clientX
      dragStartY.current = e.touches?.[0]?.clientY
      scrollStartX.current = container.scrollLeft
      lastMoveTime.current = Date.now()
      lastMoveX.current = dragStartX.current
      velocity.current = 0
      dragStartTime.current = Date.now()
      hasMoved.current = false
    }

    /**
     * Handle touch movement
     * Differentiates between horizontal swipe and vertical scroll
     */
    const handleTouchMove = (e) => {
      if (!isDragging) return

      const currentX = e.touches?.[0]?.clientX
      const currentY = e.touches?.[0]?.clientY

      // Calculate movement deltas
      const deltaX = dragStartX.current - currentX
      const deltaY = dragStartY.current - currentY

      // If movement is more vertical than horizontal, allow native scroll
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        setIsDragging(false)
        return
      }

      // Prevent vertical scroll and handle horizontal swipe
      e.preventDefault()

      hasMoved.current = true

      // Calculate velocity for momentum
      const currentTime = Date.now()
      const timeDelta = currentTime - lastMoveTime.current
      if (timeDelta > 0) {
        velocity.current = (currentX - lastMoveX.current) / timeDelta
      }

      lastMoveTime.current = currentTime
      lastMoveX.current = currentX

      // Update scroll position with Safari boundary check
      const newScrollLeft = scrollStartX.current + deltaX * SCROLL_SENSITIVITY
      const maxScrollLeft = container.scrollWidth - container.clientWidth

      container.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft))
    }

    /**
     * Handle touch end
     * Determine final position based on gesture
     */
    const handleTouchEnd = (e) => {
      if (!isDragging) return

      setIsDragging(false)

      const endX = e.changedTouches?.[0]?.clientX
      const deltaX = dragStartX.current - endX

      // Ignore tiny movements
      if (Math.abs(deltaX) < DRAG_THRESHOLD) return

      // Check if swipe was significant
      if (
        Math.abs(deltaX) > SNAP_THRESHOLD ||
        Math.abs(velocity.current) > VELOCITY_THRESHOLD
      ) {
        if (deltaX > 0 || velocity.current < -VELOCITY_THRESHOLD) {
          handleNext()
        } else if (deltaX < 0 || velocity.current > VELOCITY_THRESHOLD) {
          handlePrevious()
        }
      } else {
        // Snap to closest card
        setTimeout(() => {
          updateFocusedIndex()
          scrollToCard(focusedIndex)
        }, 100)
      }
    }

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    isDragging,
    handleNext,
    handlePrevious,
    updateFocusedIndex,
    scrollToCard,
    focusedIndex,
  ])

  /**
   * Center first and last items on mount
   * Adds margin to ensure proper centering
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll(`.${styles.carouselItem}`)
    if (items.length > 0) {
      const itemWidth = items[0].offsetWidth
      const containerWidth = container.clientWidth
      const margin = (containerWidth - itemWidth) / 2

      // Add margins to first and last items
      items[0].style.marginLeft = `${margin}px`
      items[items.length - 1].style.marginRight = `${margin}px`

      // Safari specific: Force reflow to ensure proper layout
      if (isSafari) {
        container.style.display = 'none'
        container.offsetHeight // Force reflow
        container.style.display = ''
      }
    }
  }, [cards])

  // ===================================
  // Render
  // ===================================

  return (
    <>
      {/* Main carousel wrapper */}
      <div className={styles.carouselWrapper}>
        {/* Scrollable carousel container */}
        <div
          ref={containerRef}
          className={styles.carouselContainer}
          role="region"
          aria-label="Project carousel"
          aria-roledescription="carousel"
          tabIndex={-1}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          style={{
            // Safari specific styles
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: isSafari ? 'none' : 'x mandatory',
          }}
        >
          {/* Render carousel items */}
          {cardsTitle.map((title, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={styles.carouselItem}
              role="button"
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-label={`Project ${index + 1}: ${title}`}
              aria-selected={index === focusedIndex}
              onClick={(e) => handleCardClick(index, e)}
              onKeyDown={(e) => handleCardKeyDown(index, e)}
              onFocus={() => handleCardFocus(index)}
              style={{
                // Safari specific: Ensure proper flex behavior
                flexShrink: 0,
                scrollSnapAlign: isSafari ? 'none' : 'center',
              }}
            >
              {title}
            </div>
          ))}
        </div>

        {/* Navigation controls */}
        <div className={styles.navigationWrapper}>
          <div className={styles.navigationBar}>
            {/* Previous button */}
            <button
              className={`${styles.arrowButton} ${styles.arrowLeft} ${
                !showLeftArrow ? styles.hidden : ''
              }`}
              onClick={handlePrevious}
              aria-label="Previous project"
              tabIndex={showLeftArrow ? 0 : -1}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Pagination dots */}
            <div className={styles.carouselIndicator} role="tablist">
              {cards.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={index === focusedIndex}
                  aria-label={`Go to project ${index + 1} of ${cards.length}`}
                  className={`${styles.dot} ${
                    index === focusedIndex ? styles.active : ''
                  }`}
                  onClick={() => {
                    setIsKeyboardNavigation(false)
                    scrollToCard(index)
                    setFocusedIndex(index)
                  }}
                  onFocus={() => {
                    setIsKeyboardNavigation(true)
                    setFocusedIndex(index)
                    scrollToCard(index)
                  }}
                  tabIndex={index === focusedIndex ? 0 : -1}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              className={`${styles.arrowButton} ${styles.arrowRight} ${
                !showRightArrow ? styles.hidden : ''
              }`}
              onClick={handleNext}
              aria-label="Next project"
              tabIndex={showRightArrow ? 0 : -1}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Project {focusedIndex + 1} of {cards.length}
        </div>
      </div>

      {/* Modal for full project view */}
      {isModalOpen && (
        <div
          ref={modalRef}
          className={`${styles.modal} ${styles.modalOpen} allowScroll`}
          onClick={closeModal}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={`Project details ${selectedCard + 1}`}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
          >
            {/* Modal close button */}
            <button
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close modal window"
            >
              ×
            </button>
            {/* Modal content */}
            <div className={styles.modalCard}>{cards[selectedCard]}</div>
          </div>
        </div>
      )}
    </>
  )
}
