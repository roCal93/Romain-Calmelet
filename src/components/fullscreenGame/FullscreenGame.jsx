import { useState, useEffect } from 'react'
import ContactGame from '../contactGame/ContactGame'
import PhoneGame from '../phoneGame/PhoneGame'
import styles from './fullscreenGame.module.scss'
import { useTranslation } from '../../hooks/useTranslation'

// Debounce utility function to limit the rate of function calls
// Improves performance by preventing excessive re-renders during window resize
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const FullscreenGame = ({ gameType, backToMenu }) => {
  const { t } = useTranslation()
  // State to control orientation/screen size warning message
  const [shouldShowMessage, setShouldShowMessage] = useState(false)

  // Handle screen size detection and orientation changes
  useEffect(() => {
    const checkScreenSize = () => {
      // Show message if viewport height is too small for optimal gameplay
      const heightTooSmall = window.innerHeight < 600
      setShouldShowMessage(heightTooSmall)
    }

    // Create debounced version of checkScreenSize for resize events
    // This prevents excessive function calls during window resizing
    const debouncedCheckScreenSize = debounce(checkScreenSize, 250)

    // Check initial screen size on component mount
    checkScreenSize()

    // Add event listeners for screen size changes
    window.addEventListener('resize', debouncedCheckScreenSize)
    window.addEventListener('orientationchange', checkScreenSize) // No debounce needed for orientation change

    // Cleanup function to remove event listeners on unmount
    return () => {
      window.removeEventListener('resize', debouncedCheckScreenSize)
      window.removeEventListener('orientationchange', checkScreenSize)
    }
  }, [])

  // ESC key handling is now managed in the parent Contact component
  // This prevents conflicts and ensures consistent behavior

  return (
    <div className={`${styles.fullGame} allowScroll`}>
      {/* Accessible back button */}
      <button
        onClick={backToMenu}
        className={styles.backButton}
        aria-label="Return to main menu"
        title="Return to menu (Esc)"
      >
        {/* Arrow icon hidden from screen readers as it's decorative */}
        <span aria-hidden="true">←</span>
        {t('fullScreenGame.backButton')}
      </button>

      {/* Conditional rendering based on screen size */}
      {shouldShowMessage ? (
        // Orientation/screen size warning message
        <div className={styles.orientationMessage}>
          <div className={styles.messageContent}>
            <span className={styles.rotateIcon}>📱</span>
            <h2>{t('fullScreenGame.orientationWarning1')}</h2>
            <p>{t('fullScreenGame.orientationWarning2')}</p>
          </div>
        </div>
      ) : (
        // Render appropriate game component based on gameType prop
        <>
          {gameType === 'contact' && <ContactGame />}
          {gameType === 'phone' && <PhoneGame backButton={backToMenu} />}
        </>
      )}
    </div>
  )
}

export default FullscreenGame
