import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './projectCarousel.module.scss'

/**
 * ProjectCarousel Component - A horizontal carousel with drag-and-drop,
 * wheel, keyboard navigation, position indicators and arrow navigation
 *
 * @param {Array} cards - Array of elements (React components) to display in the carousel
 * @param {Array} cardsTitle
 */
export default function ProjectCarousel({ cards = [], cardsTitle = [] }) {
  // References and state
  const containerRef = useRef(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const hasReachedEnd = useRef(false)
  const hasReachedStart = useRef(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Nouveaux états pour les flèches
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  /**
   * Updates the index of the card currently in the center of the carousel
   * Calculates which card is closest to the visible center
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

    // Mettre à jour la visibilité des flèches
    setShowLeftArrow(closestIndex > 0)
    setShowRightArrow(closestIndex < cards.length - 1)
  }, [cards.length])

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
   * Navigation avec les flèches
   */
  const handlePrevious = useCallback(() => {
    if (focusedIndex === 0) {
      scrollToCard(cards.length - 1) // Boucle vers la fin
    } else {
      scrollToCard(focusedIndex - 1)
    }
  }, [focusedIndex, cards.length, scrollToCard])

  const handleNext = useCallback(() => {
    if (focusedIndex === cards.length - 1) {
      scrollToCard(0) // Boucle vers le début
    } else {
      scrollToCard(focusedIndex + 1)
    }
  }, [focusedIndex, cards.length, scrollToCard])

  /**
   * Gère le clic sur une carte
   * Ouvre la modal avec la carte sélectionnée
   */
  const handleCardClick = (index, e) => {
    if (
      Math.abs(dragStartX.current - (e.clientX || e.touches?.[0]?.clientX)) > 5
    ) {
      return
    }

    setSelectedCard(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  /**
   * Ferme le modal et réinitialise la carte
   */
  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedCard(null)
      document.body.style.overflow = 'unset'
    }, 300)
  }

  /**
   * Effect to center margins on load
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const firstItem = container.querySelector(`.${styles.carouselItem}`)
    if (firstItem) {
      const margin = (container.clientWidth - firstItem.offsetWidth) / 2
      const items = container.querySelectorAll(`.${styles.carouselItem}`)

      items[0].style.marginLeft = `${margin}px`
      items[items.length - 1].style.marginRight = `${margin}px`
    }
  }, [cards])

  /**
   * Effect to handle scroll event
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        updateFocusedIndex()

        const maxScroll = container.scrollWidth - container.clientWidth
        const currentScroll = container.scrollLeft

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
      }
    },
    [handlePrevious, handleNext, cards.length, scrollToCard]
  )

  /**
   * Start of drag-and-drop (mouse or touch)
   */
  const handlePointerDown = (e) => {
    setIsDragging(true)
    dragStartX.current = e.clientX || e.touches?.[0]?.clientX
    scrollStartX.current = containerRef.current.scrollLeft
    hasReachedEnd.current = false
    hasReachedStart.current = false
  }

  /**
   * Movement during drag-and-drop
   */
  const handlePointerMove = (e) => {
    if (!isDragging) return

    const currentX = e.clientX || e.touches?.[0]?.clientX
    const deltaX = dragStartX.current - currentX
    const container = containerRef.current
    const newScrollLeft = scrollStartX.current + deltaX

    const maxScroll = container.scrollWidth - container.clientWidth

    if (newScrollLeft >= maxScroll) {
      container.scrollLeft = maxScroll
      hasReachedEnd.current = true
    } else if (newScrollLeft <= 0) {
      container.scrollLeft = 0
      hasReachedStart.current = true
    } else {
      container.scrollLeft = newScrollLeft
    }
  }

  /**
   * End of drag-and-drop
   */
  const handlePointerUp = (e) => {
    if (isDragging) {
      const endX = e.clientX || e.changedTouches?.[0]?.clientX
      const deltaX = dragStartX.current - endX

      if (Math.abs(deltaX) < 2) {
        setIsDragging(false)
        return
      }

      setIsDragging(false)

      const velocity = Math.abs(deltaX) / 100
      const swipeThreshold = 5
      const velocityThreshold = 0.1

      if (
        hasReachedEnd.current &&
        deltaX > swipeThreshold &&
        velocity > velocityThreshold
      ) {
        scrollToCard(0)
      } else if (
        hasReachedStart.current &&
        deltaX < -swipeThreshold &&
        velocity > velocityThreshold
      ) {
        scrollToCard(cards.length - 1)
      }

      setTimeout(updateFocusedIndex, 100)
    }
  }

  /**
   * Effect to handle mouse wheel
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault()

        const maxScroll = container.scrollWidth - container.clientWidth
        const currentScroll = container.scrollLeft

        if (currentScroll >= maxScroll - 1 && e.deltaY > 0) {
          scrollToCard(0)
        } else if (currentScroll <= 1 && e.deltaY < 0) {
          scrollToCard(cards.length - 1)
        } else {
          container.scrollLeft = currentScroll + e.deltaY * 120
        }
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [cards.length, scrollToCard])

  /**
   * Effect to handle Escape key for modal
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  return (
    <>
      <div className={styles.carouselWrapper}>
        {/* Main carousel container */}
        <div
          ref={containerRef}
          className={`${styles.carouselContainer} allowScroll`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          {cardsTitle.map((cardsTitle, index) => (
            <div
              key={index}
              className={styles.carouselItem}
              aria-selected={index === focusedIndex}
              onClick={(e) => handleCardClick(index, e)}
            >
              {cardsTitle}
            </div>
          ))}
        </div>

        {/* Indicateur avec flèches intégrées */}
        <div className={styles.navigationWrapper}>
          {/* Flèche gauche */}
          <button
            className={`${styles.arrowButton} ${styles.arrowLeft} ${
              !showLeftArrow ? styles.hidden : ''
            }`}
            onClick={handlePrevious}
            aria-label="Projet précédent"
            disabled={!showLeftArrow && !cards.length}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Indicateur de position */}
          <div className={styles.carouselIndicator}>
            {cards.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === focusedIndex ? styles.active : ''
                }`}
                onClick={() => scrollToCard(index)}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
          </div>

          {/* Flèche droite */}
          <button
            className={`${styles.arrowButton} ${styles.arrowRight} ${
              !showRightArrow ? styles.hidden : ''
            }`}
            onClick={handleNext}
            aria-label="Projet suivant"
            disabled={!showRightArrow && !cards.length}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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

      {/* Modal pour la carte agrandie */}
      {isModalOpen && (
        <div
          className={`${styles.modal} ${isModalOpen ? styles.modalOpen : ''}`}
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
