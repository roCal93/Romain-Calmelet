import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './projectCarousel.module.scss'

const SCROLL_SENSITIVITY = 2
const SNAP_THRESHOLD = 50

/**
 * Custom hook pour le focus trap dans le modal
 */
const useFocusTrap = (isActive, modalRef) => {
  useEffect(() => {
    if (!isActive) return

    const handleTab = (e) => {
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

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
 * ProjectCarousel Component - A horizontal carousel with improved focus management
 */
export default function ProjectCarousel({
  cards = [],
  cardsTitle = [],
  autoFocus = false, // Désactivé par défaut
}) {
  const containerRef = useRef(null)
  const cardRefs = useRef([])
  const modalRef = useRef(null)
  const lastFocusedElement = useRef(null)
  const closeButtonRef = useRef(null)

  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Nouveau state pour tracker si on navigue au clavier
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)

  // Variables pour le drag
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const lastMoveTime = useRef(Date.now())
  const lastMoveX = useRef(0)
  const velocity = useRef(0)
  const dragStartTime = useRef(0)
  const hasMoved = useRef(false)

  // Use focus trap hook
  useFocusTrap(isModalOpen, modalRef)

  // Fonction focus améliorée - seulement si navigation clavier
  const focusCard = useCallback(
    (index, force = false) => {
      if (!force && !isKeyboardNavigation) return

      const targetCard = cardRefs.current[index]
      if (!targetCard) return

      const doFocus = () => {
        if (targetCard.tabIndex === 0) {
          targetCard.focus({ preventScroll: true })
          if (document.activeElement !== targetCard) {
            setTimeout(() => targetCard.focus({ preventScroll: true }), 50)
          }
        }
      }

      requestAnimationFrame(() => {
        setTimeout(doFocus, 10)
      })
    },
    [isKeyboardNavigation]
  )

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

    // Mettre à jour les tabIndex
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
   * Navigation functions - sans focus automatique
   */
  const handlePrevious = useCallback(() => {
    setIsKeyboardNavigation(false) // Reset keyboard navigation flag
    const newIndex = focusedIndex > 0 ? focusedIndex - 1 : cards.length - 1

    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === newIndex ? 0 : -1
      }
    })

    setFocusedIndex(newIndex)
    scrollToCard(newIndex)
    // Pas de focus automatique ici
  }, [focusedIndex, cards.length, scrollToCard])

  const handleNext = useCallback(() => {
    setIsKeyboardNavigation(false) // Reset keyboard navigation flag
    const newIndex = focusedIndex < cards.length - 1 ? focusedIndex + 1 : 0

    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === newIndex ? 0 : -1
      }
    })

    setFocusedIndex(newIndex)
    scrollToCard(newIndex)
    // Pas de focus automatique ici
  }, [focusedIndex, cards.length, scrollToCard])

  const openModal = (index) => {
    lastFocusedElement.current = cardRefs.current[index]
    setSelectedCard(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'

    // Focus automatique seulement si navigation clavier active
    if (isKeyboardNavigation) {
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    }
  }

  /**
   * Handle touch/mouse interactions
   */
  const handlePointerDown = (e) => {
    setIsDragging(true)
    setIsKeyboardNavigation(false) // Reset keyboard navigation
    dragStartX.current = e.clientX || e.touches?.[0]?.clientX
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

  const handlePointerMove = (e) => {
    if (!isDragging) return

    if (e.cancelable) {
      e.preventDefault()
    }

    const currentX = e.clientX || e.touches?.[0]?.clientX
    const deltaX = (dragStartX.current - currentX) * SCROLL_SENSITIVITY

    hasMoved.current = true

    const currentTime = Date.now()
    const timeDelta = currentTime - lastMoveTime.current
    if (timeDelta > 0) {
      velocity.current = (currentX - lastMoveX.current) / timeDelta
    }

    lastMoveTime.current = currentTime
    lastMoveX.current = currentX

    containerRef.current.scrollLeft = scrollStartX.current + deltaX
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return

    setIsDragging(false)

    const endX = e.clientX || e.changedTouches?.[0]?.clientX
    const deltaX = dragStartX.current - endX

    if (Math.abs(deltaX) < 5) return

    if (Math.abs(deltaX) > SNAP_THRESHOLD || Math.abs(velocity.current) > 0.5) {
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

  const handleCardClick = (index, e) => {
    const currentTime = Date.now()
    const timeDelta = currentTime - dragStartTime.current

    const deltaX = Math.abs(
      dragStartX.current - (e.clientX || e.changedTouches?.[0]?.clientX || 0)
    )

    const isRealTap =
      !hasMoved.current && deltaX < 10 && timeDelta < 300 && !isDragging

    if (!isRealTap) return

    openModal(index)
  }

  /**
   * Handle card keyboard interaction - avec focus approprié
   */
  const handleCardKeyDown = (index, e) => {
    e.stopPropagation()
    setIsKeyboardNavigation(true) // Marquer comme navigation clavier

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openModal(index)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevious()
      // Focus seulement pour navigation clavier
      setTimeout(
        () =>
          focusCard(
            focusedIndex > 0 ? focusedIndex - 1 : cards.length - 1,
            true
          ),
        150
      )
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
      // Focus seulement pour navigation clavier
      setTimeout(
        () =>
          focusCard(
            focusedIndex < cards.length - 1 ? focusedIndex + 1 : 0,
            true
          ),
        150
      )
    } else if (e.key === 'Home') {
      e.preventDefault()
      cardRefs.current.forEach((card, i) => {
        if (card) card.tabIndex = i === 0 ? 0 : -1
      })
      setFocusedIndex(0)
      scrollToCard(0)
      setTimeout(() => focusCard(0, true), 150)
    } else if (e.key === 'End') {
      e.preventDefault()
      const lastIndex = cards.length - 1
      cardRefs.current.forEach((card, i) => {
        if (card) card.tabIndex = i === lastIndex ? 0 : -1
      })
      setFocusedIndex(lastIndex)
      scrollToCard(lastIndex)
      setTimeout(() => focusCard(lastIndex, true), 150)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedCard(null)
      document.body.style.overflow = 'unset'

      if (
        lastFocusedElement.current &&
        lastFocusedElement.current.tabIndex === 0
      ) {
        lastFocusedElement.current.focus({ preventScroll: true })
      }
    }, 300)
  }

  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  // Gestion du focus sur les interactions directes avec les éléments
  const handleCardFocus = (index) => {
    setIsKeyboardNavigation(true)
    setFocusedIndex(index)
    scrollToCard(index)
  }

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
   * Initial focus - seulement si autoFocus est activé
   */
  useEffect(() => {
    if (autoFocus && cards.length > 0) {
      const initializeFocus = () => {
        const firstCard = cardRefs.current[0]
        if (firstCard) {
          cardRefs.current.forEach((card, index) => {
            if (card) {
              card.tabIndex = index === 0 ? 0 : -1
            }
          })
          setFocusedIndex(0)
          setIsKeyboardNavigation(true)
          focusCard(0, true)
        } else {
          setTimeout(initializeFocus, 50)
        }
      }

      requestAnimationFrame(initializeFocus)
    }
  }, [autoFocus, cards.length, focusCard])

  /**
   * Update tabindex when focused index changes
   */
  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === focusedIndex ? 0 : -1
      }
    })
  }, [focusedIndex])

  /**
   * Touch event handlers
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e) => {
      setIsDragging(true)
      setIsKeyboardNavigation(false)
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
        setIsKeyboardNavigation(false)
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

      items[0].style.marginLeft = `${margin}px`
      items[items.length - 1].style.marginRight = `${margin}px`
    }
  }, [cards])

  return (
    <>
      <div className={styles.carouselWrapper}>
        <div
          ref={containerRef}
          className={styles.carouselContainer}
          role="region"
          aria-label="Carousel de projets"
          aria-roledescription="carousel"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        >
          {cardsTitle.map((title, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={styles.carouselItem}
              role="button"
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-label={`Projet ${index + 1}: ${title}`}
              aria-selected={index === focusedIndex}
              onClick={(e) => handleCardClick(index, e)}
              onKeyDown={(e) => handleCardKeyDown(index, e)}
              onFocus={() => handleCardFocus(index)}
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

            <div className={styles.carouselIndicator} role="tablist">
              {cards.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={index === focusedIndex}
                  aria-label={`Aller au projet ${index + 1} sur ${
                    cards.length
                  }`}
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

            <button
              className={`${styles.arrowButton} ${styles.arrowRight} ${
                !showRightArrow ? styles.hidden : ''
              }`}
              onClick={handleNext}
              aria-label="Projet suivant"
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

        <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          Projet {focusedIndex + 1} sur {cards.length}
        </div>
      </div>

      {isModalOpen && (
        <div
          ref={modalRef}
          className={`${styles.modal} ${styles.modalOpen} allowScroll`}
          onClick={closeModal}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={`Détails du projet ${selectedCard + 1}`}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Fermer la fenêtre modale"
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
