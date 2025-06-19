import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './projectCarousel.module.scss'

/**
 * ProjectCarousel Component - A horizontal carousel with drag-and-drop,
 * wheel, keyboard navigation and position indicators
 *
 * @param {Array} cards - Array of elements (React components) to display in the carousel
 */
export default function ProjectCarousel({ cards = [] }) {
  // References and state
  const containerRef = useRef(null) // Reference to the carousel container
  const [focusedIndex, setFocusedIndex] = useState(0) // Index of the currently centered card
  const [isDragging, setIsDragging] = useState(false) // Drag-and-drop state
  const dragStartX = useRef(0) // X position at drag start
  const scrollStartX = useRef(0) // Scroll position at drag start
  const hasReachedEnd = useRef(false) // Flag if we reached the end during drag
  const hasReachedStart = useRef(false) // Flag if we reached the start during drag

  /**
   * Updates the index of the card currently in the center of the carousel
   * Calculates which card is closest to the visible center
   */
  const updateFocusedIndex = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Calculate the center of the visible container
    const containerCenter = container.scrollLeft + container.clientWidth / 2
    const items = container.querySelectorAll(`.${styles.carouselItem}`)

    let closestIndex = 0
    let minDistance = Infinity

    // Loop through all cards to find the closest to the center
    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const distance = Math.abs(containerCenter - itemCenter)

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    setFocusedIndex(closestIndex)
  }, [])

  /**
   * Scrolls the carousel to a specific card
   * Centers the target card in the viewport
   *
   * @param {number} index - Index of the card to scroll to
   */
  const scrollToCard = useCallback(
    (index) => {
      const container = containerRef.current
      if (!container) return

      const items = container.querySelectorAll(`.${styles.carouselItem}`)
      // Ensure index is within valid bounds
      const targetItem = items[Math.max(0, Math.min(index, cards.length - 1))]

      if (targetItem) {
        // Calculate position to center the card
        const scrollLeft =
          targetItem.offsetLeft -
          (container.clientWidth - targetItem.offsetWidth) / 2

        // Scroll with smooth animation
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        })
      }
    },
    [cards.length]
  )

  /**
   * Effect to center margins on load
   * Adds margins to first and last card to allow them
   * to be properly centered in the viewport
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const firstItem = container.querySelector(`.${styles.carouselItem}`)
    if (firstItem) {
      // Calculate margin needed to center first/last card
      const margin = (container.clientWidth - firstItem.offsetWidth) / 2
      const items = container.querySelectorAll(`.${styles.carouselItem}`)

      // Apply margins
      items[0].style.marginLeft = `${margin}px`
      items[items.length - 1].style.marginRight = `${margin}px`
    }
  }, [cards])

  /**
   * Effect to handle scroll event
   * Updates focused card index after scrolling
   * Resets end/start flags if we're no longer at the edges
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout
    const handleScroll = () => {
      // Use timeout to wait for scroll to finish
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        updateFocusedIndex()

        const maxScroll = container.scrollWidth - container.clientWidth
        const currentScroll = container.scrollLeft

        // Reset flags if we're in the middle of the carousel
        if (currentScroll > 10 && currentScroll < maxScroll - 10) {
          hasReachedEnd.current = false
          hasReachedStart.current = false
        }
      }, 50)
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [updateFocusedIndex])

  /**
   * Keyboard navigation handler
   * Arrows: navigate between cards with infinite loop
   * Home/End: go to start/end
   */
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          // If at start, go to end (loop)
          if (focusedIndex === 0) {
            scrollToCard(cards.length - 1)
          } else {
            scrollToCard(focusedIndex - 1)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          // If at end, go back to start (loop)
          if (focusedIndex === cards.length - 1) {
            scrollToCard(0)
          } else {
            scrollToCard(focusedIndex + 1)
          }
          break
        case 'Home':
          e.preventDefault()
          scrollToCard(0)
          break
        case 'End':
          e.preventDefault()
          scrollToCard(cards.length - 1)
          break
      }
    },
    [focusedIndex, cards.length, scrollToCard]
  )

  /**
   * Start of drag-and-drop (mouse or touch)
   * Records starting position and initial scroll state
   */
  const handlePointerDown = (e) => {
    setIsDragging(true)
    // Handle both mouse and touch events
    dragStartX.current = e.clientX || e.touches?.[0]?.clientX
    scrollStartX.current = containerRef.current.scrollLeft
    // Reset edge flags
    hasReachedEnd.current = false
    hasReachedStart.current = false
  }

  /**
   * Movement during drag-and-drop
   * Updates scroll position based on movement
   * Blocks scroll at limits and marks if we've reached an edge
   */
  const handlePointerMove = (e) => {
    if (!isDragging) return

    const currentX = e.clientX || e.touches?.[0]?.clientX
    const deltaX = dragStartX.current - currentX
    const container = containerRef.current
    const newScrollLeft = scrollStartX.current + deltaX

    const maxScroll = container.scrollWidth - container.clientWidth

    // Handle scroll limits
    if (newScrollLeft >= maxScroll) {
      // Block at end and mark that we've reached the end
      container.scrollLeft = maxScroll
      hasReachedEnd.current = true
    } else if (newScrollLeft <= 0) {
      // Block at start and mark that we've reached the start
      container.scrollLeft = 0
      hasReachedStart.current = true
    } else {
      // Normal scroll
      container.scrollLeft = newScrollLeft
    }
  }

  /**
   * End of drag-and-drop
   * Checks if we should loop to start/end based on movement
   */
  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false)

      const endX = e.clientX || e.changedTouches?.[0]?.clientX
      const deltaX = dragStartX.current - endX
      const velocity = Math.abs(deltaX) / 300 // Calculate velocity

      // Conditions to trigger loop:
      // 1. Have reached edge during drag
      // 2. Make significant movement (> 50px) in the right direction
      // 3. Have sufficient velocity (> 0.5)
      if (hasReachedEnd.current && deltaX > 50 && velocity > 0.5) {
        // Loop to start if "pulling" right at the end
        scrollToCard(0)
      } else if (hasReachedStart.current && deltaX < -50 && velocity > 0.5) {
        // Loop to end if "pulling" left at the start
        scrollToCard(cards.length - 1)
      }

      // Update index after a short delay
      setTimeout(updateFocusedIndex, 100)
    }
  }

  /**
   * Effect to handle mouse wheel
   * Enables horizontal scrolling and immediate infinite loop at edges
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      // Only handle vertical scroll (deltaY)
      if (e.deltaY !== 0) {
        e.preventDefault()

        const maxScroll = container.scrollWidth - container.clientWidth
        const currentScroll = container.scrollLeft

        // Immediate loop if trying to scroll past the end
        if (currentScroll >= maxScroll - 1 && e.deltaY > 0) {
          scrollToCard(0) // Back to start
        }
        // Immediate loop if trying to scroll before the start
        else if (currentScroll <= 1 && e.deltaY < 0) {
          scrollToCard(cards.length - 1) // Go to end
        }
        // Normal scroll (deltaY * 40 to adjust sensitivity)
        else {
          container.scrollLeft = currentScroll + e.deltaY * 40
        }
      }
    }

    // passive: false to allow preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [cards.length, scrollToCard])

  return (
    <div className={styles.carouselWrapper}>
      {/* Main carousel container */}
      <div
        ref={containerRef}
        className={`${styles.carouselContainer} allowScroll`}
        tabIndex={0} // Enable keyboard navigation
        onKeyDown={handleKeyDown}
        // Mouse events
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp} // Stop drag if mouse leaves
        // Touch events
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none', // Prevent text selection during drag
        }}
      >
        {/* Render cards */}
        {cards.map((card, index) => (
          <div
            key={index}
            className={styles.carouselItem}
            aria-selected={index === focusedIndex} // Accessibility
          >
            {card}
          </div>
        ))}
      </div>

      {/* Position indicators (dots) */}
      <div className={styles.carouselIndicator}>
        {cards.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${
              index === focusedIndex ? styles.active : ''
            }`}
            onClick={() => scrollToCard(index)}
            aria-label={`Go to project ${index + 1}`} // Accessibility
          />
        ))}
      </div>
    </div>
  )
}
