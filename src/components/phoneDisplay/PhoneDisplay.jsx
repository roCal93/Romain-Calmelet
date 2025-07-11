import { useEffect, useRef, useState } from 'react'
import styles from './phoneDisplay.module.scss'

const PhoneDisplay = ({ showPhoneNumber, setShowPhoneNumber }) => {
  const [isExiting, setIsExiting] = useState(false)
  const modalRef = useRef(null)
  const firstFocusableElementRef = useRef(null)

  // Gestion de la fermeture avec animation
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setShowPhoneNumber(false)
      setIsExiting(false)
    }, 200)
  }

  // Gestion de la touche Echap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (showPhoneNumber) {
      document.addEventListener('keydown', handleEscape)
      // Empêcher le scroll en arrière-plan
      document.body.style.overflow = 'hidden'

      // Focus sur le premier élément focusable
      setTimeout(() => {
        if (firstFocusableElementRef.current) {
          firstFocusableElementRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [showPhoneNumber])

  // Gestion du focus trap
  useEffect(() => {
    if (!showPhoneNumber) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [showPhoneNumber])

  if (!showPhoneNumber) return null

  return (
    <div
      className={`${styles.phoneDisplay} ${isExiting ? styles.exiting : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleClose}
    >
      <div
        className={styles.phoneModal}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.phoneContent}>
          <h3 id="modal-title">Mes coordonnées</h3>

          <a
            href="tel:+33745229697"
            className={styles.contactLink}
            ref={firstFocusableElementRef}
            aria-label="Appeler le 07 45 22 96 97"
          >
            <span className={styles.icon}>📞</span>
            <span className={styles.text}>07 45 22 96 97</span>
          </a>

          <a
            href="mailto:romaincalmelet@gmail.com"
            className={styles.contactLink}
            aria-label="Envoyer un email à romaincalmelet@gmail.com"
          >
            <span className={styles.icon}>✉️</span>
            <span className={styles.text}>romaincalmelet@gmail.com</span>
          </a>

          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Fermer la modal"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhoneDisplay
