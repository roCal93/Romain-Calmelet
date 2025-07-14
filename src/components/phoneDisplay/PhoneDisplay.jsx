import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './phoneDisplay.module.scss'

const PhoneDisplay = ({ showPhoneNumber, setShowPhoneNumber }) => {
  const [isExiting, setIsExiting] = useState(false)
  const [copiedItem, setCopiedItem] = useState(null) // To display copy feedback
  const modalRef = useRef(null)
  const firstFocusableElementRef = useRef(null)

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
      // Remove message after 2 seconds
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

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (showPhoneNumber) {
      document.addEventListener('keydown', handleEscape)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'

      // Focus on first focusable element
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
  }, [showPhoneNumber, handleClose]) // Added handleClose to dependencies

  // Focus trap management
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

  // Helper function to get screen reader message
  const getScreenReaderMessage = () => {
    if (copiedItem === 'phone')
      return 'Numéro de téléphone copié dans le presse-papier'
    if (copiedItem === 'email')
      return 'Adresse email copiée dans le presse-papier' // Fixed: "copier" -> "copiée"
    if (copiedItem === 'error') return 'Échec de la copie' // Fixed: "Echec du Copier" -> "Échec de la copie"
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
            aria-label="Copier le numéro de téléphone 07 45 22 96 97" // Fixed: "Copier le téléphone" -> "Copier le numéro de téléphone"
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
            aria-label="Copier l'adresse email romaincalmelet@gmail.com" // Fixed: "Email" -> "email" (consistency)
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
            aria-label="Fermer la fenêtre" // Fixed: "Close modal" -> "Fermer la fenêtre" (consistency with French)
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
