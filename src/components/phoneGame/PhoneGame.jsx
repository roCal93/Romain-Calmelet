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

const IMAGES = [
  { id: 1, src: littleWheel, name: 'Little wheel' },
  { id: 2, src: averageWheel, name: 'Average wheel' },
  { id: 3, src: bigWheel, name: 'Big wheel' },
]

function PhoneGame({ backButton }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [slots, setSlots] = useState([null, null, null])
  const [draggedItem, setDraggedItem] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Refs pour les éléments draggables
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
        // Afficher la modal après un court délai
        setTimeout(() => setShowSuccessModal(true), 2000)
      } else {
        setShowError(true)
        setTimeout(() => {
          setSlots([null, null, null])
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
    (imageId) => {
      return slots.includes(imageId)
    },
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
          // Retirer l'image de son emplacement précédent
          const previousIndex = newSlots.indexOf(draggedItem)
          if (previousIndex !== -1) {
            newSlots[previousIndex] = null
          }
          // Placer l'image dans le nouvel emplacement
          newSlots[slotIndex] = draggedItem
          return newSlots
        })
        setDraggedItem(null)
        setIsDragging(false)
      }
    },
    [draggedItem]
  )

  // Gestion du tactile - sans preventDefault direct
  const handleTouchStart = useCallback(
    (e, imageId) => {
      if (isImagePlaced(imageId)) return

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

      // Créer un élément fantôme qui suit le doigt
      const ghostElement = document.getElementById('dragGhost')
      if (ghostElement) {
        ghostElement.style.left = `${touch.clientX - dragOffset.x}px`
        ghostElement.style.top = `${touch.clientY - dragOffset.y}px`
        ghostElement.style.display = 'block'
      } else {
        // Créer l'élément fantôme s'il n'existe pas
        const ghost = document.createElement('div')
        ghost.id = 'dragGhost'
        ghost.style.position = 'fixed'
        ghost.style.left = `${touch.clientX - dragOffset.x}px`
        ghost.style.top = `${touch.clientY - dragOffset.y}px`
        ghost.style.pointerEvents = 'none'
        ghost.style.zIndex = '9999'
        ghost.style.opacity = '0.8'
        ghost.style.transform = 'scale(1.1)'
        ghost.style.transition = 'none'
        ghost.innerHTML = draggedElement.innerHTML
        ghost.className = draggedElement.className
        document.body.appendChild(ghost)
      }

      // Masquer l'élément original
      draggedElement.style.opacity = '0.3'
    },
    [isDragging, touchStart, draggedElement, dragOffset]
  )

  const handleTouchEnd = useCallback(
    (e) => {
      if (!isDragging || !touchStart || draggedItem === null) return

      const touch = e.changedTouches[0]

      // Nettoyer l'élément fantôme
      const ghostElement = document.getElementById('dragGhost')
      if (ghostElement) {
        ghostElement.remove()
      }

      // Restaurer l'opacité de l'élément original
      if (draggedElement) {
        draggedElement.style.opacity = '1'
      }

      // Trouver l'élément sous le doigt
      const elementBelow = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      )
      // Utiliser un attribut data ou une classe CSS constante plutôt que styles.slot
      const slotElement =
        elementBelow?.closest('[data-slot]') || elementBelow?.closest('.slot')

      if (slotElement) {
        const slotIndex = Array.from(slotElement.parentNode.children).indexOf(
          slotElement
        )

        setSlots((prevSlots) => {
          const newSlots = [...prevSlots]
          // Retirer l'image de son emplacement précédent
          const previousIndex = newSlots.indexOf(draggedItem)
          if (previousIndex !== -1) {
            newSlots[previousIndex] = null
          }
          // Placer l'image dans le nouvel emplacement
          newSlots[slotIndex] = draggedItem
          return newSlots
        })
      }

      // Réinitialiser tous les états
      setDraggedItem(null)
      setIsDragging(false)
      setTouchStart(null)
      setDraggedElement(null)
      setDragOffset({ x: 0, y: 0 })
    },
    [isDragging, touchStart, draggedItem, draggedElement]
  )

  // Ajouter les event listeners non-passive pour le tactile
  useEffect(() => {
    const refs = draggableRefs.current.filter(Boolean)

    const handleTouchStartWithPrevent = (imageId) => (e) => {
      if (!isImagePlaced(imageId)) {
        e.preventDefault()
        e.stopPropagation()
        handleTouchStart(e, imageId)
      }
    }

    const handleTouchMoveWithPrevent = (e) => {
      if (isDragging) {
        e.preventDefault()
        e.stopPropagation()
        handleTouchMove(e)
      }
    }

    const handleTouchEndWithPrevent = (e) => {
      if (isDragging) {
        e.preventDefault()
        e.stopPropagation()
        handleTouchEnd(e)
      }
    }

    const listeners = refs
      .map((ref, index) => {
        if (!ref) return null

        const imageId = IMAGES[index].id
        const touchStartHandler = handleTouchStartWithPrevent(imageId)

        ref.addEventListener('touchstart', touchStartHandler, {
          passive: false,
        })
        ref.addEventListener('touchmove', handleTouchMoveWithPrevent, {
          passive: false,
        })
        ref.addEventListener('touchend', handleTouchEndWithPrevent, {
          passive: false,
        })

        return {
          ref,
          touchStartHandler,
          touchMoveHandler: handleTouchMoveWithPrevent,
          touchEndHandler: handleTouchEndWithPrevent,
        }
      })
      .filter(Boolean)

    // Cleanup
    return () => {
      listeners.forEach(
        ({ ref, touchStartHandler, touchMoveHandler, touchEndHandler }) => {
          ref.removeEventListener('touchstart', touchStartHandler)
          ref.removeEventListener('touchmove', touchMoveHandler)
          ref.removeEventListener('touchend', touchEndHandler)
        }
      )
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

  // Nettoyage à la fin du composant
  useEffect(() => {
    return () => {
      // Nettoyer l'élément fantôme si le composant se démonte
      const ghostElement = document.getElementById('dragGhost')
      if (ghostElement) {
        ghostElement.remove()
      }
    }
  }, [])

  // Écran de jeu (directement affiché)
  return (
    <div
      className={`${styles.container} ${isLoaded ? styles.loaded : ''} ${
        isDragging ? styles.dragging : ''
      }`}
    >
      {/* Modal de succès */}
      {showSuccessModal && (
        <PhoneMessage phoneNumber={PHONE_NUMBER} onClose={backButton} />
      )}

      <div className={styles.gameArea}>
        <div className={styles.header}>
          <h3 className={styles.gameTitle}>Séquence Mécanique</h3>
        </div>

        <div className={styles.gameContainer}>
          {/* Zone des emplacements */}
          <div className={styles.slotsContainer}>
            {slots.map((slot, index) => (
              <div
                key={index}
                className={`${styles.slot} ${
                  slot !== null ? styles.filled : ''
                }`}
                data-slot={index}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleSlotClick(index)}
              >
                {slot !== null ? (
                  <img
                    src={getImageById(slot).src}
                    alt={getImageById(slot).name}
                    className={`${styles.slotImage} ${styles[`wheel${slot}`]}`}
                  />
                ) : (
                  <div className={styles.emptySlot}>
                    <span className={styles.slotHint}>Déposez ici</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Indicateur de statut */}
          <div
            className={`${styles.statusBar} ${
              isCompleted ? styles.success : ''
            } ${showError ? styles.error : ''}`}
          >
            {isCompleted
              ? '✓ SÉQUENCE CORRECTE'
              : showError
              ? '✗ MAUVAIS ORDRE - RÉESSAYEZ !'
              : 'TROUVE LE BON ORDRE...'}
          </div>
        </div>
        {/* Images disponibles */}
        <div>
          <div>Roues disponibles :</div>
          <div className={styles.imagesList}>
            {IMAGES.map((image, index) => {
              const placed = isImagePlaced(image.id)
              const isSelected = draggedItem === image.id && !isDragging
              return (
                <div
                  key={image.id}
                  ref={(el) => (draggableRefs.current[index] = el)}
                  className={`${styles.imageItem} ${
                    placed ? styles.placed : ''
                  } ${isSelected ? styles.selected : ''}`}
                  draggable={!placed}
                  onDragStart={(e) => !placed && handleDragStart(e, image.id)}
                  // Les handlers touch sont gérés par useEffect avec { passive: false }
                  onClick={() => !placed && console.log('Image clicked')}
                >
                  <img
                    src={image.src}
                    alt={image.name}
                    className={`${styles.imageIcon} ${
                      styles[`wheel${image.id}`]
                    }`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className={styles.interactionHint}>
        <p>Glissez-déposez les roues dans les emplacements</p>
      </div>
    </div>
  )
}

export default PhoneGame
