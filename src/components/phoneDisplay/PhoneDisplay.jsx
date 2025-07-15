import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './phoneDisplay.module.scss'

const PhoneDisplay = ({ showPhoneNumber, setShowPhoneNumber }) => {
  const [isExiting, setIsExiting] = useState(false)
  const [copiedItem, setCopiedItem] = useState(null)
  const modalRef = useRef(null)
  const firstFocusableElementRef = useRef(null)
  const lastFocusableElementRef = useRef(null)

  // Handle close with animation - memoized with useCallback
  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setShowPhoneNumber(false)
      setIsExiting(false)
    }, 200)
  }, [setShowPhoneNumber])

  // Copy to clipboard function
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(type)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Copy error:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedItem(type)
        setTimeout(() => setCopiedItem(null), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy error:', fallbackErr)
        setCopiedItem('error')
        setTimeout(() => setCopiedItem(null), 2000)
      }
      document.body.removeChild(textArea)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!showPhoneNumber) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault() // Empêche le comportement par défaut

        const modal = modalRef.current
        if (!modal) return

        const focusableElements = modal.querySelectorAll(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )

        const focusableArray = Array.from(focusableElements)
        const currentIndex = focusableArray.indexOf(document.activeElement)
        let nextIndex

        if (e.shiftKey) {
          // Shift + Tab (navigation vers l'arrière)
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : focusableArray.length - 1
        } else {
          // Tab (navigation vers l'avant)
          nextIndex =
            currentIndex < focusableArray.length - 1 ? currentIndex + 1 : 0
        }

        focusableArray[nextIndex].focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent background scrolling
    document.body.style.overflow = 'hidden'

    // Focus on first focusable element with a slight delay
    setTimeout(() => {
      if (firstFocusableElementRef.current) {
        firstFocusableElementRef.current.focus()
      }
    }, 150)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [showPhoneNumber, handleClose])

  if (!showPhoneNumber) return null

  // Helper function to get screen reader message
  const getScreenReaderMessage = () => {
    if (copiedItem === 'phone')
      return 'Numéro de téléphone copié dans le presse-papier'
    if (copiedItem === 'email')
      return 'Adresse email copiée dans le presse-papier'
    if (copiedItem === 'error') return 'Échec de la copie'
    return ''
  }

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

          <button
            onClick={() => copyToClipboard('0745229697', 'phone')}
            className={styles.contactLink}
            ref={firstFocusableElementRef}
            aria-label="Copier le numéro de téléphone 07 45 22 96 97"
            tabIndex="0"
          >
            <span className={styles.icon}>📞</span>
            <span className={styles.text}>07 45 22 96 97</span>
            {copiedItem === 'phone' && (
              <span className={styles.copiedMessage} aria-hidden="true">
                ✓ Copié !
              </span>
            )}
          </button>

          <button
            onClick={() => copyToClipboard('romaincalmelet@gmail.com', 'email')}
            className={styles.contactLink}
            aria-label="Copier l'adresse email romaincalmelet@gmail.com"
            tabIndex="0"
          >
            <span className={styles.icon}>✉️</span>
            <span className={styles.text}>romaincalmelet@gmail.com</span>
            {copiedItem === 'email' && (
              <span className={styles.copiedMessage} aria-hidden="true">
                ✓ Copié !
              </span>
            )}
          </button>

          {/* Error message for copy failure */}
          {copiedItem === 'error' && (
            <span className={styles.errorMessage} aria-hidden="true">
              ❌ Erreur lors de la copie
            </span>
          )}

          <button
            onClick={handleClose}
            className={styles.closeButton}
            ref={lastFocusableElementRef}
            aria-label="Fermer la fenêtre"
            tabIndex="0"
          >
            Fermer
          </button>
        </div>

        {/* Screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {getScreenReaderMessage()}
        </div>
      </div>
    </div>
  )
}

export default PhoneDisplay
