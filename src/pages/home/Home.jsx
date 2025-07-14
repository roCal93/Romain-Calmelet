import { useEffect, useState, useContext, useCallback } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './home.module.scss'
import BackgroundHome from '../../components/backgroundHome/BackgroundHome'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import TextIntro from '../../components/textIntro/TextIntro'

// Title constants for better maintainability
const TITLES = {
  CASUAL: 'Salut !',
  FORMAL: 'Bonjour,',
}

function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState(TITLES.CASUAL)
  const { direction } = useContext(NavigationContext)

  useEffect(() => {
    // Trigger entrance animation after component mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10) // Small delay to ensure initial render

    return () => clearTimeout(timer)
  }, [])

  // Toggle between casual and formal greeting
  const handleTitleChange = useCallback(() => {
    setTitle((prevTitle) =>
      prevTitle === TITLES.CASUAL ? TITLES.FORMAL : TITLES.CASUAL
    )
  }, [])

  // Get button text based on current title
  const getButtonText = () => {
    return title === TITLES.FORMAL ? 'Je suis chill' : 'Je suis important'
  }

  // Get aria-label for accessibility
  const getButtonAriaLabel = () => {
    return `Changer le message pour ${
      title === TITLES.CASUAL ? 'Bonjour' : 'Salut'
    }`
  }

  return (
    <div
      className={`page-container ${
        isVisible
          ? direction === 'down'
            ? 'page-enter-down'
            : 'page-enter-up'
          : ''
      }`}
    >
      <BackgroundHome />
      <div className={styles.container}>
        {/* Main content section */}
        <div className={styles.intro}>
          <h2>{title}</h2>
          <TextIntro />
        </div>

        {/* Navigation section */}
        <nav className={styles.nav} aria-label="Navigation principale">
          <ArrowDown />
        </nav>

        {/* Action buttons section - semantic HTML instead of aside */}
        <div className={styles.actions}>
          <button
            onClick={handleTitleChange}
            className={styles.button}
            aria-label={getButtonAriaLabel()}
            type="button"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
