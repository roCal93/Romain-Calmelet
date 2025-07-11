import { useEffect, useState, useCallback, useRef } from 'react'
import styles from './phoneGame.module.scss'
import littleWheel from '../../assets/img/imgPhoneGame/rouePetite.png'
import averageWheel from '../../assets/img/imgPhoneGame/roueMoyenne.png'
import bigWheel from '../../assets/img/imgPhoneGame/roueGrande.png'
import PhoneMessage from '../phoneMessage/PhoneMessage'

// Constantes
const PHONE_NUMBER = '07 45 22 96 97'
const RESET_DELAY = 2000
const CORRECT_SEQUENCE = [2, 1, 3]
const SLOT_COUNT = 3

const IMAGES = [
  { id: 1, src: littleWheel, name: 'Petite roue' },
  { id: 2, src: averageWheel, name: 'Roue moyenne' },
  { id: 3, src: bigWheel, name: 'Grande roue' },
]

// Utilitaire pour les classes CSS
const classNames = (...classes) => classes.filter(Boolean).join(' ')

// Composant pour un slot individuel
const GameSlot = ({
  index,
  slot,
  onDragOver,
  onDrop,
  onClick,
  getImageById,
  styles,
}) => (
  <div
    className={classNames(styles.slot, 'slot', slot !== null && styles.filled)}
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
        <span className={styles.slotHint}>Déposez ici</span>
      </div>
    )}
  </div>
)

// Composant pour une image draggable
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
    aria-label={`${image.name}${placed ? ' - déjà placée' : ' - disponible'}`}
    onDragStart={(e) => !placed && onDragStart(e, image.id)}
    onKeyDown={(e) =>
      !placed && e.key === 'Enter' && console.log('Image sélectionnée')
    }
  >
    <img
      src={image.src}
      alt={image.name}
      className={classNames(styles.imageIcon, styles[`wheel${image.id}`])}
    />
  </div>
)

