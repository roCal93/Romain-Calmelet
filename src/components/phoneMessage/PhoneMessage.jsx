import { useEffect, useState, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './phoneMessage.module.scss'
import Confetti from 'react-confetti'

/**
 * Custom hook to track window dimensions with debounce
 * @returns {Object} Current window dimensions {width, height}
 */
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    // Create the actual resize handler
    let timeoutId
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 100)
    }

    window.addEventListener('resize', debouncedResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', debouncedResize)
    }
  }, [])

  return dimensions
}

/**
 * Success Modal Component
 * Displays a congratulatory message with confetti when user finds the correct sequence
 *
 * @param {string} phoneNumber - The unlocked phone number to display
 * @param {Function} onClose - Callback function when modal is closed
 */
const SuccessModal = ({ phoneNumber, onClose }) => {
  const { t } = useTranslation()
  const [showContent, setShowContent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  // Use custom hook for window dimensions
  const windowDimension = useWindowDimensions()

  // Handle modal appearance animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle focus management and escape key
  useEffect(() => {
    // Store the previously focused element
    previousActiveElement.current = document.activeElement

    // Focus the modal content
    modalRef.current?.focus()

    // Handle escape key press
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    // Cleanup: restore focus and remove event listener
    return () => {
      document.removeEventListener('keydown', handleEscape)
      previousActiveElement.current?.focus()
    }
  }, [onClose])

  /**
   * Handle phone number copy to clipboard
   * Includes fallback for older browsers
   */
  const handleCopyPhone = async () => {
    try {
      // Modern clipboard API
      await navigator.clipboard.writeText(phoneNumber)
      setCopied(true)
      setError(null)

      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Copy error:', err)

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = phoneNumber
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setCopied(true)
          setError(null)
          setTimeout(() => setCopied(false), 2000)
        } else {
          setError('Unable to copy phone number')
        }
      } catch (fallbackErr) {
        console.error('Fallback copy error:', fallbackErr)
        setError('Unable to copy phone number. Please copy manually.')
      }

      document.body.removeChild(textArea)
    }
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      aria-describedby="success-description"
    >
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={true}
        numberOfPieces={100}
        gravity={0.05}
      />
      <div
        className={`${styles.modalContent} ${showContent ? styles.show : ''}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={modalRef}
      >
        {/* Success icon with checkmark */}
        <div className={styles.successIcon} aria-hidden="true">
          <span className={styles.checkmark}>✓</span>
        </div>

        {/* Success title */}
        <h2 id="success-title" className={styles.congratsTitle}>
          {t('phoneMessage.title')}
        </h2>

        {/* Success description */}
        <p id="success-description" className={styles.congratsText}>
          {t('phoneMessage.text1')}
        </p>

        {/* Phone number reveal section */}
        <div className={styles.phoneReveal}>
          <span className={styles.phoneLabel}>{t('phoneMessage.text2')}</span>
          <div
            className={`${styles.phoneNumberReveal} ${styles.clickable}`}
            onClick={handleCopyPhone}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCopyPhone()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Phone number: ${phoneNumber}. Click to copy`}
            title="Click to copy"
          >
            {phoneNumber}
            {copied && (
              <span className={styles.copiedMessage} aria-live="polite">
                {t('phoneMessage.copyMessage')}
              </span>
            )}
            {error && (
              <span className={styles.errorMessage} aria-live="assertive">
                {error}
              </span>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          className={styles.continueButton}
          onClick={onClose}
          aria-label="Close success modal"
        >
          {t('phoneMessage.closeButton')}
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
