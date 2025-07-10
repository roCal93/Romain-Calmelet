import { useEffect, useState, useContext, useCallback } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'

import Footer from '../../components/footer/Footer'
import StaticLogos from '../../components/StaticLogos/StaticLogos'
import GameMenu from '../../components/GameMenu/GameMenu'
import FullscreenGame from '../../components/FullscreenGame/FullscreenGame'
import PhoneDisplay from '../../components/PhoneDisplay/PhoneDisplay'

function Contact() {
  // États
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)
  const [isMouseInGameArea, setIsMouseInGameArea] = useState(false)
  const { direction, resetNavigation } = useContext(NavigationContext)

  // Effets
  useEffect(() => {
    resetNavigation?.()
    setIsVisible(true)

    return () => {
      setIsVisible(false)
    }
  }, [resetNavigation])

  // Fonctions
  const startGame = useCallback((gameType) => {
    setActiveGame(gameType)
  }, [])

  const backToMenu = useCallback(() => {
    setActiveGame(null)
  }, [])

  const handleLogoClick = useCallback((type) => {
    const actions = {
      linkedin: () =>
        window.open(
          'https://www.linkedin.com/in/romain-calmelet/',
          '_blank',
          'noopener,noreferrer'
        ),
      github: () =>
        window.open(
          'https://github.com/RoCal93',
          '_blank',
          'noopener,noreferrer'
        ),
      phone: () => {
        setShowPhoneNumber(true)
      },
    }

    actions[type]?.()
  }, [])

  // Rendu principal
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
      <main className={styles.container} role="main">
        {!activeGame && (
          <div className={styles.navUp}>
            <ArrowUp aria-label="Naviguer vers la section précédente" />
          </div>
        )}

        <article
          className={styles.contactContent}
          aria-labelledby="contact-title"
        >
          <header className={styles.title}>
            <div className={styles.text}>
              <h1 id="contact-title">Contactez-moi</h1>
            </div>
          </header>

          <section
            className={`${styles.gameWrapper} ${
              isMouseInGameArea ? 'allowScroll' : ''
            }`}
            onMouseEnter={() => setIsMouseInGameArea(true)}
            onMouseLeave={() => setIsMouseInGameArea(false)}
            aria-label="Zone de jeu et contact"
          >
            {!activeGame && <GameMenu startGame={startGame} />}
            {activeGame && (
              <FullscreenGame gameType={activeGame} backToMenu={backToMenu} />
            )}
          </section>
        </article>

        {/* Logos statiques (toujours visibles sauf en mode jeu) */}
        <StaticLogos
          activeGame={activeGame}
          handleLogoClick={handleLogoClick}
        />

        {/* Affichage du numéro de téléphone et email */}
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
