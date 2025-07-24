import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './phoneGame.module.scss'
import littleWheel from '../../assets/img/imgPhoneGame/rouePetite.png'
import averageWheel from '../../assets/img/imgPhoneGame/roueMoyenne.png'
import bigWheel from '../../assets/img/imgPhoneGame/roueGrande.png'
import PhoneMessage from '../phoneMessage/PhoneMessage'

// Constants
const RESET_DELAY = 2000
const CORRECT_SEQUENCE = [2, 1, 3]
const SLOT_COUNT = 3

const IMAGES = [
  { id: 1, src: littleWheel, name: 'Petite roue' },
  { id: 2, src: averageWheel, name: 'Roue moyenne' },
  { id: 3, src: bigWheel, name: 'Grande roue' },
]

// Utility for CSS classes
const classNames = (...classes) => classes.filter(Boolean).join(' ')

// Individual slot component
const GameSlot = ({
  index,
  slot,
  onDragOver,
  onDrop,
  onClick,
  getImageById,
  styles,
  isDragOver,
}) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        styles.slot,
        'slot',
        slot !== null && styles.filled,
        isDragOver && styles.dragOver
      )}
      data-slot={index}
      role="button"
      tabIndex={0}
      aria-label={`Emplacement ${index + 1}${
        slot ? ` contenant ${getImageById(slot).name}` : ' vide'
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onClick={() => onClick(index)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(index)}
    >
      {slot !== null ? (
        <img
          src={getImageById(slot).src}
          alt={getImageById(slot).name}
          className={classNames(styles.slotImage, styles[`wheel${slot}`])}
        />
      ) : (
        <div className={styles.emptySlot}>
          <span className={styles.slotHint}>{t('phoneGame.slotHint')}</span>
        </div>
      )}
    </div>
  )
}

// Draggable image component
const DraggableImage = ({
  image,
  index,
  placed,
  isCurrentlyDragging,
  onDragStart,
  draggableRefs,
  styles,
}) => (
  <div
    ref={(el) => (draggableRefs.current[index] = el)}
    className={classNames(
      styles.imageItem,
      placed && styles.placed,
      isCurrentlyDragging && styles.dragging
    )}
    draggable={!placed}
    role="button"
    tabIndex={placed ? -1 : 0}
    aria-label={`${image.name}${
      placed ? ' - already placed' : ' - available to drag'
    }`}
    onDragStart={(e) => !placed && onDragStart(e, image.id)}
    onKeyDown={(e) =>
      !placed && e.key === 'Enter' && console.log('image selected')
    }
    style={{
      touchAction: 'manipulation',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
    }}
  >
    <img
      src={image.src}
      alt={image.name}
      className={classNames(styles.imageIcon, styles[`wheel${image.id}`])}
    />
  </div>
)

// Status bar component
const StatusBar = ({ isCompleted, showError, styles }) => {
  const { t } = useTranslation()
  const statusText = isCompleted
    ? t('phoneGame.correctSequence')
    : showError
    ? t('phoneGame.incorrectSequence')
    : t('phoneGame.sequenceHint')

  return (
    <div
      className={classNames(
        styles.statusBar,
        isCompleted && styles.success,
        showError && styles.error
      )}
      role="status"
      aria-live="polite"
    >
      {statusText}
    </div>
  )
}

function PhoneGame({ backButton }) {
  const { t } = useTranslation()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [slots, setSlots] = useState(Array(SLOT_COUNT).fill(null))
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  // Grouped drag state for better management
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    draggedElement: null,
    touchStart: null,
    dragOffset: { x: 0, y: 0 },
  })

  const draggableRefs = useRef([])

  // Utility function to reset drag state
  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedElement: null,
      touchStart: null,
      dragOffset: { x: 0, y: 0 },
    })
    setDragOverSlot(null)
  }, [])

  // Provide haptic feedback (if supported)
  const provideHapticFeedback = useCallback((type) => {
    if ('vibrate' in navigator) {
      if (type === 'success') {
        // Success pattern: short-pause-short
        navigator.vibrate([100, 50, 100])
      } else if (type === 'error') {
        // Error: single longer vibration
        navigator.vibrate(200)
      } else if (type === 'drop') {
        // Drop feedback: very short vibration
        navigator.vibrate(50)
      }
    }
  }, [])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Enhanced cleanup for ghost elements
  useEffect(() => {
    return () => {
      // Remove all possible ghost elements
      document.querySelectorAll('#dragGhost').forEach((el) => el.remove())
      // Reset drag state on unmount
      resetDragState()
    }
  }, [resetDragState])

  // Memoize placed images for performance
  const placedImages = useMemo(
    () => new Set(slots.filter((slot) => slot !== null)),
    [slots]
  )

  // Check sequence when slots change
  useEffect(() => {
    if (slots.every((slot) => slot !== null) && !isCompleted) {
      const isCorrect = slots.every(
        (slot, index) => slot === CORRECT_SEQUENCE[index]
      )

      if (isCorrect) {
        setIsCompleted(true)
        provideHapticFeedback('success')
        setTimeout(() => setShowSuccessModal(true), 2000)
      } else {
        setShowError(true)
        provideHapticFeedback('error')
        setTimeout(() => {
          setSlots(Array(SLOT_COUNT).fill(null))
          setShowError(false)
        }, RESET_DELAY)
      }
    }
  }, [slots, isCompleted, provideHapticFeedback])

  // Utility functions
  const getImageById = useCallback((id) => {
    return IMAGES.find((img) => img.id === id)
  }, [])

  // Optimized image placement check
  const isImagePlaced = useCallback(
    (imageId) => placedImages.has(imageId),
    [placedImages]
  )

  // Mouse drag handlers
  const handleDragStart = useCallback((e, imageId) => {
    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      draggedItem: imageId,
    }))
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    const slotElement = e.currentTarget.closest('[data-slot]')
    if (slotElement) {
      const slotIndex = parseInt(slotElement.dataset.slot)
      setDragOverSlot(slotIndex)
    }
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null)
  }, [])

  const handleDrop = useCallback(
    (e, slotIndex) => {
      e.preventDefault()
      setDragOverSlot(null)

      if (dragState.draggedItem !== null) {
        provideHapticFeedback('drop')
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots]
          const previousIndex = newSlots.indexOf(dragState.draggedItem)
          if (previousIndex !== -1) {
            newSlots[previousIndex] = null
          }
          newSlots[slotIndex] = dragState.draggedItem
          return newSlots
        })
        resetDragState()
      }
    },
    [dragState.draggedItem, resetDragState, provideHapticFeedback]
  )

  // Touch handlers with inline error handling
  const handleTouchStart = useCallback(
    (e, imageId) => {
      try {
        if (isImagePlaced(imageId)) {
          e.preventDefault()
          return
        }

        const touch = e.touches[0]
        const rect = e.currentTarget.getBoundingClientRect()

        setDragState({
          isDragging: true,
          draggedItem: imageId,
          draggedElement: e.currentTarget,
          touchStart: { x: touch.clientX, y: touch.clientY },
          dragOffset: {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          },
        })
      } catch (error) {
        console.error('Touch start error:', error)
        resetDragState()
      }
    },
    [isImagePlaced, resetDragState]
  )

  const handleTouchMove = useCallback(
    (e) => {
      try {
        if (
          !dragState.isDragging ||
          !dragState.touchStart ||
          !dragState.draggedElement
        )
          return

        const touch = e.touches[0]
        let ghostElement = document.getElementById('dragGhost')

        if (ghostElement) {
          ghostElement.style.left = `${
            touch.clientX - dragState.dragOffset.x
          }px`
          ghostElement.style.top = `${touch.clientY - dragState.dragOffset.y}px`
          ghostElement.style.display = 'block'
        } else {
          ghostElement = document.createElement('div')
          ghostElement.id = 'dragGhost'
          Object.assign(ghostElement.style, {
            position: 'fixed',
            left: `${touch.clientX - dragState.dragOffset.x}px`,
            top: `${touch.clientY - dragState.dragOffset.y}px`,
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.8',
            transform: 'scale(1.1)',
            transition: 'none',
          })
          ghostElement.innerHTML = dragState.draggedElement.innerHTML
          ghostElement.className = dragState.draggedElement.className
          document.body.appendChild(ghostElement)
        }

        dragState.draggedElement.style.opacity = '0.3'

        // Check for drag over slot
        const elementBelow = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        )
        const slotElement = elementBelow?.closest('[data-slot]')
        if (slotElement) {
          const slotIndex = parseInt(slotElement.dataset.slot)
          setDragOverSlot(slotIndex)
        } else {
          setDragOverSlot(null)
        }
      } catch (error) {
        console.error('Touch move error:', error)
        resetDragState()
      }
    },
    [dragState, resetDragState]
  )

  const handleTouchEnd = useCallback(
    (e) => {
      try {
        if (
          !dragState.isDragging ||
          !dragState.touchStart ||
          dragState.draggedItem === null
        )
          return

        const touch = e.changedTouches[0]

        // Cleanup ghost element
        const ghostElement = document.getElementById('dragGhost')
        ghostElement?.remove()

        if (dragState.draggedElement) {
          dragState.draggedElement.style.opacity = '1'
        }

        // Detect drop target
        const elementBelow = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        )
        const slotElement =
          elementBelow?.closest('[data-slot]') || elementBelow?.closest('.slot')

        if (slotElement) {
          const slotIndex = Array.from(slotElement.parentNode.children).indexOf(
            slotElement
          )
          provideHapticFeedback('drop')
          setSlots((prevSlots) => {
            const newSlots = [...prevSlots]
            const previousIndex = newSlots.indexOf(dragState.draggedItem)
            if (previousIndex !== -1) {
              newSlots[previousIndex] = null
            }
            newSlots[slotIndex] = dragState.draggedItem
            return newSlots
          })
        }

        // Reset all drag state
        resetDragState()
      } catch (error) {
        console.error('Touch end error:', error)
        resetDragState()
      }
    },
    [dragState, resetDragState, provideHapticFeedback]
  )

  // Touch event listeners
  useEffect(() => {
    const refs = draggableRefs.current.filter(Boolean)

    const createTouchHandlers = (imageId) => ({
      touchStart: (e) => {
        if (!isImagePlaced(imageId)) {
          e.preventDefault()
          e.stopPropagation()
          handleTouchStart(e, imageId)
        }
      },
      touchMove: (e) => {
        if (dragState.isDragging) {
          e.preventDefault()
          e.stopPropagation()
          handleTouchMove(e)
        }
      },
      touchEnd: (e) => {
        if (dragState.isDragging) {
          e.preventDefault()
          e.stopPropagation()
          handleTouchEnd(e)
        }
      },
    })

    const listeners = refs
      .map((ref, index) => {
        if (!ref) return null

        const imageId = IMAGES[index].id
        const handlers = createTouchHandlers(imageId)

        ref.addEventListener('touchstart', handlers.touchStart, {
          passive: false,
        })
        ref.addEventListener('touchmove', handlers.touchMove, {
          passive: false,
        })
        ref.addEventListener('touchend', handlers.touchEnd, { passive: false })

        return { ref, handlers }
      })
      .filter(Boolean)

    return () => {
      listeners.forEach(({ ref, handlers }) => {
        ref.removeEventListener('touchstart', handlers.touchStart)
        ref.removeEventListener('touchmove', handlers.touchMove)
        ref.removeEventListener('touchend', handlers.touchEnd)
      })
    }
  }, [
    dragState.isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isImagePlaced,
  ])

  const handleSlotClick = useCallback((slotIndex) => {
    setSlots((prevSlots) => {
      const newSlots = [...prevSlots]
      newSlots[slotIndex] = null
      return newSlots
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const ghostElement = document.getElementById('dragGhost')
      ghostElement?.remove()
    }
  }, [])

  return (
    <div className={styles.scrollWrapper}>
      <div
        className={classNames(
          styles.container,
          isLoaded && styles.loaded,
          dragState.isDragging && styles.dragging
        )}
        style={{
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Success modal */}
        {showSuccessModal && (
          <PhoneMessage
            phoneNumber={t('phoneGame.phoneNumber')}
            onClose={backButton}
          />
        )}

        <div className={styles.gameArea}>
          <header className={styles.header}>
            <h1 className={styles.gameTitle}>Séquence Mécanique</h1>
          </header>

          <div className={styles.gameContainer}>
            {/* Slots container */}
            <div
              className={styles.slotsContainer}
              role="group"
              aria-label="Slots for placing wheels"
              onDragLeave={handleDragLeave}
            >
              {slots.map((slot, index) => (
                <GameSlot
                  key={index}
                  index={index}
                  slot={slot}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleSlotClick}
                  getImageById={getImageById}
                  styles={styles}
                  isDragOver={dragOverSlot === index}
                />
              ))}
            </div>

            {/* Status bar */}
            <StatusBar
              isCompleted={isCompleted}
              showError={showError}
              styles={styles}
            />
          </div>

          {/* Available images */}
          <section>
            <h2 className="sr-only">{t('phoneGame.availableWheels')}</h2>
            <div aria-label="Wheels available">
              {t('phoneGame.availableWheels')}
            </div>
            <div
              className={styles.imagesList}
              role="group"
              aria-label="List of draggable wheels"
            >
              {IMAGES.map((image, index) => {
                const placed = isImagePlaced(image.id)
                const isCurrentlyDragging =
                  dragState.draggedItem === image.id && dragState.isDragging

                return (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    index={index}
                    placed={placed}
                    isCurrentlyDragging={isCurrentlyDragging}
                    onDragStart={handleDragStart}
                    draggableRefs={draggableRefs}
                    styles={styles}
                  />
                )
              })}
            </div>
          </section>

          <div className={styles.interactionHint}>
            <p>{t('phoneGame.interactionHint')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneGame
