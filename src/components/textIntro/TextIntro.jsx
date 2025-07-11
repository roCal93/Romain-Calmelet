import { useEffect, useState } from 'react'
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
const PAUSE_AFTER_WRITE = 1500 // 3 secondes
const PAUSE_AFTER_DELETE = 500

function TextIntro() {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timeout

    const currentText = TEXTS[textIndex]

    if (!isDeleting && displayText === currentText) {
      // Mot complètement écrit, attendre avant d'effacer
      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, PAUSE_AFTER_WRITE)
    } else if (isDeleting && displayText === '') {
      // Mot complètement effacé, passer au suivant
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setTextIndex((prev) => (prev + 1) % TEXTS.length)
      }, PAUSE_AFTER_DELETE)
    } else if (!isDeleting) {
      // En train d'écrire
      timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1))
      }, TYPING_SPEED)
    } else {
      // En train d'effacer
      timeout = setTimeout(() => {
        setDisplayText(displayText.substring(0, displayText.length - 1))
      }, DELETING_SPEED)
    }

    return () => clearTimeout(timeout)
  }, [displayText, textIndex, isDeleting])

  return (
    <div>
      <p>
        Moi, c'est Romain et je suis
        <br />
        <span className={`${styles.typingEffect} ${styles.typingCursor}`}>
          {displayText}
        </span>
      </p>
    </div>
  )
}

export default TextIntro
