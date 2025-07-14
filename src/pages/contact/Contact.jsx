import { useEffect, useState, useContext, useCallback } from 'react'

// Contexts
import { NavigationContext } from '../../app/navigationContext'

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
  // États
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)

  // Context
  const { direction, resetNavigation } = useContext(NavigationContext)

  // Effets
  useEffect(() => {
    resetNavigation?.()
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [resetNavigation])

  // Gestion du bouton retour du navigateur pour les jeux
  useEffect(() => {
    if (!activeGame) return

    // Fonction pour gérer le retour
    const handlePopState = (e) => {
      // Si un jeu est actif, fermer le jeu au lieu de naviguer
      if (activeGame) {
        e.preventDefault()
        setActiveGame(null)
      }
    }

    // Ajouter un listener pour le bouton retour
    window.addEventListener('popstate', handlePopState)

    // Nettoyer
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [activeGame])

  // Gestion de la touche Échap
  useEffect(() => {
    if (!activeGame) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeGame) {
        setActiveGame(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeGame])

  // Bloquer la navigation accidentelle quand un jeu est actif
  useEffect(() => {
    if (!activeGame) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Êtes-vous sûr de vouloir quitter le jeu ?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [activeGame])

  // Handlers
  const startGame = useCallback((gameType) => {
    setActiveGame(gameType)
  }, [])

  const backToMenu = useCallback(() => {
    setActiveGame(null)
  }, [])

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

  // Classes CSS
  const pageClasses = `page-container ${
    isVisible ? `page-enter-${direction === 'down' ? 'down' : 'up'}` : ''
  }`

  return (
    <div className={pageClasses}>
      <BackgroundContact />

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
            className={styles.gameWrapper}
            aria-label="Zone de jeu et contact"
          >
            {!activeGame ? (
              <GameMenu startGame={startGame} />
            ) : (
              <FullscreenGame gameType={activeGame} backToMenu={backToMenu} />
            )}
          </section>
        </article>

        <StaticLogos
          activeGame={activeGame}
          handleLogoClick={handleLogoClick}
        />

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
