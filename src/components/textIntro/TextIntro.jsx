import { useEffect, useState, useCallback } from 'react'
import styles from './textIntro.module.scss'

const TEXTS = [
  'Développeur Web',
  'Intégrateur',
  'Curieux',
  'Inventif',
  'Précis',
]
const TYPING_SPEED = 100
const DELETING_SPEED = 50
const PAUSE_AFTER_WRITE = 1500
const PAUSE_AFTER_DELETE = 500

function TextIntro() {
  const [displayText, setDisplayText] = useState(TEXTS[0]) // Affiche directement le premier mot
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Lance l’animation après un court délai (pour LCP)
  useEffect(() => {
    const delay = setTimeout(() => {
      setDisplayText('') // Réinitialise pour commencer la dactylo
      setIsAnimating(true)
    }, 3000) // Délai de 3 secondes (ajuste si besoin)

    return () => clearTimeout(delay)
  }, [])

  const typeWriter = useCallback(() => {
    const currentText = TEXTS[textIndex]

    if (!isDeleting && displayText === currentText) {
      return setTimeout(() => {
        setIsDeleting(true)
      }, PAUSE_AFTER_WRITE)
    } else if (isDeleting && displayText === '') {
      return setTimeout(() => {
        setIsDeleting(false)
        setTextIndex((prev) => (prev + 1) % TEXTS.length)
      }, PAUSE_AFTER_DELETE)
    } else if (!isDeleting) {
      return setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1))
      }, TYPING_SPEED)
    } else {
      return setTimeout(() => {
        setDisplayText(displayText.substring(0, displayText.length - 1))
      }, DELETING_SPEED)
    }
  }, [displayText, textIndex, isDeleting])

  useEffect(() => {
    if (!isAnimating) return
    const timeout = typeWriter()
    return () => clearTimeout(timeout)
  }, [typeWriter, isAnimating])

  return (
    <div>
      <p>
        Moi, c'est Romain et je suis
        <br />
        <span
          className={`${styles.typingEffect} ${styles.typingCursor}`}
          role="text"
          aria-label={`Liste des qualités : ${TEXTS.join(', ')}`}
          aria-live="polite"
        >
          {displayText}
        </span>
      </p>
    </div>
  )
}

export default TextIntro