// Composant pour la barre de statut
const StatusBar = ({ isCompleted, showError, styles }) => {
  const statusText = isCompleted
    ? '✓ SÉQUENCE CORRECTE'
    : showError
    ? '✗ MAUVAIS ORDRE - RÉESSAYEZ !'
    : 'TROUVEZ LE BON ORDRE...'

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [slots, setSlots] = useState(Array(SLOT_COUNT).fill(null))
  const [draggedItem, setDraggedItem] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const draggableRefs = useRef([])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Vérifier si la séquence est correcte
  useEffect(() => {
    if (slots.every((slot) => slot !== null) && !isCompleted) {
      const isCorrect = slots.every(
        (slot, index) => slot === CORRECT_SEQUENCE[index]
      )

      if (isCorrect) {
        setIsCompleted(true)
        setTimeout(() => setShowSuccessModal(true), 2000)
      } else {
        setShowError(true)
        setTimeout(() => {
          setSlots(Array(SLOT_COUNT).fill(null))
          setShowError(false)
        }, RESET_DELAY)
      }
    }
  }, [slots, isCompleted])

  // Fonctions utilitaires
  const getImageById = useCallback((id) => {
    return IMAGES.find((img) => img.id === id)
  }, [])

  const isImagePlaced = useCallback(
    (imageId) => slots.includes(imageId),
    [slots]
  )

  // Gestion du drag avec la souris
  const handleDragStart = useCallback((e, imageId) => {
    setDraggedItem(imageId)
    setIsDragging(true)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e, slotIndex) => {
      e.preventDefault()
      if (draggedItem !== null) {
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots]
          const previousIndex = newSlots.indexOf(draggedItem)
          if (previousIndex !== -1) {
            newSlots[previousIndex] = null
          }
          newSlots[slotIndex] = draggedItem
          return newSlots
        })
        setDraggedItem(null)
        setIsDragging(false)
      }
    },
    [draggedItem]
  )

  // Gestion du tactile (code simplifié - logique identique)
  const handleTouchStart = useCallback(
    (e, imageId) => {
      if (isImagePlaced(imageId)) {
        e.preventDefault()
        return
      }

      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()

      setTouchStart({ x: touch.clientX, y: touch.clientY })
      setDraggedItem(imageId)
      setIsDragging(true)
      setDraggedElement(e.currentTarget)
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
    },
    [isImagePlaced]
  )

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !touchStart || !draggedElement) return

      const touch = e.touches[0]
      let ghostElement = document.getElementById('dragGhost')

      if (ghostElement) {
        ghostElement.style.left = `${touch.clientX - dragOffset.x}px`
        ghostElement.style.top = `${touch.clientY - dragOffset.y}px`
        ghostElement.style.display = 'block'
      } else {
        ghostElement = document.createElement('div')
        ghostElement.id = 'dragGhost'
        Object.assign(ghostElement.style, {
          position: 'fixed',
          left: `${touch.clientX - dragOffset.x}px`,
          top: `${touch.clientY - dragOffset.y}px`,
          pointerEvents: 'none',
          zIndex: '9999',
          opacity: '0.8',
          transform: 'scale(1.1)',
          transition: 'none',
        })
        ghostElement.innerHTML = draggedElement.innerHTML
        ghostElement.className = draggedElement.className
        document.body.appendChild(ghostElement)
      }

      draggedElement.style.opacity = '0.3'
    },
    [isDragging, touchStart, draggedElement, dragOffset]
  )

  const handleTouchEnd = useCallback(
    (e) => {
      if (!isDragging || !touchStart || draggedItem === null) return

      const touch = e.changedTouches[0]

      // Nettoyage
      const ghostElement = document.getElementById('dragGhost')
      ghostElement?.remove()

      if (draggedElement) {
        draggedElement.style.opacity = '1'
      }

      // Détection du drop
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
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots]
          const previousIndex = newSlots.indexOf(draggedItem)
          if (previousIndex !== -1) {
            newSlots[previousIndex] = null
          }
          newSlots[slotIndex] = draggedItem
          return newSlots
        })
      }

      // Reset
      setDraggedItem(null)
      setIsDragging(false)
      setTouchStart(null)
      setDraggedElement(null)
      setDragOffset({ x: 0, y: 0 })
    },
    [isDragging, touchStart, draggedItem, draggedElement]
  )

  // Event listeners pour le tactile
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
        if (isDragging) {
          e.preventDefault()
          e.stopPropagation()
          handleTouchMove(e)
        }
      },
      touchEnd: (e) => {
        if (isDragging) {
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
    isDragging,
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

  // Cleanup
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
          isDragging && styles.dragging
        )}
      >
        {/* Modal de succès */}
        {showSuccessModal && (
          <PhoneMessage phoneNumber={PHONE_NUMBER} onClose={backButton} />
        )}

        <div className={styles.gameArea}>
          <header className={styles.header}>
            <h1 className={styles.gameTitle}>Séquence Mécanique</h1>
          </header>

          <div className={styles.gameContainer}>
            {/* Zone des emplacements */}
            <div
              className={styles.slotsContainer}
              role="group"
              aria-label="Emplacements pour les roues"
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
                />
              ))}
            </div>

            {/* Barre de statut */}
            <StatusBar
              isCompleted={isCompleted}
              showError={showError}
              styles={styles}
            />
          </div>

          {/* Images disponibles */}
          <section>
            <h2 className="sr-only">Roues disponibles</h2>
            <div aria-label="Roues disponibles">Roues disponibles :</div>
            <div
              className={styles.imagesList}
              role="group"
              aria-label="Liste des roues à placer"
            >
              {IMAGES.map((image, index) => {
                const placed = isImagePlaced(image.id)
                const isCurrentlyDragging =
                  draggedItem === image.id && isDragging

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
            <p>
              Glissez-déposez les roues dans les emplacements, pour changer de
              place une roue cliquez dessus
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneGame
