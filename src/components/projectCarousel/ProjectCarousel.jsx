import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './projectCarousel.module.scss'

const SCROLL_SENSITIVITY = 2
const SNAP_THRESHOLD = 50
const VELOCITY_MULTIPLIER = 2

/**
 * ProjectCarousel Component - A horizontal carousel with improved touch navigation
 */
export default function ProjectCarousel({ cards = [], cardsTitle = [] }) {
  const containerRef = useRef(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Variables pour le drag
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const lastMoveTime = useRef(Date.now())
  const lastMoveX = useRef(0)
  const velocity = useRef(0)

  // Nouvelles variables pour détecter tap vs swipe
  const dragStartTime = useRef(0)
  const hasMoved = useRef(false)

  /**
   * Updates the focused card index
   */
  const updateFocusedIndex = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerCenter = container.scrollLeft + container.clientWidth / 2
    const items = container.querySelectorAll(`.${styles.carouselItem}`)

    let closestIndex = 0
    let minDistance = Infinity

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const distance = Math.abs(containerCenter - itemCenter)

      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    setFocusedIndex(closestIndex)
    setShowLeftArrow(closestIndex > 0)
    setShowRightArrow(closestIndex < cards.length - 1)
  }, [cards.length])

  /**
   * Scrolls to a specific card with smooth animation
   */
  const scrollToCard = useCallback(
    (index) => {
      const container = containerRef.current
      if (!container) return

      const items = container.querySelectorAll(`.${styles.carouselItem}`)
      const targetItem = items[Math.max(0, Math.min(index, cards.length - 1))]

      if (targetItem) {
        const scrollLeft =
          targetItem.offsetLeft -
          (container.clientWidth - targetItem.offsetWidth) / 2

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        })
      }
    },
    [cards.length]
  )

  /**
   * Navigation functions
   */
  const handlePrevious = useCallback(() => {
    const newIndex = focusedIndex > 0 ? focusedIndex - 1 : cards.length - 1
    scrollToCard(newIndex)
  }, [focusedIndex, cards.length, scrollToCard])

  const handleNext = useCallback(() => {
    const newIndex = focusedIndex < cards.length - 1 ? focusedIndex + 1 : 0
    scrollToCard(newIndex)
  }, [focusedIndex, cards.length, scrollToCard])

  /**
   * Handle touch/mouse start
   */
  const handlePointerDown = (e) => {
    setIsDragging(true)
    dragStartX.current = e.clientX || e.touches?.[0]?.clientX
    scrollStartX.current = containerRef.current.scrollLeft
    lastMoveTime.current = Date.now()
    lastMoveX.current = dragStartX.current
    velocity.current = 0

    // Nouvelles variables pour détecter le tap vs swipe
    dragStartTime.current = Date.now()
    hasMoved.current = false

    // Prevent text selection seulement si possible
    if (e.cancelable) {
      e.preventDefault()
    }
  }

  /**
   * Handle touch/mouse move with improved sensitivity
   */
  const handlePointerMove = (e) => {
    if (!isDragging) return

    // Essayer preventDefault seulement si l'événement le permet
    if (e.cancelable) {
      e.preventDefault()
    }

    const currentX = e.clientX || e.touches?.[0]?.clientX
    const deltaX = (dragStartX.current - currentX) * SCROLL_SENSITIVITY

    // Marquer qu'il y a eu un mouvement
    hasMoved.current = true

    // Calculate velocity for momentum
    const currentTime = Date.now()
    const timeDelta = currentTime - lastMoveTime.current
    if (timeDelta > 0) {
      velocity.current = (currentX - lastMoveX.current) / timeDelta
    }

    lastMoveTime.current = currentTime
    lastMoveX.current = currentX

    containerRef.current.scrollLeft = scrollStartX.current + deltaX
  }

  /**
   * Handle touch/mouse end with snap and momentum
   */
  const handlePointerUp = (e) => {
    if (!isDragging) return

    setIsDragging(false)

    const endX = e.clientX || e.changedTouches?.[0]?.clientX
    const deltaX = dragStartX.current - endX

    // If it's a tap, not a swipe
    if (Math.abs(deltaX) < 5) return

    // Determine if we should snap to next/previous card
    if (Math.abs(deltaX) > SNAP_THRESHOLD || Math.abs(velocity.current) > 0.5) {
      if (deltaX > 0 || velocity.current < -0.5) {
        // Swipe left - go to next card
        handleNext()
      } else if (deltaX < 0 || velocity.current > 0.5) {
        // Swipe right - go to previous card
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
   * Handle card click - version améliorée pour détecter tap vs swipe
   */
  const handleCardClick = (index, e) => {
    const currentTime = Date.now()
    const timeDelta = currentTime - dragStartTime.current

    const deltaX = Math.abs(
      dragStartX.current - (e.clientX || e.changedTouches?.[0]?.clientX || 0)
    )

    // Conditions strictes pour détecter un vrai tap :
    // 1. Pas de mouvement détecté (hasMoved = false)
    // 2. Distance faible (deltaX < 10)
    // 3. Durée courte (< 300ms)
    // 4. Pas en cours de drag
    const isRealTap =
      !hasMoved.current && deltaX < 10 && timeDelta < 300 && !isDragging

    if (!isRealTap) return

    setSelectedCard(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  /**
   * Close modal
   */
  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedCard(null)
      document.body.style.overflow = 'unset'
      containerRef.current?.focus()
    }, 300)
  }

  /**
   * Keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case 'Home':
          e.preventDefault()
          scrollToCard(0)
          break
        case 'End':
          e.preventDefault()
          scrollToCard(cards.length - 1)
          break
        case 'Escape':
          if (isModalOpen) closeModal()
          break
      }
    },
    [handlePrevious, handleNext, cards.length, scrollToCard, isModalOpen]
  )

  /**
   * Scroll event handler
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

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [updateFocusedIndex, isDragging])

  /**
   * Initial focus
   */
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  /**
   * Touch event handlers with proper passive event handling
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e) => {
      setIsDragging(true)
      dragStartX.current = e.touches?.[0]?.clientX
      scrollStartX.current = container.scrollLeft
      lastMoveTime.current = Date.now()
      lastMoveX.current = dragStartX.current
      velocity.current = 0

      dragStartTime.current = Date.now()
      hasMoved.current = false
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return

      e.preventDefault()
      const currentX = e.touches?.[0]?.clientX
      const deltaX = (dragStartX.current - currentX) * SCROLL_SENSITIVITY

      hasMoved.current = true

      const currentTime = Date.now()
      const timeDelta = currentTime - lastMoveTime.current
      if (timeDelta > 0) {
        velocity.current = (currentX - lastMoveX.current) / timeDelta
      }

      lastMoveTime.current = currentTime
      lastMoveX.current = currentX

      container.scrollLeft = scrollStartX.current + deltaX
    }

    const handleTouchEnd = (e) => {
      if (!isDragging) return

      setIsDragging(false)

      const endX = e.changedTouches?.[0]?.clientX
      const deltaX = dragStartX.current - endX

      if (Math.abs(deltaX) < 5) return

      if (
        Math.abs(deltaX) > SNAP_THRESHOLD ||
        Math.abs(velocity.current) > 0.5
      ) {
        if (deltaX > 0 || velocity.current < -0.5) {
          handleNext()
        } else if (deltaX < 0 || velocity.current > 0.5) {
          handlePrevious()
        }
      } else {
        setTimeout(() => {
          updateFocusedIndex()
          scrollToCard(focusedIndex)
        }, 100)
      }
    }

    // Ajouter les événements tactiles avec les bonnes options
    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

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
   * Mouse wheel support
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        container.scrollLeft += e.deltaY * 2
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  /**
   * Center first and last items on mount
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll(`.${styles.carouselItem}`)
    if (items.length > 0) {
      const itemWidth = items[0].offsetWidth
      const containerWidth = container.clientWidth
      const margin = (containerWidth - itemWidth) / 2

      // Apply margins to first and last items
      items[0].style.marginLeft = `${margin}px`
      items[items.length - 1].style.marginRight = `${margin}px`
    }
  }, [cards])

  return (
    <>
      <div className={styles.carouselWrapper}>
        <div
          ref={containerRef}
          className={`${styles.carouselContainer} allowScroll`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {cardsTitle.map((title, index) => (
            <div
              key={index}
              className={styles.carouselItem}
              aria-selected={index === focusedIndex}
              onClick={(e) => handleCardClick(index, e)}
            >
              {title}
            </div>
          ))}
        </div>

        <div className={styles.navigationWrapper}>
          <div className={styles.navigationBar}>
            <button
              className={`${styles.arrowButton} ${styles.arrowLeft} ${
                !showLeftArrow ? styles.hidden : ''
              }`}
              onClick={handlePrevious}
              aria-label="Projet précédent"
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

            <div className={styles.carouselIndicator}>
              {cards.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${
                    index === focusedIndex ? styles.active : ''
                  }`}
                  onClick={() => scrollToCard(index)}
                  aria-label={`Aller au projet ${index + 1}`}
                />
              ))}
            </div>

            <button
              className={`${styles.arrowButton} ${styles.arrowRight} ${
                !showRightArrow ? styles.hidden : ''
              }`}
              onClick={handleNext}
              aria-label="Projet suivant"
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
      </div>

      {isModalOpen && (
        <div
          className={`${styles.modal} ${styles.modalOpen} allowScroll`}
          onClick={closeModal}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Fermer"
            >
              ×
            </button>
            <div className={styles.modalCard}>{cards[selectedCard]}</div>
          </div>
        </div>
      )}
    </>
  )
}
