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
 * ProjectCarousel Component - A horizontal carousel with improved touch navigation
 */
export default function ProjectCarousel({
  cards = [],
  cardsTitle = [],
  autoFocus = true,
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

  // Variables pour le drag
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const lastMoveTime = useRef(Date.now())
  const lastMoveX = useRef(0)
  const velocity = useRef(0)

  // Nouvelles variables pour détecter tap vs swipe
  const dragStartTime = useRef(0)
  const hasMoved = useRef(false)

  // Use focus trap hook
  useFocusTrap(isModalOpen, modalRef)

  const focusCard = useCallback((index, immediate = false) => {
    const targetCard = cardRefs.current[index]
    if (!targetCard) return

    const doFocus = () => {
      // Vérifier que l'élément est toujours focusable
      if (targetCard.tabIndex === 0) {
        targetCard.focus({ preventScroll: true })

        // Vérifier que le focus a bien été appliqué
        if (document.activeElement !== targetCard) {
          // Retry une fois si le focus a échoué
          setTimeout(() => targetCard.focus({ preventScroll: true }), 50)
        }
      }
    }

    if (immediate) {
      doFocus()
    } else {
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        setTimeout(doFocus, 10)
      })
    }
  }, [])

  /**
   * Updates the focused card index
   */
  // 2. Améliorer la gestion des tabIndex en les appliquant immédiatement
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

    // Mettre à jour les tabIndex immédiatement
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
   * Navigation functions
   */
  // 3. Améliorer la navigation avec une meilleure gestion du focus
  const handlePrevious = useCallback(() => {
    const newIndex = focusedIndex > 0 ? focusedIndex - 1 : cards.length - 1

    // Mettre à jour immédiatement le tabIndex
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === newIndex ? 0 : -1
      }
    })

    setFocusedIndex(newIndex)
    scrollToCard(newIndex)

    // Focus immédiat après scroll
    setTimeout(() => {
      focusCard(newIndex, true)
    }, 150)
  }, [focusedIndex, cards.length, scrollToCard, focusCard])

  const handleNext = useCallback(() => {
    const newIndex = focusedIndex < cards.length - 1 ? focusedIndex + 1 : 0

    // Mettre à jour immédiatement le tabIndex
    cardRefs.current.forEach((card, index) => {
      if (card) {
        card.tabIndex = index === newIndex ? 0 : -1
      }
    })

    setFocusedIndex(newIndex)
    scrollToCard(newIndex)

    // Focus immédiat après scroll
    setTimeout(() => {
      focusCard(newIndex, true)
    }, 150)
  }, [focusedIndex, cards.length, scrollToCard, focusCard])

  // 3. Alternative plus simple : créer une fonction séparée pour l'ouverture de modal
  const openModal = (index) => {
    lastFocusedElement.current = cardRefs.current[index]
    setSelectedCard(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'

    // Focus le bouton de fermeture après ouverture
    setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100)
  }

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
  // 5. Modifier handleCardClick pour utiliser openModal aussi
  const handleCardClick = (index, e) => {
    const currentTime = Date.now()
    const timeDelta = currentTime - dragStartTime.current

    const deltaX = Math.abs(
      dragStartX.current - (e.clientX || e.changedTouches?.[0]?.clientX || 0)
    )

    // Conditions strictes pour détecter un vrai tap
    const isRealTap =
      !hasMoved.current && deltaX < 10 && timeDelta < 300 && !isDragging

    if (!isRealTap) return

    openModal(index) // Utiliser la fonction commune
  }

  /**
   * Handle card keyboard interaction
   */
  // 4. Améliorer la gestion des événements clavier
  const handleCardKeyDown = (index, e) => {
    e.stopPropagation()

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openModal(index) // Utiliser directement openModal
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
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

  /**
   * Close modal
   */
  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedCard(null)
      document.body.style.overflow = 'unset'

      // S'assurer que l'élément focusé est toujours focusable
      if (
        lastFocusedElement.current &&
        lastFocusedElement.current.tabIndex === 0
      ) {
        lastFocusedElement.current.focus({ preventScroll: true })
      } else {
        // Fallback: focus sur la carte actuellement focusée
        focusCard(focusedIndex, true)
      }
    }, 300)
  }

  /**
   * Modal keyboard handler
   */
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal()
    }
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
   * Initial focus
   */
  useEffect(() => {
    if (autoFocus && cards.length > 0) {
      // Attendre que tous les éléments soient montés
      const initializeFocus = () => {
        const firstCard = cardRefs.current[0]
        if (firstCard) {
          // S'assurer que le tabIndex est correct
          cardRefs.current.forEach((card, index) => {
            if (card) {
              card.tabIndex = index === 0 ? 0 : -1
            }
          })
          setFocusedIndex(0)
          focusCard(0, true)
        } else {
          // Retry si les éléments ne sont pas encore prêts
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
                    scrollToCard(index)
                    focusCard(index)
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

        {/* Live region pour les lecteurs d'écran */}
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
