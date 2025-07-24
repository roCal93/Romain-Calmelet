// pages/contact/Contact.jsx
import { useEffect, useState, useContext, useCallback } from 'react'

// Contexts
import { NavigationContext } from '../../contexts/NavigationContext'
import { useTranslation } from '../../hooks/useTranslation'

// Components
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import BackgroundContact from '../../components/backgroundContact/BackgroundContact'
import Footer from '../../components/footer/Footer'
import StaticLogos from '../../components/StaticLogos/StaticLogos'
import GameMenu from '../../components/GameMenu/GameMenu'
import FullscreenGame from '../../components/fullscreenGame/FullscreenGame'
import PhoneDisplay from '../../components/PhoneDisplay/PhoneDisplay'

// Styles
import styles from './contact.module.scss'

// Constants
const EXTERNAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/romain-calmelet/',
  github: 'https://github.com/RoCal93',
}

function Contact() {
  // State management
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)

  // Context
  const { t } = useTranslation()
  const { direction, resetNavigation } = useContext(NavigationContext)

  // Initial setup effect
  useEffect(() => {
    resetNavigation?.()
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [resetNavigation])

  // Browser back button handling for games
  useEffect(() => {
    if (activeGame) {
      // Add a dummy state to history when a game starts
      window.history.pushState({ game: activeGame }, '', window.location.href)

      const handlePopState = (e) => {
        // If going back and a game is active
        if (!e.state?.game && activeGame) {
          setActiveGame(null)
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [activeGame])

  // Handlers
  const startGame = useCallback((gameType) => {
    setActiveGame(gameType)
  }, [])

  // Back to menu handler - handles both button click and ESC key
  const backToMenu = useCallback(() => {
    setActiveGame(null)
    // Only go back in history if there's an actual game history state
    if (window.history.state?.game) {
      window.history.back()
    }
  }, [])

  // Handle ESC key press
  useEffect(() => {
    if (!activeGame) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault() // Prevent any default behavior
        backToMenu() // Use the same function as the button
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeGame, backToMenu])

  // Prevent accidental navigation when game is active
  useEffect(() => {
    if (!activeGame) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = t('contact.leaveGameWarning')
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [activeGame, t])

  // Handle logo clicks
  const handleLogoClick = useCallback((type) => {
    const actions = {
      linkedin: () =>
        window.open(EXTERNAL_LINKS.linkedin, '_blank', 'noopener,noreferrer'),
      github: () =>
        window.open(EXTERNAL_LINKS.github, '_blank', 'noopener,noreferrer'),
      phone: () => setShowPhoneNumber(true),
    }

    actions[type]?.()
  }, [])

  // CSS classes
  const pageClasses = `page-container ${
    isVisible ? `page-enter-${direction === 'down' ? 'down' : 'up'}` : ''
  }`

  return (
    <div className={pageClasses}>
      <BackgroundContact />

      <main className={styles.container} role="main">
        {/* Navigation arrow - hidden when game is active */}
        {!activeGame && (
          <div className={styles.navUp}>
            <ArrowUp aria-label="Navigate to previous section" />
          </div>
        )}

        <article
          className={styles.contactContent}
          aria-labelledby="contact-title"
        >
          {/* Page header */}
          <header className={styles.title}>
            <div className={styles.text}>
              <h1 id="contact-title">{t('contact.title')}</h1>
            </div>
          </header>

          {/* Game area */}
          <section
            className={styles.gameWrapper}
            aria-label="Contact and games section"
          >
            {!activeGame ? (
              <GameMenu startGame={startGame} />
            ) : (
              <FullscreenGame gameType={activeGame} backToMenu={backToMenu} />
            )}
          </section>
        </article>

        {/* Social media logos */}
        <StaticLogos
          activeGame={activeGame}
          handleLogoClick={handleLogoClick}
        />

        {/* Phone number display modal */}
        <PhoneDisplay
          showPhoneNumber={showPhoneNumber}
          setShowPhoneNumber={setShowPhoneNumber}
        />
      </main>

      <Footer />
    </div>
  )
}

export default Contact
