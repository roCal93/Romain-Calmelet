import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './textIntro.module.scss'

const TYPING_SPEED = 100
const DELETING_SPEED = 50
const PAUSE_AFTER_WRITE = 1500
const PAUSE_AFTER_DELETE = 500

function TextIntro() {
  const { t, language } = useTranslation()

  // Déplacer TEXTS dans useMemo pour qu'il se mette à jour avec la langue
  const TEXTS = useMemo(
    () => [
      t('textIntro.words.developer'),
      t('textIntro.words.integrator'),
      t('textIntro.words.curious'),
      t('textIntro.words.inventive'),
      t('textIntro.words.precision'),
    ],
    [t]
  )

  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Réinitialiser l'animation quand la langue change
  useEffect(() => {
    if (hasStarted) {
      // Réinitialiser l'état quand la langue change
      setDisplayText('')
      setTextIndex(0)
      setIsDeleting(false)
      setIsAnimating(true)
    }
  }, [language, hasStarted])

  // Initialiser avec le premier texte traduit
  useEffect(() => {
    if (TEXTS[0] && !hasStarted) {
      setDisplayText(TEXTS[0])
    }
  }, [TEXTS, hasStarted])

  // Lance l'animation après un court délai (pour LCP)
  useEffect(() => {
    const delay = setTimeout(() => {
      setDisplayText('') // Réinitialise pour commencer la dactylo
      setIsAnimating(true)
      setHasStarted(true)
    }, 3000) // Délai de 3 secondes (ajuste si besoin)

    return () => clearTimeout(delay)
  }, [])

  const typeWriter = useCallback(() => {
    //  Vérifier que TEXTS existe et n'est pas vide
    if (!TEXTS || TEXTS.length === 0) return

    const currentText = TEXTS[textIndex]

    // Vérifier que currentText existe
    if (!currentText) return

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
  }, [displayText, textIndex, isDeleting, TEXTS]) //  Ajouter TEXTS dans les dépendances

  useEffect(() => {
    if (!isAnimating || !TEXTS || TEXTS.length === 0) return
    const timeout = typeWriter()
    return () => clearTimeout(timeout)
  }, [typeWriter, isAnimating, TEXTS])

  return (
    <div>
      <p>
        {t('textIntro.sentence')}
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
