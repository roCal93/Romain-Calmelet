import { useEffect, useState, useCallback } from 'react'
import styles from './textIntro.module.scss'

// Configuration constants for typewriter effect
const TEXTS = [
  'Développeur Web',
  'Intégrateur',
  'Curieux',
  'Inventif',
  'Précis',
]
const TYPING_SPEED = 100 // Speed of typing in milliseconds
const DELETING_SPEED = 50 // Speed of deleting in milliseconds
const PAUSE_AFTER_WRITE = 1500 // Pause duration after writing (1.5 seconds)
const PAUSE_AFTER_DELETE = 500 // Pause duration after deleting

function TextIntro() {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoized typewriter logic to avoid recreating function on each render
  const typeWriter = useCallback(() => {
    const currentText = TEXTS[textIndex]

    if (!isDeleting && displayText === currentText) {
      // Word fully typed, wait before deleting
      return setTimeout(() => {
        setIsDeleting(true)
      }, PAUSE_AFTER_WRITE)
    } else if (isDeleting && displayText === '') {
      // Word fully deleted, move to next word
      return setTimeout(() => {
        setIsDeleting(false)
        setTextIndex((prev) => (prev + 1) % TEXTS.length)
      }, PAUSE_AFTER_DELETE)
    } else if (!isDeleting) {
      // Currently typing
      return setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1))
      }, TYPING_SPEED)
    } else {
      // Currently deleting
      return setTimeout(() => {
        setDisplayText(displayText.substring(0, displayText.length - 1))
      }, DELETING_SPEED)
    }
  }, [displayText, textIndex, isDeleting])

  useEffect(() => {
    const timeout = typeWriter()

    // Cleanup timeout on unmount or dependency change
    return () => clearTimeout(timeout)
  }, [typeWriter])

  return (
    <div>
      <p>
        Moi, c'est Romain et je suis
        <br />
        <span
          className={`${styles.typingEffect} ${styles.typingCursor}`}
          // Accessibility attributes for screen readers
          role="text"
          aria-label={`Liste des qualités: ${TEXTS.join(', ')}`}
          aria-live="polite"
        >
          {displayText}
        </span>
      </p>
    </div>
  )
}

export default TextIntro
