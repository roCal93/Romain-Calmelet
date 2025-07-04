import { useEffect, useState, useCallback } from 'react'
import styles from './phoneGame.module.scss'
import littleWheel from '../../assets/img/imgPhoneGame/rouePetite.png'
import averageWheel from '../../assets/img/imgPhoneGame/roueMoyenne.png'
import bigWheel from '../../assets/img/imgPhoneGame/roueGrande.png'
import PhoneMessage from '../phoneMessage/PhoneMessage'

// Constantes
const PHONE_NUMBER = '06 12 34 56 78'
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

  const handleDragStart = useCallback((e, imageId) => {
    setDraggedItem(imageId)
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
      }
    },
    [draggedItem]
  )

  const handleSlotClick = useCallback((slotIndex) => {
    setSlots((prevSlots) => {
      const newSlots = [...prevSlots]
      newSlots[slotIndex] = null
      return newSlots
    })
  }, [])

  const getImageById = useCallback((id) => {
    return IMAGES.find((img) => img.id === id)
  }, [])

  const isImagePlaced = useCallback(
    (imageId) => {
      return slots.includes(imageId)
    },
    [slots]
  )

  // Écran de jeu (directement affiché)
  return (
    <div className={`${styles.container} ${isLoaded ? styles.loaded : ''}`}>
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
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => slot !== null && handleSlotClick(index)}
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
            {IMAGES.map((image) => {
              const placed = isImagePlaced(image.id)
              return (
                <div
                  key={image.id}
                  className={`${styles.imageItem} ${
                    placed ? styles.placed : ''
                  }`}
                  draggable={!placed}
                  onDragStart={(e) => !placed && handleDragStart(e, image.id)}
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
    </div>
  )
}

export default PhoneGame
